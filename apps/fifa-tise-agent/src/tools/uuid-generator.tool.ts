import { DynamicStructuredTool } from 'langchain/tools';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

export const uuidGeneratorTool = new DynamicStructuredTool({
  name: 'uuid-generator',
  description:
    'useful to generate a random uuid. You MUST use this tool when you need to generate a uuid.',
  schema: z.object({}),
  func: async () => {
    return JSON.stringify({ uuid: uuidv4() });
  },
  returnDirect: false,
});
