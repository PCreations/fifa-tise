import { AddPlayersInBuddiesGroup } from '@players/features/add-players-in-buddies-group';
import { CreateBuddiesGroup } from '@players/features/create-buddies-group';
import { FindPlayers } from '@players/features/find-players';
import { GetPlayerBuddiesGroups } from '@players/features/get-player-buddies-groups';
import { RegisterNewPlayer } from '@players/features/register-new-player';
import { DynamicStructuredTool } from 'langchain/tools';
import { z } from 'zod';

// TODO : DEBUG LES ENTITIES+

export const whoAmITool = (me: { id: string; email: string; name: string }) =>
  new DynamicStructuredTool({
    name: 'who-is-the-current-player',
    description:
      'You MUST use this tool to know the CURRENT_PLAYER_ID, CURRENT_PLAYER_EMAIL and CURRENT_PLAYER_NAME.',
    schema: z.object({}),
    async func() {
      const result = `${JSON.stringify({
        currentPlayer: {
          CURRENT_PLAYER_ID: me.id,
          CURRENT_PLAYER_EMAIL: me.email,
          CURRENT_PLAYER_NAME: me.name,
        },
      })}`;
      return result;
    },
  });

export const registerPlayerTool = (registerPlayer: RegisterNewPlayer) =>
  new DynamicStructuredTool({
    name: 'save-a-player',
    description: `You MUST use this tool to register a new player when you haven't found it through the "find-players-by-name-or-email" tool.
    The inputs are :
    PLAYER_UUID : the uuid of the player you want to register. If you don't have one, you MUST generate one with the "uuid-generator" tool.
    PLAYER_NAME : the name of the player, if you don't have one, you MUST ask to the user to provide one.
    PLAYER_EMAIL : the email of the player, DO NOT MAKE UP ANSWER, if you don't have one, you MUST ask to the user to provide one. This MUST be a valid email`,
    schema: z.object({
      PLAYER_UUID: z.string(),
      PLAYER_NAME: z.string(),
      PLAYER_EMAIL: z.string().email(),
    }),
    async func(input) {
      try {
        await registerPlayer.execute({
          id: input.PLAYER_UUID,
          name: input.PLAYER_NAME,
          email: input.PLAYER_EMAIL,
        });
        const result = JSON.stringify({ success: true });
        return result;
      } catch (err) {
        console.error(err);
        return `The system encounters an error: ${err.message}. Try to figure it out by yourself how to remedy to it by using other tools or asking the user for missing information`;
      }
    },
  });

export const createBuddiesGroupTool = (
  createBuddiesGroup: CreateBuddiesGroup,
) =>
  new DynamicStructuredTool({
    name: 'create-a-buddies-group',
    description: `You MUST use this tool to create a new buddies group. The input is :
    BUDDIES_GROUP_UUID : the uuid of the buddies group you want to create, you MUST generate one with the "uuid-generator" tool.
    PLAYERS_UUID: the PLAYER_UUID of the players you want to add in this buddies group. You MUST have already seen those PLAYER_UUID before ! If you don't know what PLAYER_UUID to use, ask the user more information about how to retrieve it.`,
    schema: z.object({
      BUDDIES_GROUP_UUID: z.string().uuid(),
      PLAYERS_UUID: z.array(z.string().uuid()).nonempty(),
    }),
    async func(input) {
      try {
        await createBuddiesGroup.execute({
          id: input.BUDDIES_GROUP_UUID,
          players: input.PLAYERS_UUID,
        });
        return JSON.stringify({ success: true });
      } catch (err) {
        console.error(err);
        return `The system encounters an error: ${err.message}. Try to figure out by yourself how to remedy to it by using other tools or asking the user for missing information`;
      }
    },
  });

export const findPlayersTool = (findPlayers: FindPlayers) =>
  new DynamicStructuredTool({
    name: 'find-players-by-name-or-email',
    description: `You MUST use this tool when you don't already know the information relative to a player by it's name or it's email. You can use this tool to find multiple players at once. The input is:
    NAME_OR_EMAIL: an array containing the names or emails of the players you want to find.`,
    schema: z.object({
      NAME_OR_EMAIL: z.array(z.string()).nonempty(),
    }),
    async func(input) {
      try {
        const players = await findPlayers.execute({
          nameOrEmail: input.NAME_OR_EMAIL,
        });
        const result = JSON.stringify({
          players: players.map((p) => ({
            PLAYER_UUID: p.id,
            PLAYER_NAME: p.name,
            PLAYER_EMAIL: p.email,
          })),
        });
        return result;
      } catch (err) {
        console.error(err);
        return `The system encounters an error: ${err.message}. Try to figure it out by yourself how to remedy to it by using other tools or asking the user for missing information`;
      }
    },
  });

export const getPlayerBuddiesGroupTool = (
  getPlayerBuddiesGroup: GetPlayerBuddiesGroups,
) =>
  new DynamicStructuredTool({
    name: 'find-player-buddies-groups',
    description: `You MUST use this tool to find the buddies groups of a player. The input is :
    PLAYER_UUID: the id of the player you want to find the buddies groups of. You MUST have already seen this PLAYER_UUID before ! If you don't know what PLAYER_UUID to use, ask the user more information about how to retrieve it.`,
    schema: z.object({
      PLAYER_UUID: z.string().uuid(),
    }),
    async func(input) {
      try {
        const buddiesGroups = await getPlayerBuddiesGroup.execute(
          input.PLAYER_UUID,
        );
        return JSON.stringify({
          buddiesGroups: buddiesGroups.map((bg) => ({
            BUDDIES_GROUP_UUID: bg.id,
            BUDDIES_GROUP_PLAYERS: [...bg.players].map((p) => ({
              PLAYER_UUID: p,
            })),
          })),
        });
      } catch (err) {
        console.error(err);
        return `The system encounters an error: ${err.message}. Try to figure it out by yourself how to remedy to it by using other tools or asking the user for missing information`;
      }
    },
  });

export const addPlayersInBuddiesGroupTool = (
  addPlayersInBuddiesGroup: AddPlayersInBuddiesGroup,
) =>
  new DynamicStructuredTool({
    name: 'add-players-in-buddies-group',
    description: `You MUST use this tool to add players in a buddies group. The input is :
    BUDDIES_GROUP_UUID: The id of the buddies group you want to add player in. You MUST know this BUDDIES_GROUP_UUID or ask the user for it.
    PLAYERS_UUID: The PLAYER_UUID of the players you want to add in this buddies group. You MUST have already seen those PLAYER_UUID before ! If you don't know what PLAYER_UUID to use, ask the user more information about how to retrieve it.`,
    schema: z.object({
      BUDDIES_GROUP_UUID: z.string().uuid(),
      PLAYERS_UUID: z.array(z.string().uuid()).nonempty(),
    }),
    async func(input) {
      try {
        const result = await addPlayersInBuddiesGroup.execute({
          buddiesGroupId: input.BUDDIES_GROUP_UUID,
          players: input.PLAYERS_UUID,
        });
        return JSON.stringify({ result });
      } catch (err) {
        console.error(err);
        return `The system encounters an error: ${err.message}. Try to figure it out by yourself how to remedy to it by using other tools or asking the user for missing information`;
      }
    },
  });
