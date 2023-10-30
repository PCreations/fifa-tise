import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Agent, Project } from '@agentlabs/node-sdk';
import { BufferMemory, ChatMessageHistory } from 'langchain/memory';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { ChatOpenAI } from 'langchain/chat_models/openai';
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

// @TODO: do this in the proper way
const usersOnboarded = new Set<string>();

@Injectable()
export class FifaTiseAgentService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly project: Project;
  private readonly agent: Agent;
  private readonly chatOpenAI: ChatOpenAI;
  private memory: BufferMemory;

  constructor(
    readonly configService: ConfigService,
    private readonly registerNewPlayer: RegisterNewPlayer,
    private readonly addPlayersInBuddiesGroup: AddPlayersInBuddiesGroup,
    private readonly createBuddiesGroup: CreateBuddiesGroup,
    private readonly findPlayers: FindPlayers,
    private readonly getPlayerBuddiesGroups: GetPlayerBuddiesGroups,
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
    this.chatOpenAI = this.createChatOpenAI();
    this.memory = new BufferMemory({
      chatHistory: new ChatMessageHistory(),
      memoryKey: 'chat_history',
      returnMessages: true,
    });
    this.agent = this.project.agent('6985eedb-5a20-4d47-833b-208fe8e6a254');
  }

  private handleNewMessage() {
    this.project.onChatMessage(async (message) => {
      if (message.member.isAnonymous) {
        if (!usersOnboarded.has(message.memberId)) {
          usersOnboarded.add(message.memberId);
          const onboarding = await this.getOnboarding({
            id: message.member.id,
            name: 'anonyme',
            email: '',
          });

          await this.agent.send(
            {
              text: onboarding,
              conversationId: message.conversationId,
            },
            {
              format: 'Markdown',
            },
          );
        }
        return this.agent.requestLogin({
          conversationId: message.conversationId,
          text: 'Pour pouvoir enflammer ta soirée de Fifa Tise, va falloir que tu te connectes mon gars ;)',
        });
      }
      if (!usersOnboarded.has(message.memberId)) {
        usersOnboarded.add(message.memberId);
        await this.getOnboarding({
          id: message.member.id,
          name: message.member.fullName ?? 'inconnu',
          email: message.member.email ?? 'inconnu',
        });
      }
      const result = await this.runPlugin({
        text: message.text,
        me: {
          id: message.member.id,
          name: message.member.fullName ?? 'inconnu',
          email: message.member.email ?? 'inconnu',
        },
      });
      this.agent.send(
        {
          text: result.output,
          conversationId: message.conversationId,
        },
        {
          format: 'Markdown',
        },
      );
    });
  }

  private createChatOpenAI() {
    const prefix = `Tu es un assistant virtuel pour organiser les soirées de before à Fifa. Tu tutoies tout le monde. Tu es taquin, drôle, parfois moqueur, mais toujours dans la bienveillance. Ton rôle est d'organiser un petit tournoi marrant entre groupe de potes (buddies groups) où l'objectif est de s'affronter à Fifa entre deux potes. Chaque joueur doit choisir une équipe qui contient un nom et un score compris entre 0.5 et 5 avec un incrément de 0.5. Si les joueurs ne font pas partie du même groupe de potes, tu devras d'abord créer ce groupe de potes. Si les joueurs n'existent pas encore, tu devras les créer. Tu devras confirmer la liste des joueurs et les équipes sélectionnées avant de démarrer le match. Chaque joueur peut indiquer s'il a marqué un but, et quel type de but c'était. Tu dois alors calculer le nombre de shots que chaque joueur doit boire en fonction de son score et du type de but marqué, et indiquer à chaque joueur combien de shots il doit boire, de façon moqueuse ou provocante, mais toujours dans la bienveillance. Le joueur peut notifier que la mi-temps du match a été sifflée, tu dois notifier les joueurs des actions qu'ils ont à mener suite à la mi-temps. Pareil pour la fin du match.`;

    return new ChatOpenAI({
      temperature: 0.25,
      modelName: 'gpt-4-0613',
      prefixMessages: [
        {
          content: prefix,
          role: 'assistant',
        },
      ],
    });
  }

  private async getOnboarding(me: { id: string; name: string; email: string }) {
    const result = await this.runPlugin({
      text: "Salut ! On va se tutoyer et se parler de façon amicale et taquine. Tu peux me parler de façon moqueuse quand tu penses que c'est pertinent. Toujours dans la bienveillance mais on est là pour rigoler ! Explique-moi comment je peux interagir avec toi mais ne réponds pas explicitement à mon message de salutation.",
      me,
    });
    this.memory.saveContext(
      {
        input:
          "Salut ! On va se tutoyer et se parler de façon amicale et taquine. Tu peux me parler de façon moqueuse quand tu penses que c'est pertinent. Toujours dans la bienveillance mais on est là pour rigoler ! Explique-moi comment je peux interagir avec toi mais ne réponds pas explicitement à mon message de salutation.",
      },
      {
        output: result.output,
      },
    );
    return result.output;
  }

  private async runPlugin({
    text,
    me,
  }: {
    text: string;
    me: {
      id: string;
      name: string;
      email: string;
    };
  }) {
    const agent = await initializeAgentExecutorWithOptions(
      this.getTools(me),
      this.chatOpenAI,
      {
        agentType: 'openai-functions',
        verbose: true,
        memory: this.memory,
      },
    );

    const result = await agent.call({
      input: text,
    });

    return result;
  }

  private getTools(me: { id: string; name: string; email: string }) {
    return [
      uuidGeneratorTool,
      playerTools.whoAmITool(me),
      playerTools.addPlayersInBuddiesGroupTool(this.addPlayersInBuddiesGroup),
      playerTools.createBuddiesGroupTool(this.createBuddiesGroup),
      playerTools.registerPlayerTool(this.registerNewPlayer),
      playerTools.findPlayersTool(this.findPlayers),
      playerTools.getPlayerBuddiesGroupTool(this.getPlayerBuddiesGroups),
      matchTools.startMatchTool(this.startMatch, this.memory),
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
