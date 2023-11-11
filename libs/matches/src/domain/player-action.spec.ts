import {
  ButCarotteAction,
  ButKetchupMisAction,
  ButKetchupPrisAction,
  ButMaladeAction,
  ButNormalAction,
} from './player-action';

describe('Player actions', () => {
  test('But normal', () => {
    expect(new ButNormalAction('player', 0).shots).toEqual(1);
    expect(new ButNormalAction('player', 2).shots).toEqual(3);
  });
  test('But malade', () => {
    expect(new ButMaladeAction('player', 0).shots).toEqual(2);
    expect(new ButMaladeAction('player', 2).shots).toEqual(6);
  });
  test('But carotte', () => {
    expect(new ButCarotteAction('player', 0).shots).toEqual(0.5);
    expect(new ButCarotteAction('player', 2).shots).toEqual(1.5);
  });
  test('But ketchup', () => {
    expect(new ButKetchupMisAction('player', 0).shots).toEqual(0.5);
    expect(new ButKetchupPrisAction('player', 0).shots).toEqual(1);
  });
});
