import { subtract, sum } from './sum';

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('subtract 1 - 1 to equal 0', () => {
  expect(subtract(1, 1)).toBe(0);
});
