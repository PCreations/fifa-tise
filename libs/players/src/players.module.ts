import { Module } from '@nestjs/common';
import { AddPlayersInBuddiesGroup } from './features/add-players-in-buddies-group';
import { CreateBuddiesGroup } from './features/create-buddies-group';
import { GetPlayerBuddiesGroups } from './features/get-player-buddies-groups';
import { RegisterNewPlayer } from './features/register-new-player';
import { BuddiesGroupRepository } from './domain/buddies-group.repository';
import { InMemoryBuddiesGroupRepository } from './repositories/inmemory-buddies-group.repository';
import { FindPlayers } from './features/find-players';
import { PlayerRepository } from './domain/player.repository';
import { InMemoryPlayerRepository } from './repositories/inmemory-player.repository';

@Module({
  providers: [
    AddPlayersInBuddiesGroup,
    CreateBuddiesGroup,
    GetPlayerBuddiesGroups,
    RegisterNewPlayer,
    FindPlayers,
    {
      provide: BuddiesGroupRepository,
      useClass: InMemoryBuddiesGroupRepository,
    },
    {
      provide: PlayerRepository,
      useClass: InMemoryPlayerRepository,
    },
  ],
  exports: [
    AddPlayersInBuddiesGroup,
    CreateBuddiesGroup,
    GetPlayerBuddiesGroups,
    RegisterNewPlayer,
    FindPlayers,
    BuddiesGroupRepository,
  ],
})
export class PlayersModule {}
