import {
  MatchEntity,
  MatchState,
  StarRating,
} from '@matches/domain/match.entity';
import { InMemoryMatchRepository } from '@matches/repositories/inmemory-match.repository';
import { StartMatch } from './start-match';
import { InMemoryBuddiesGroupRepository } from '@players/repositories/inmemory-buddies-group.repository';
import { BuddiesGroupEntity } from '@players/domain/buddies-group.entity';

describe('Feature: starting a match', () => {
  it('should start a match given two teams and two players', async () => {
    const matchRepository = new InMemoryMatchRepository();
    const buddiesGroupRepository = new InMemoryBuddiesGroupRepository();
    const startMatch = new StartMatch(matchRepository, buddiesGroupRepository);
    await buddiesGroupRepository.save(
      new BuddiesGroupEntity({
        id: 'buddies-group-id',
        players: new Set(['antho-id', 'pierre-id']),
      }),
    );

    await startMatch.execute({
      matchId: 'match-id',
      homeTeam: {
        player: 'antho-id',
        name: 'Liverpool',
        stars: 5,
      },
      awayTeam: {
        player: 'pierre-id',
        name: 'OL',
        stars: 4.5,
      },
    });

    const startedMatch = await matchRepository.getById('match-id');
    expect(startedMatch.getOrThrow()).toEqual(
      new MatchEntity({
        id: 'match-id',
        state: MatchState.STARTED,
        home: {
          player: 'antho-id',
          name: 'Liverpool',
          stars: StarRating.FIVE,
          score: 0,
        },
        away: {
          player: 'pierre-id',
          name: 'OL',
          stars: StarRating.FOUR_AND_HALF,
          score: 0,
        },
      }),
    );
  });

  it('should throws an error if the players are not in the same buddies group', async () => {
    const matchRepository = new InMemoryMatchRepository();
    const buddiesGroupRepository = new InMemoryBuddiesGroupRepository();
    const startMatch = new StartMatch(matchRepository, buddiesGroupRepository);
    await buddiesGroupRepository.save(
      new BuddiesGroupEntity({
        id: 'buddies-group-id',
        players: new Set(['antho-id']),
      }),
    );

    await expect(() =>
      startMatch.execute({
        matchId: 'match-id',
        homeTeam: {
          player: 'antho-id',
          name: 'Liverpool',
          stars: 5,
        },
        awayTeam: {
          player: 'pierre-id',
          name: 'OL',
          stars: 4.5,
        },
      }),
    ).rejects.toThrowError(
      new Error(
        'Players are not in the same buddies group thus cannot play against each other. You first need to create a buddies group and add both players to it.',
      ),
    );
  });

  it('should throws an error if the players are already in a match', async () => {
    const matchRepository = new InMemoryMatchRepository();
    await matchRepository.save(
      MatchEntity.between({
        id: 'some-match-id',
        home: {
          player: 'antho-id',
          name: 'Liverpool',
          stars: 5,
        },
        away: {
          player: 'pierre-id',
          name: 'OL',
          stars: 4.5,
        },
      }),
    );
    const buddiesGroupRepository = new InMemoryBuddiesGroupRepository();
    const startMatch = new StartMatch(matchRepository, buddiesGroupRepository);
    await buddiesGroupRepository.save(
      new BuddiesGroupEntity({
        id: 'buddies-group-id',
        players: new Set(['antho-id', 'pierre-id']),
      }),
    );

    await expect(() =>
      startMatch.execute({
        matchId: 'match-id',
        homeTeam: {
          player: 'antho-id',
          name: 'Liverpool',
          stars: 5,
        },
        awayTeam: {
          player: 'pierre-id',
          name: 'OL',
          stars: 4.5,
        },
      }),
    ).rejects.toThrowError(
      new Error(
        'There is already a started match between these players.: {"id":"some-match-id","home":{"player":"antho-id","name":"Liverpool","stars":5,"score":0},"away":{"player":"pierre-id","name":"OL","stars":4.5,"score":0},"state":"started"}',
      ),
    );
  });
});

const isBirthday = (birthday: Date, date: Date) => {
  return (
    date.getDate() === birthday.getDate() &&
    date.getMonth() === birthday.getMonth()
  );
};

class User {
  constructor(private readonly props: { id: string; name: string }) {}

  bookRoom({ bookingId, bookingDetails }) {
    return {
      id: bookingId,
      price: bookingDetails.price,
    };
  }
}

class InMemoryBookingRepository {
  bookings = new Map<string, any>();

  async getById(id: string) {
    return this.bookings.get(id);
  }

  async save(booking: any) {
    this.bookings.set(booking.id, booking);
  }
}

class InMemoryUserRepository {
  users = new Map<string, any>();

  constructor(users: Record<string, any>) {
    Object.entries(users).forEach(([id, user]) => {
      this.users.set(id, user);
    });
  }

  async getById(id: string) {
    return this.users.get(id);
  }
}

const createBookRoom =
  ({ userRepository, bookingRepository, dateProvider = () => new Date() }) =>
  async ({ userId, bookingId, bookingDetails }) => {
    const user = await userRepository.getById(userId);
    const booking = user.bookRoom({ bookingId, bookingDetails });
    return bookingRepository.save(booking);
  };

it('should book a room', async () => {
  const bookingRepository = new InMemoryBookingRepository();
  const userRepository = new InMemoryUserRepository({
    bob: new User({ id: 'bob', name: 'Bob' }),
  });
  const bookRoom = createBookRoom({
    userRepository,
    bookingRepository,
  });

  await bookRoom({
    userId: 'bob',
    bookingId: 'booking-42',
    bookingDetails: { price: 50 },
  });

  const savedBooking = await bookingRepository.getById('booking-42');
  expect(savedBooking).toEqual({
    id: 'booking-42',
    price: 50,
  });

  /**
   *
   * class User {
   *  constructor(private readonly props: { id: string; name: string }) * {}
   *
   *   bookRoom({ bookingId, bookingDetails }) {
   *     return {
   *       id: bookingId,
   *       price: bookingDetails.price,
   *     };
   *   }
   * }
   *
   * const createBookRoom =
   *   ({ userRepository, bookingRepository }) =>
   *   async ({ userId, bookingId, bookingDetails }) => {
   *     const user = await userRepository.getById(userId);
   *     const booking = user.bookRoom({ bookingId, bookingDetails });
   *     return bookingRepository.save(booking);
   *   };
   */
});

it('should book a room without discount if it is not the user birthday', async () => {
  const bookingRepository = new InMemoryBookingRepository();
  const userRepository = new InMemoryUserRepository({
    bob: new User({ id: 'bob', name: 'Bob' }),
  });
  const bookRoom = createBookRoom({
    userRepository,
    bookingRepository,
  });

  await bookRoom({
    userId: 'bob',
    bookingId: 'booking-42',
    bookingDetails: { price: 50 },
  });

  const savedBooking = await bookingRepository.getById('booking-42');
  expect(savedBooking).toEqual({
    id: 'booking-42',
    price: 50,
  });

  /**
   *
   * class User {
   *  constructor(private readonly props: { id: string; name: string }) * {}
   *
   *   bookRoom({ bookingId, bookingDetails }) {
   *     return {
   *       id: bookingId,
   *       price: bookingDetails.price,
   *     };
   *   }
   * }
   *
   * const createBookRoom =
   *   ({ userRepository, bookingRepository }) =>
   *   async ({ userId, bookingId, bookingDetails }) => {
   *     const user = await userRepository.getById(userId);
   *     const booking = user.bookRoom({ bookingId, bookingDetails });
   *     return bookingRepository.save(booking);
   *   };
   */
});

it("should apply a discount for a room booking that occurs on the customer's birthday", async () => {
  const bookingRepository = new InMemoryBookingRepository();
  const userRepository = new InMemoryUserRepository({
    bob: new User({ id: 'bob', name: 'Bob' }),
  });
  const bookRoom = createBookRoom({
    userRepository,
    bookingRepository,
  });

  await bookRoom({
    userId: 'bob',
    bookingId: 'booking-42',
    bookingDetails: { price: 50 },
  });

  const savedBooking = await bookingRepository.getById('booking-42');
  expect(savedBooking).toEqual({
    id: 'booking-42',
    price: 50,
  });
});

test('isBirthday', () => {
  expect(isBirthday(new Date('2021-01-01'), new Date('2022-01-01'))).toBe(true);
  /**
   * const isBirthday = (birthday: Date, date: Date) => true;
   */

  expect(isBirthday(new Date('2021-01-01'), new Date('2022-01-02'))).toBe(
    false,
  );
  /**
   * const isBirthday = (birthday: Date, date: Date) => {
   *   return date.getDate() === birthday.getDate();
   * };
   */

  expect(isBirthday(new Date('2021-02-01'), new Date('2022-01-01'))).toBe(
    false,
  );
  /**
   * const isBirthday = (birthday: Date, date: Date) => {
   *   return (
   *     date.getDate() === birthday.getDate() &&
   *     date.getMonth() === birthday.getMonth()
   *   );
   * };
   */
});
