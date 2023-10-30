import { GoalType } from '@matches/domain/match.entity';
import { EndMatch } from '@matches/features/end-match';
import { GetCurrentMatchOf } from '@matches/features/get-current-match';
import { HalfTime } from '@matches/features/half-time';
import { ScoreGoal } from '@matches/features/score-goal';
import { StartMatch } from '@matches/features/start-match';
import { BufferMemory } from 'langchain/memory';
import { DynamicStructuredTool } from 'langchain/tools';
import { z } from 'zod';

export const getCurrentMatchOfTool = (getCurrentMatchOf: GetCurrentMatchOf) =>
  new DynamicStructuredTool({
    name: 'recuperer-le-match-en-cours-d-un-joueur',
    description: `Utilise cet outil pour récupérer mon match en cours dès que tu en as besoin. Soit parce que je te le demande explicitement, soit parce que tu as besoin de récupérer l'id de mon adversaire. L'input contient mon id.`,
    schema: z.object({
      playerId: z.string().min(1),
    }),
    async func(input) {
      try {
        const match = await getCurrentMatchOf.execute({
          playerId: input.playerId,
        });
        return `Le match en cours est : ${JSON.stringify(match)}`;
      } catch (err) {
        return `Le système a rencontré une erreur: ${err.message}. Essaye de la gérer par toi-même`;
      }
    },
  });

export const startMatchTool = (startMatch: StartMatch, memory: BufferMemory) =>
  new DynamicStructuredTool({
    name: 'demarrer-un-match',
    description: `Utilise cet outil pour démarrer un nouveau match entre deux joueurs. L'input contient l'uuid du match que tu devras générer, l'id du joueur à domicile, le nom de l'équipe à domicile et le nombre d'étoiles de l'équipe à domicile, l'id du joueur à l'extérieur, le nom de l'équipe à l'extérieur et le nombre d'étoiles de l'équipe à l'extérieur.`,
    schema: z.object({
      matchId: z.string().min(1),
      homeTeam: z.object({
        player: z.string().min(1),
        name: z.string().min(1),
        stars: z.number().min(0.5).max(5).step(0.5),
      }),
      awayTeam: z.object({
        player: z.string().min(1),
        name: z.string().min(1),
        stars: z.number().min(0.5).max(5).step(0.5),
      }),
    }),
    async func(input) {
      try {
        await startMatch.execute({
          matchId: input.matchId,
          homeTeam: {
            player: input.homeTeam.player,
            name: input.homeTeam.name,
            stars: input.homeTeam.stars,
          },
          awayTeam: {
            player: input.awayTeam.player,
            name: input.awayTeam.name,
            stars: input.awayTeam.stars,
          },
        });
        const result = `Le match a démarré avec succès et l'uuid du match en cours est ${input.matchId}`;
        await memory.saveContext(
          {
            input: `Le match en cours a pour id ${input.matchId} et oppose ${input.homeTeam.name} joué par le joueur avec l'id ${input.homeTeam.player} à ${input.awayTeam.name} joué par le joueur avec l'id ${input.awayTeam.player}}`,
          },
          {
            output:
              "Ok, j'utiliserai ces informations pour les prochaines actions dès que j'aurai besoin d'utiliser l'id du match en cours, ou l'id de l'un des joueurs du match en cours",
          },
        );
        return result;
      } catch (err) {
        return `Le système a rencontré une erreur: ${err.message}. Essaye de la gérer par toi-même`;
      }
    },
  });

export const halfTimeTool = (halfTime: HalfTime) =>
  new DynamicStructuredTool({
    name: 'siffler-la-mi-temps',
    description: `Utilise cet outil pour indiquer que la mi-temps du match a été sifflée. L'input contient l'uuid du match en cours. Indique aux joueurs les actions qu'ils doivent faire en fonction de ce qui t'es retourné.`,
    schema: z.object({
      matchId: z.string().min(1),
    }),
    async func(input) {
      try {
        const playerActions = await halfTime.execute({
          matchId: input.matchId,
        });
        return `La mi-temps a été sifflée avec succès, voici les actions de joueurs : ${JSON.stringify(
          playerActions,
        )}`;
      } catch (err) {
        return `Le système a rencontré une erreur: ${err.message}. Essaye de la gérer par toi-même`;
      }
    },
  });

export const endMatchTool = (endMatch: EndMatch) =>
  new DynamicStructuredTool({
    name: 'terminer-le-match',
    description: `Utilise cet outil pour indiquer que le match est terminé. L'input contient l'uuid du match en cours. Indique aux joueurs les actions qu'ils doivent faire en fonction de ce qui t'es retourné, de façon taquine et parfois moqueuse, mais toujours dans la bienveillance.`,
    schema: z.object({
      matchId: z.string().min(1),
    }),
    async func(input) {
      try {
        const playerActions = await endMatch.execute({
          matchId: input.matchId,
        });
        return `Le match a été terminé avec succès, voici les actions de joueurs : ${JSON.stringify(
          playerActions,
        )}`;
      } catch (err) {
        return `Le système a rencontré une erreur: ${err.message}. Essaye de la gérer par toi-même`;
      }
    },
  });

export const scoreGoalTool = (scoreGoal: ScoreGoal) => {
  return new DynamicStructuredTool({
    name: 'but-marque',
    description: `Utilise cet outil pour indiquer qu'un but a été marqué. L'input contient l'uuid du match en cours, l'id du joueur qui a marqué le but et le type de but marqué. Indique aux joueurs les actions qu'ils doivent faire en fonction de ce qui t'es retourné de façon taquine et parfois moqueuse, mais toujours dans la bienveillance. Le type de but marqué peut être soit un but malade, c'est un but vraiment dingue, genre un tir hors de la surface de réparation en pleine lucarne, une reprise de volée, etc. Un but carotte est un but généré par un bug du jeu ou vraiment par un énorme coup de chance. Un but ketchup est un but de lâche, c'est un but marqué en voulant humilier l'adversaire, genre en faisant une roulette, en faisant une passe à son gardien, etc. Tous les autres buts sont de type "normal".`,
    schema: z.object({
      matchId: z.string().min(1),
      scoredByPlayerId: z.string().min(1),
      goalType: z.nativeEnum(GoalType),
    }),
    async func(input) {
      try {
        const playerActions = await scoreGoal.execute({
          matchId: input.matchId,
          scoredBy: input.scoredByPlayerId,
          goalType: input.goalType,
        });
        return `Le but a été marqué avec succès, voici les actions de joueurs : ${JSON.stringify(
          playerActions,
        )}`;
      } catch (err) {
        return `Le système a rencontré une erreur: ${err.message}. Essaye de la gérer par toi-même`;
      }
    },
  });
};
