import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { Agent, Project } from '@agentlabs/node-sdk';
import { uuidGeneratorTool } from './tools/uuid-generator.tool';
import { RegisterNewPlayer } from '@players/features/register-new-player';
import { AddPlayersInBuddiesGroup } from '@players/features/add-players-in-buddies-group';
import { CreateBuddiesGroup } from '@players/features/create-buddies-group';
import { FindPlayers } from '@players/features/find-players';
import { GetPlayerBuddiesGroups } from '@players/features/get-player-buddies-groups';
import * as playerTools from './tools/player-tools';
import * as matchTools from './tools/match-tools';
import { StartMatch } from '@matches/features/start-match';
import { ScoreGoal } from '@matches/features/score-goal';
import { HalfTime } from '@matches/features/half-time';
import { EndMatch } from '@matches/features/end-match';
import { GetCurrentMatchOf } from '@matches/features/get-current-match';
import { FifaTiseAssistant } from './fifa-tise.assistant';
import { formatToOpenAIFunction } from 'langchain/tools';
import { setTimeout } from 'timers/promises';
import { inspect } from 'util';

const threadByConversationId: Record<string, OpenAI.Beta.Thread> = {};

@Injectable()
export class FifaTiseAgentService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly project: Project;
  private readonly agent: Agent;
  private readonly fifaTiseAssistant: FifaTiseAssistant;
  private lastSeenMessage: string | undefined = undefined;

  constructor(
    readonly configService: ConfigService,
    private readonly registerNewPlayer: RegisterNewPlayer,
    private readonly addPlayersInBuddiesGroup: AddPlayersInBuddiesGroup,
    private readonly createBuddiesGroup: CreateBuddiesGroup,
    private readonly findPlayers: FindPlayers,
    private readonly getPlayerBuddiesGroups: GetPlayerBuddiesGroups,
    private readonly getCurrentMatchOf: GetCurrentMatchOf,
    private readonly startMatch: StartMatch,
    private readonly scoreGoal: ScoreGoal,
    private readonly halfTime: HalfTime,
    private readonly endMatch: EndMatch,
  ) {
    this.project = new Project({
      projectId: '9b096aad-13ba-474e-ae5f-95d6416e0fb3',
      secret: configService.get('AGENT_LABS_SECRET_KEY') ?? '',
      url: 'https://fifa-tise.app.agentlabs.dev',
    });
    this.agent = this.project.agent('6985eedb-5a20-4d47-833b-208fe8e6a254');
    this.fifaTiseAssistant = new FifaTiseAssistant(configService);
  }

  private handleNewMessage() {
    this.project.onChatMessage(async (message) => {
      try {
        if (message.member.isAnonymous) {
          return this.agent.requestLogin({
            conversationId: message.conversationId,
            text: 'Please login to use the Fifa Tise assistant',
          });
        }
        await this.registerNewPlayer.execute({
          id: message.member.id,
          name: message.member.firstName ?? 'N.C',
          email: message.member.email ?? 'N.C',
        });
        const thread = await this.getThreadByConversationId(
          message.conversationId,
          {
            id: message.member.id,
            name: message.member.firstName ?? 'N.C',
            email: message.member.email ?? 'N.C',
          },
        );
        await this.runPlugin({
          thread,
          text: message.text,
          me: {
            id: message.member.id,
            name: message.member.firstName ?? 'N.C',
            email: message.member.email ?? 'N.C',
          },
          conversationId: message.conversationId,
        });
      } catch (err) {
        console.error(err);
      }
    });
  }

  private async getThreadByConversationId(
    conversationId: string,
    me: { id: string; name: string; email: string },
  ) {
    if (!threadByConversationId[conversationId]) {
      threadByConversationId[conversationId] =
        await this.fifaTiseAssistant.createThread(me);
    }
    return threadByConversationId[conversationId];
  }

  private async runPlugin({
    thread,
    text,
    me,
    conversationId,
  }: {
    thread: OpenAI.Beta.Thread;
    text: string;
    me: {
      id: string;
      name: string;
      email: string;
    };
    conversationId: string;
  }) {
    const functions = this.getFunctions(me);
    const openAIfunctions = functions.map((fn) => ({
      type: 'function',
      function: formatToOpenAIFunction(fn),
    }));
    await this.fifaTiseAssistant.configure(
      openAIfunctions as OpenAI.Beta.Assistant.Function[],
    );
    await this.fifaTiseAssistant.addMessage(text, thread.id);
    let run = await this.fifaTiseAssistant.runThread(thread);

    while (
      run.status !== 'cancelled' &&
      run.status !== 'completed' &&
      run.status !== 'failed' &&
      run.status !== 'expired'
    ) {
      await setTimeout(1000);
      run = await this.fifaTiseAssistant.retrieveRun(thread.id, run.id);
      await this.addMessages(thread, conversationId);

      if (run.status === 'requires_action') {
        if (run.required_action) {
          const outputs = await Promise.all(
            run.required_action.submit_tool_outputs.tool_calls.map(
              async (toolCall) => {
                const fnToCall = functions.find(
                  (fn) => fn.name === toolCall.function.name,
                );
                if (!fnToCall) {
                  throw new Error(`Unknown function ${toolCall.function.name}`);
                }
                console.log(
                  `Calling ${toolCall.function.name} with args`,
                  JSON.parse(toolCall.function.arguments),
                );
                const output = await fnToCall.func(
                  JSON.parse(toolCall.function.arguments),
                );

                return {
                  tool_call_id: toolCall.id,
                  output,
                };
              },
            ),
          );
          await this.fifaTiseAssistant.submitToolOutput(
            thread.id,
            run.id,
            outputs,
          );
        }
      }
    }
    await this.addMessages(thread, conversationId);
  }

  private async addMessages(
    thread: OpenAI.Beta.Threads.Thread,
    conversationId: string,
  ) {
    const messagesPage = await this.fifaTiseAssistant.retrieveMessages(
      thread.id,
      this.lastSeenMessage,
    );
    let lastSeenMessageUpdated = false;
    if (messagesPage.data.length > 0) {
      for (const message of messagesPage.data) {
        if (
          message.role === 'assistant' &&
          this.isNotEmptyTextMessage(message)
        ) {
          console.log(
            inspect(
              { message, isNotEmpty: this.isNotEmptyTextMessage(message) },
              { depth: null, colors: true },
            ),
          );
          if (!lastSeenMessageUpdated) {
            this.lastSeenMessage = message.id;
            lastSeenMessageUpdated = true;
          }
          for (const content of message.content) {
            await this.agent.typewrite({
              conversationId,
              text:
                content.type === 'text' ? content.text.value : 'image(todo)',
            });
          }
        }
      }
    }
  }

  private isNotEmptyTextMessage(
    message: OpenAI.Beta.Threads.Messages.ThreadMessage,
  ) {
    return (
      message.role === 'assistant' &&
      message.content.every((c) => {
        if (c.type === 'image_file') return true;

        return c.text.value !== '';
      })
    );
  }

  private getFunctions(me: { id: string; name: string; email: string }) {
    return [
      uuidGeneratorTool,
      playerTools.whoAmITool(me),
      playerTools.addPlayersInBuddiesGroupTool(this.addPlayersInBuddiesGroup),
      playerTools.createBuddiesGroupTool(this.createBuddiesGroup),
      playerTools.registerPlayerTool(this.registerNewPlayer),
      playerTools.findPlayersTool(this.findPlayers),
      playerTools.getPlayerBuddiesGroupTool(this.getPlayerBuddiesGroups),
      matchTools.getCurrentMatchOfTool(this.getCurrentMatchOf),
      matchTools.startMatchTool(this.startMatch),
      matchTools.scoreGoalTool(this.scoreGoal),
      matchTools.halfTimeTool(this.halfTime),
      matchTools.endMatchTool(this.endMatch),
    ];
  }

  async onApplicationBootstrap() {
    await this.project?.connect();
    this.handleNewMessage();
  }

  onApplicationShutdown() {
    this.project?.disconnect();
  }
}
