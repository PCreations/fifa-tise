import { AddPlayersInBuddiesGroup } from '@players/features/add-players-in-buddies-group';
import { CreateBuddiesGroup } from '@players/features/create-buddies-group';
import { FindPlayers } from '@players/features/find-players';
import { GetPlayerBuddiesGroups } from '@players/features/get-player-buddies-groups';
import { RegisterNewPlayer } from '@players/features/register-new-player';
import { DynamicStructuredTool } from 'langchain/tools';
import { z } from 'zod';

export const whoAmITool = (me: { id: string; email: string; name: string }) =>
  new DynamicStructuredTool({
    name: 'qui-suis-je',
    description:
      'Utilise cet outil pour savoir quel joueur je suis dès que tu a besoin de savoir mon nom, mon email ou mon id',
    schema: z.object({}),
    async func() {
      return `Je suis ${JSON.stringify(me)}`;
    },
  });

export const registerPlayerTool = (registerPlayer: RegisterNewPlayer) =>
  new DynamicStructuredTool({
    name: 'enregistrer-un-nouveau-joueur',
    description: `Utilise cet outil pour enregistrer un nouveau joueur si jamais le système te retourne qu'il n'existe pas. L'input doit contenir l'id du joueur, son nom, et son adresse email. Ne demande à l'utilisateur que le nom, l'adresse email et l'id te seront fournis par le système.`,
    schema: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
    }),
    async func(input) {
      try {
        await registerPlayer.execute({
          id: input.id,
          name: input.name,
          email: input.email,
        });
        return `Le joueur ${JSON.stringify(input)} a bien été enregistré`;
      } catch (err) {
        return `Le système a rencontré une erreur: ${err.message}. Essaye de la gérer par toi-même`;
      }
    },
  });

export const createBuddiesGroupTool = (
  createBuddiesGroup: CreateBuddiesGroup,
) =>
  new DynamicStructuredTool({
    name: 'creer-un-nouveau-groupe-de-potes',
    description: `Utilise cet outil pour créer un nouveau goupe de potes. L'input doit contenir l'uuid du groupe de potes et les ids des joueurs qui font partie du groupe de potes`,
    schema: z.object({
      id: z.string(),
      players: z.array(z.string()).nonempty(),
    }),
    async func(input) {
      try {
        await createBuddiesGroup.execute({
          id: input.id,
          players: input.players,
        });
        return `Le groupe de potes ${JSON.stringify(input)} a bien été créé`;
      } catch (err) {
        return `Le système a rencontré une erreur: ${err.message}. Essaye de la gérer par toi-même`;
      }
    },
  });

export const findPlayersTool = (findPlayers: FindPlayers) =>
  new DynamicStructuredTool({
    name: 'trouver-des-joueurs-par-nom-ou-email',
    description: `Utilise cet outil pour trouver un ou plusieurs joueurs à chaque fois que tu en as besoin. Que ce soit pour le récupérer, ou pour vérifier qu'il existe par exemple. L'input est un tableau "nameOrEmail" contenant des noms ou des emails des joueurs que tu veux chercher.`,
    schema: z.object({
      nameOrEmail: z.array(z.string()).nonempty(),
    }),
    async func(input) {
      try {
        const players = await findPlayers.execute({
          nameOrEmail: input.nameOrEmail,
        });
        return `Les joueurs suivants ont été trouvés: ${JSON.stringify(
          players,
        )}`;
      } catch (err) {
        return `Le système a rencontré une erreur: ${err.message}. Essaye de la gérer par toi-même`;
      }
    },
  });

export const getPlayerBuddiesGroupTool = (
  getPlayerBuddiesGroup: GetPlayerBuddiesGroups,
) =>
  new DynamicStructuredTool({
    name: 'touver-les-groupes-de-potes-d-un-joueur',
    description: `Utilise cet outil pour récupérer les groupes de potes d'un joueur. L'input est l'id du joueur.`,
    schema: z.object({
      playerId: z.string(),
    }),
    async func(input) {
      try {
        const buddiesGroups = await getPlayerBuddiesGroup.execute(
          input.playerId,
        );
        return `Les groupes de potes suivants ont été trouvés: ${JSON.stringify(
          buddiesGroups,
        )}`;
      } catch (err) {
        return `Le système a rencontré une erreur: ${err.message}. Essaye de la gérer par toi-même`;
      }
    },
  });

export const addPlayersInBuddiesGroupTool = (
  addPlayersInBuddiesGroup: AddPlayersInBuddiesGroup,
) =>
  new DynamicStructuredTool({
    name: 'ajoute-des-joueurs-dans-un-groupe-de-potes',
    description: `Utilise cet outil pour ajouter des joueurs dans un groupe de potes. L'input est l'id du groupe de potes et les ids des joueurs à ajouter.`,
    schema: z.object({
      buddiesGroupId: z.string(),
      players: z.array(z.string()).nonempty(),
    }),
    async func(input) {
      try {
        const result = await addPlayersInBuddiesGroup.execute({
          buddiesGroupId: input.buddiesGroupId,
          players: input.players,
        });
        return `Les joueurs suivants ont été ajoutés dans le groupe de potes: ${JSON.stringify(
          result,
        )}`;
      } catch (err) {
        return `Le système a rencontré une erreur: ${err.message}. Essaye de la gérer par toi-même`;
      }
    },
  });
