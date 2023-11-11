import { GoalType, MatchEntity } from '@matches/domain/match.entity';
import { EndMatch } from '@matches/features/end-match';
import { GetCurrentMatchOf } from '@matches/features/get-current-match';
import { HalfTime } from '@matches/features/half-time';
import { ScoreGoal } from '@matches/features/score-goal';
import { StartMatch } from '@matches/features/start-match';
import { DynamicStructuredTool } from 'langchain/tools';
import { z } from 'zod';

const formatMatchSnapshotToAi = (
  matchSnapshot: ReturnType<MatchEntity['takeSnapshot']>,
) => {
  return `
    CURRENT_MATCH_UUID: ${matchSnapshot.id},
    CURRENT_MATCH_HOME_TEAM_PLAYER_UUID: ${matchSnapshot.home.player},
    CURRENT_MATCH_HOME_TEAM_NAME: ${matchSnapshot.home.name},
    CURRENT_MATCH_HOME_TEAM_STARS: ${matchSnapshot.home.stars},
    CURRENT_MATCH_AWAY_TEAM_PLAYER_UUID: ${matchSnapshot.away.player},
    CURRENT_MATCH_AWAY_TEAM_NAME: ${matchSnapshot.away.name},
    CURRENT_MATCH_AWAY_TEAM_STARS: ${matchSnapshot.away.stars},
    CURRENT_MATCH_HOME_TEAM_SCORE: ${matchSnapshot.home.score},
    CURRENT_MATCH_AWAY_TEAM_SCORE: ${matchSnapshot.away.score},
    CURRENT_MATCH_STATE: ${matchSnapshot.state},
  `;
};

export const getCurrentMatchOfTool = (getCurrentMatchOf: GetCurrentMatchOf) =>
  new DynamicStructuredTool({
    name: 'get-current-match-of-a-player',
    description: `You MUST use this tool when you need information about the current match of a player. You MUST use this tool when you need to retrieve these information :
    CURRENT_MATCH_UUID : The match uuid
    CURRENT_MATCH_HOME_TEAM_PLAYER_UUID : The home team player uuid 
    CURRENT_MATCH_HOME_TEAM_NAME : The home team name
    CURRENT_MATCH_HOME_TEAM_STARS : The home team stars
    CURRENT_MATCH_AWAY_TEAM_PLAYER_UUID : The away team player uuid
    CURRENT_MATCH_AWAY_TEAM_NAME : The away team name
    CURRENT_MATCH_AWAY_TEAM_STARS : The away team stars
    CURRENT_MATCH_HOME_TEAM_SCORE : The home team score
    CURRENT_MATCH_AWAY_TEAM_SCORE : The away team score
    CURRENT_MATCH_STATE : The match state

    The input is :
    PLAYER_UUID : the uuid of the player you want to retrieve the current match. If you don't have one, you MUST ask to the user to provide one.`,
    schema: z.object({
      PLAYER_UUID: z.string().min(1),
    }),
    async func(input) {
      try {
        const match = await getCurrentMatchOf.execute({
          playerId: input.PLAYER_UUID,
        });
        const result = JSON.stringify({
          currentMatch: formatMatchSnapshotToAi(match.takeSnapshot()),
        });
        return result;
      } catch (err) {
        console.error(err);
        return `The system encounters an error: ${err.message}. Try to figure it out by yourself how to remedy to it by using other tools or asking the user for missing information`;
      }
    },
  });

export const startMatchTool = (startMatch: StartMatch) =>
  new DynamicStructuredTool({
    name: 'start-a-new-match-between-players',
    description: `You MUST use this tool when you need to start a new match between two players. The input is :
    MATCH_UUID : The UUID of the match that you MUST generate with the "uuid-generator" tool.
    HOME_TEAM.PLAYER_UUID : The UUID of the player that will play at home. You MUST have already seen this PLAYER_UUID before ! If you don't know what PLAYER_UUID to use, ask the user more information about how to retrieve it.
    HOME_TEAM.NAME : The name of the home team. You MUST ask the user to provide a name if you don't have one.
    HOME_TEAM.STARS : The stars of the home team. You MUST ask the user to provide a number between 0.5 and 5, increasing by 0.5 increments.
    The same goes for the away team.
    `,
    schema: z.object({
      MATCH_UUID: z.string().uuid(),
      HOME_TEAM: z.object({
        PLAYER_UUID: z.string().uuid(),
        NAME: z.string().min(1),
        STARS: z.number().min(0.5).max(5).step(0.5),
      }),
      AWAY_TEAM: z.object({
        PLAYER_UUID: z.string().uuid(),
        NAME: z.string().min(1),
        STARS: z.number().min(0.5).max(5).step(0.5),
      }),
    }),
    async func(input) {
      try {
        const startedMatch = await startMatch.execute({
          matchId: input.MATCH_UUID,
          homeTeam: {
            player: input.HOME_TEAM.PLAYER_UUID,
            name: input.HOME_TEAM.NAME,
            stars: input.HOME_TEAM.STARS,
          },
          awayTeam: {
            player: input.AWAY_TEAM.PLAYER_UUID,
            name: input.AWAY_TEAM.NAME,
            stars: input.AWAY_TEAM.STARS,
          },
        });
        const result = JSON.stringify({
          currentMatch: formatMatchSnapshotToAi(startedMatch),
        });
        return result;
      } catch (err) {
        console.error(err);
        return `The system encounters an error: ${err.message}. Try to figure it out by yourself how to remedy to it by using other tools or asking the user for missing information`;
      }
    },
  });

export const halfTimeTool = (halfTime: HalfTime) =>
  new DynamicStructuredTool({
    name: 'half-time',
    description: `You MUST use this tool when the user notifies that it is the half time of the match. The input is :
    CURRENT_MATCH_UUID. You MUST know this uuid, if not, you must check what is the current match or ask the user if they have started a match or not.`,
    schema: z.object({
      CURRENT_MATCH_UUID: z.string().uuid(),
    }),
    async func(input) {
      try {
        const playerActions = await halfTime.execute({
          matchId: input.CURRENT_MATCH_UUID,
        });
        return JSON.stringify({
          playerActions,
        });
      } catch (err) {
        console.error(err);
        return `The system encounters an error: ${err.message}. Try to figure it out by yourself how to remedy to it by using other tools or asking the user for missing information`;
      }
    },
  });

export const endMatchTool = (endMatch: EndMatch) =>
  new DynamicStructuredTool({
    name: 'end-the-match',
    description: `You MUST use this tool when the user notifies that the match is over. The input is :
    CURRENT_MATCH_UUID. The id of the current match. You MUST know this uuid, if not, you must check what is the current match or ask the user if they have started a match or not.`,
    schema: z.object({
      CURRENT_MATCH_UUID: z.string().uuid(),
    }),
    async func(input) {
      try {
        const playerActions = await endMatch.execute({
          matchId: input.CURRENT_MATCH_UUID,
        });
        return JSON.stringify({
          playerActions,
        });
      } catch (err) {
        console.error(err);
        return `The system encounters an error: ${err.message}. Try to figure it out by yourself how to remedy to it by using other tools or asking the user for missing information`;
      }
    },
  });

export const scoreGoalTool = (scoreGoal: ScoreGoal) => {
  return new DynamicStructuredTool({
    name: 'goal-scored',
    description: `You MUST use this tool when a player indicates that a goal has been scored. The input is :
    CURRENT_MATCH_UUID. The id of the current match. You MUST know this uuid, if not, you must check what is the current match or ask the user if they have started a match or not.
    SCORED_BY_PLAYER_UUID. The id of the player who scored the goal. You MUST have already seen this PLAYER_UUID before ! If you don't know what PLAYER_UUID to use, ask the user more information about how to retrieve it.
    GOAL_TYPE : A "malade" goal: This is a truly insane goal, like a shot from outside the box that goes straight into the top corner, a volley, etc.
    A "carotte" goal: This goal is generated by a game bug or is really just a massive stroke of luck.
    A "ketchup" goal: This is a cheeky goal, scored with the intention to humiliate the opponent, like doing a roulette move or passing the ball to their own goalkeeper, etc.
    All other goals are of the "normal" type.`,
    schema: z.object({
      CURRENT_MATCH_UUID: z.string().uuid(),
      SCORED_BY_PLAYER_UUID: z.string().uuid(),
      GOAL_TYPE: z.nativeEnum(GoalType),
    }),
    async func(input) {
      try {
        const playerActions = await scoreGoal.execute({
          matchId: input.CURRENT_MATCH_UUID,
          scoredBy: input.SCORED_BY_PLAYER_UUID,
          goalType: input.GOAL_TYPE,
        });
        return JSON.stringify({
          playerActions,
        });
      } catch (err) {
        console.error(err);
        return `The system encounters an error: ${err.message}. Try to figure it out by yourself how to remedy to it by using other tools or asking the user for missing information`;
      }
    },
  });
};
