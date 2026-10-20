import assert from 'node:assert/strict';
import test from 'node:test';

import { selectMapHomeCategoryResult } from '../../search/model/mapHomeCategory.ts';

const food = { category: 'FOOD', id: 1, name: 'Food' };
const cafe = { category: 'CAFE', id: 2, name: 'Cafe' };

test('a category with no matches stays empty instead of falling back to all places', () => {
  assert.deepEqual(selectMapHomeCategoryResult([food], 'cafe', 'ready'), {
    places: [],
    state: 'category-empty',
  });
});

test('a selected category returns only matching places and all restores the source list', () => {
  assert.deepEqual(selectMapHomeCategoryResult([food, cafe], 'cafe', 'ready'), {
    places: [cafe],
    state: 'ready',
  });
  assert.deepEqual(selectMapHomeCategoryResult([food, cafe], 'all', 'ready'), {
    places: [food, cafe],
    state: 'ready',
  });
});

test('category filtering preserves the existing user-facing category aliases', () => {
  const coffeeShop = { category: 'Coffee shop', id: 3, name: 'Coffee' };

  assert.deepEqual(selectMapHomeCategoryResult([coffeeShop], 'cafe', 'ready'), {
    places: [coffeeShop],
    state: 'ready',
  });
});

test('source loading, error, and empty states take precedence over category emptiness', () => {
  for (const state of ['loading', 'error', 'empty']) {
    assert.deepEqual(selectMapHomeCategoryResult([], 'cafe', state), {
      places: [],
      state,
    });
  }
});
