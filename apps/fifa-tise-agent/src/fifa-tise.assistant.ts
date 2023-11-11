import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export class FifaTiseAssistant {
  private readonly openAI: OpenAI;
  private assistantId: string;
  constructor(readonly config: ConfigService) {
    this.openAI = new OpenAI({
      apiKey: config.get('OPENAI_API_KEY'),
    });
  }

  async configure(functions: OpenAI.Beta.Assistant.Function[]) {
    const assistant = await this.openAI.beta.assistants.create({
      name: 'Fifa Tize',
      instructions: `You are a virtual assistant for organizing "Fifa Tize" sessions as drinking game. You use informal language with everyone. You're cheeky, funny, sometimes teasing, but always kind-hearted. Your role is to set up a fun little tournament among groups of buddies where the objective is to face off in Fifa one-on-one. You first need to know who is the connected player. Each player must choose a team with a name and a score ranging from 0.5 to 5, increasing by 0.5 increments. If the players aren't part of the same buddies group, you'll first need to create that group. If the players don't exist yet, you'll need to create them. You must confirm the list of players and the selected teams before starting the match. Each player can indicate if they've scored a goal, and what type of goal it was. You then have to calculate the number of shots each player must drink based on their score and the type of goal scored, and tell each player in a teasing or challenging manner (but always kindly) how many shots they should drink. The player can notify that half-time has been called, and you must instruct players on what actions they should take after half-time. The same goes for the end of the match. You speak in French`,
      tools: [{ type: 'code_interpreter' }, ...functions],
      model: 'gpt-4-1106-preview',
    });
    this.assistantId = assistant.id;

    return assistant;
  }

  async createThread(me: { id: string; email: string; name: string }) {
    return this.openAI.beta.threads.create({
      messages: [
        {
          role: 'user',
          content: `Salut moi c'est ${me.name}, je suis le joueur connecté et mon uuid est ${me.id}`,
        },
      ],
    });
  }

  async addMessage(text: string, threadId: string) {
    return this.openAI.beta.threads.messages.create(threadId, {
      content: text,
      role: 'user',
    });
  }

  async retrieveMessages(threadId: string, beforeMessageId?: string) {
    return this.openAI.beta.threads.messages.list(threadId, {
      before: beforeMessageId,
    });
  }

  async runThread(thread: OpenAI.Beta.Thread) {
    return this.openAI.beta.threads.runs.create(thread.id, {
      assistant_id: this.assistantId,
    });
  }

  async retrieveRun(threadId: string, runId: string) {
    return this.openAI.beta.threads.runs.retrieve(threadId, runId);
  }

  async submitToolOutput(
    threadId: string,
    runId: string,
    outputs: {
      tool_call_id: string;
      output: string;
    }[],
  ) {
    return this.openAI.beta.threads.runs.submitToolOutputs(threadId, runId, {
      tool_outputs: outputs,
    });
  }

  async retrieveNewSteps(
    threadId: string,
    runId: string,
    afterStepId?: string,
  ) {
    return this.openAI.beta.threads.runs.steps.list(threadId, runId, {
      after: afterStepId,
    });
  }
}
