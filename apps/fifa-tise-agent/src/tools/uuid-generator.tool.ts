import { DynamicStructuredTool } from 'langchain/tools';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

export const uuidGeneratorTool = new DynamicStructuredTool({
  name: 'uuid-generator',
  description: 'usefull to generate a random uuid',
  schema: z.object({}),
  func: async () => {
    return uuidv4();
  },
  returnDirect: false,
});
