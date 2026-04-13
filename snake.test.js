/**
 * snake.test.js — unit tests for snake-logic.js
 *
 * Run with:  node snake.test.js
 * No external dependencies — uses Node.js built-in assert module.
 */
'use strict';

const assert = require('assert');
const { createState, onSnake, randomEmpty, applyDir, step } = require('./snake-logic.js');

// ── Minimal test harness ───────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('  \u2713 ' + name);
    passed++;
  } catch (e) {
    console.error('  \u2717 ' + name);
    console.error('    ' + e.message);
    failed++;
  }
}

function group(name) {
  console.log('\n' + name);
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Fixed RNG that always returns the same value — prevents randomEmpty loops. */
function fixedRng(value) {
  return function () { return value; };
}

/** Create a state with specific snake/food/dir overrides for targeted tests. */
function makeState(overrides) {
  return Object.assign(createState(25, 25), overrides);
}

// ── createState ────────────────────────────────────────────────────────────
group('createState');

test('returns an object with required keys', function () {
  const s = createState(25, 25);
  ['cols', 'rows', 'snake', 'dir', 'nextDir', 'food', 'bonus',
    'score', 'level', 'speed', 'running', 'paused'].forEach(function (k) {
    assert.ok(k in s, 'missing key: ' + k);
  });
});

test('snake starts with 3 segments', function () {
  const s = createState(25, 25);
  assert.strictEqual(s.snake.length, 3);
});

test('snake starts moving right', function () {
  const s = createState(25, 25);
  assert.deepStrictEqual(s.dir,     { x: 1, y: 0 });
  assert.deepStrictEqual(s.nextDir, { x: 1, y: 0 });
});

test('starts at level 1, score 0, speed 150', function () {
  const s = createState(25, 25);
  assert.strictEqual(s.level, 1);
  assert.strictEqual(s.score, 0);
  assert.strictEqual(s.speed, 150);
});

test('running is true, paused is false', function () {
  const s = createState(25, 25);
  assert.strictEqual(s.running, true);
  assert.strictEqual(s.paused,  false);
});

test('respects custom grid dimensions', function () {
  const s = createState(10, 8);
  assert.strictEqual(s.cols, 10);
  assert.strictEqual(s.rows, 8);
});

test('snake head is in the centre of the grid', function () {
  const s = createState(25, 25);
  assert.strictEqual(s.snake[0].x, 12);
  assert.strictEqual(s.snake[0].y, 12);
});

// ── onSnake ────────────────────────────────────────────────────────────────
group('onSnake');

test('returns true for every segment of the snake', function () {
  const s = createState(25, 25);
  s.snake.forEach(function (seg) {
    assert.strictEqual(onSnake(s.snake, seg), true);
  });
});

test('returns false for a cell not on the snake', function () {
  const s = createState(25, 25);
  assert.strictEqual(onSnake(s.snake, { x: 0, y: 0 }), false);
});

// ── randomEmpty ────────────────────────────────────────────────────────────
group('randomEmpty');

test('result is never on the snake', function () {
  const s   = createState(25, 25);
  const pos = randomEmpty(s.snake, null, 25, 25);
  assert.strictEqual(onSnake(s.snake, pos), false);
});

test('result is never at the existing food position', function () {
  const s    = createState(25, 25);
  const food = { x: 5, y: 5 };
  for (let i = 0; i < 20; i++) {
    const pos = randomEmpty(s.snake, food, 25, 25);
    assert.ok(!(pos.x === food.x && pos.y === food.y), 'landed on old food');
  }
});

test('result is within grid bounds', function () {
  const s = createState(25, 25);
  for (let i = 0; i < 20; i++) {
    const pos = randomEmpty(s.snake, null, 25, 25);
    assert.ok(pos.x >= 0 && pos.x < 25 && pos.y >= 0 && pos.y < 25);
  }
});

// ── applyDir ───────────────────────────────────────────────────────────────
group('applyDir');

test('queues a valid direction change (right → up)', function () {
  const s  = createState(25, 25); // dir = right
  const s2 = applyDir(s, { x: 0, y: -1 });
  assert.deepStrictEqual(s2.nextDir, { x: 0, y: -1 });
});

test('does not mutate the original state', function () {
  const s  = createState(25, 25);
  applyDir(s, { x: 0, y: -1 });
  assert.deepStrictEqual(s.nextDir, { x: 1, y: 0 }); // unchanged
});

test('ignores a direct reversal on the x axis (right → left)', function () {
  const s  = createState(25, 25); // dir = right
  const s2 = applyDir(s, { x: -1, y: 0 });
  assert.deepStrictEqual(s2.nextDir, { x: 1, y: 0 }); // unchanged
});

test('ignores a direct reversal on the y axis (down → up)', function () {
  // Commit a downward dir first
  let s = makeState({ dir: { x: 0, y: 1 }, nextDir: { x: 0, y: 1 } });
  const s2 = applyDir(s, { x: 0, y: -1 });
  assert.deepStrictEqual(s2.nextDir, { x: 0, y: 1 }); // unchanged
});

test('allows a perpendicular turn from a vertical direction', function () {
  let s = makeState({ dir: { x: 0, y: 1 }, nextDir: { x: 0, y: 1 } });
  const s2 = applyDir(s, { x: 1, y: 0 });
  assert.deepStrictEqual(s2.nextDir, { x: 1, y: 0 });
});

// ── step — movement ────────────────────────────────────────────────────────
group('step — movement');

test('head advances in the current direction', function () {
  const s  = createState(25, 25); // head=(12,12), dir=right
  const s2 = step(s);
  assert.deepStrictEqual(s2.snake[0], { x: 13, y: 12 });
});

test('snake length stays the same when no food is eaten', function () {
  const s  = createState(25, 25);
  const s2 = step(s);
  assert.strictEqual(s2.snake.length, s.snake.length);
});

test('does not mutate the original state', function () {
  const s = createState(25, 25);
  step(s);
  assert.deepStrictEqual(s.snake[0], { x: 12, y: 12 });
});

test('returns same state when paused', function () {
  const s  = makeState({ paused: true });
  const s2 = step(s);
  assert.deepStrictEqual(s2.snake[0], s.snake[0]);
});

test('returns same state when not running', function () {
  const s  = makeState({ running: false });
  const s2 = step(s);
  assert.deepStrictEqual(s2.snake[0], s.snake[0]);
});

// ── step — wall collisions ─────────────────────────────────────────────────
group('step — wall collisions');

test('right wall → game over', function () {
  const s  = makeState({
    snake:   [{ x: 24, y: 12 }, { x: 23, y: 12 }, { x: 22, y: 12 }],
    dir:     { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food:    { x: 2, y: 2 },
  });
  assert.strictEqual(step(s).running, false);
});

test('left wall → game over', function () {
  const s = makeState({
    snake:   [{ x: 0, y: 12 }, { x: 1, y: 12 }, { x: 2, y: 12 }],
    dir:     { x: -1, y: 0 },
    nextDir: { x: -1, y: 0 },
    food:    { x: 10, y: 10 },
  });
  assert.strictEqual(step(s).running, false);
});

test('top wall → game over', function () {
  const s = makeState({
    snake:   [{ x: 12, y: 0 }, { x: 12, y: 1 }, { x: 12, y: 2 }],
    dir:     { x: 0, y: -1 },
    nextDir: { x: 0, y: -1 },
    food:    { x: 2, y: 2 },
  });
  assert.strictEqual(step(s).running, false);
});

test('bottom wall → game over', function () {
  const s = makeState({
    snake:   [{ x: 12, y: 24 }, { x: 12, y: 23 }, { x: 12, y: 22 }],
    dir:     { x: 0, y: 1 },
    nextDir: { x: 0, y: 1 },
    food:    { x: 2, y: 2 },
  });
  assert.strictEqual(step(s).running, false);
});

// ── step — self collision ──────────────────────────────────────────────────
group('step — self collision');

test('head moving into body segment → game over', function () {
  // Snake curls: head at (5,5) moving right into (6,5) which is body
  const s = makeState({
    snake:   [{ x:5,y:5 }, { x:6,y:5 }, { x:6,y:6 }, { x:5,y:6 }],
    dir:     { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food:    { x: 20, y: 20 },
  });
  assert.strictEqual(step(s).running, false);
});

test('head moving into its own tail (not eating) is allowed', function () {
  // Tail is directly ahead and will vacate — this should NOT be game over.
  // Snake: head=(5,5)→right; body=(6,5),(7,5); tail=(8,5) BUT we curve back:
  // Layout: head(3,5), body(4,5),(5,5), tail(6,5); dir = right → head goes to (4,5)?
  // Easier case: small grid, snake = [A,B,C] where head moves to C's position.
  // head=(2,0), body=(1,0), tail=(0,0); dir=left (-1,0) → new head=(-1) — wall.
  // Let's build a valid case: head=(1,0) going left, tail=(0,0).
  // head would move to (0,0) == tail. Tail vacates → should be allowed.
  const s = makeState({
    cols:    10,
    rows:    10,
    snake:   [{ x:1,y:0 }, { x:1,y:1 }, { x:0,y:1 }],
    dir:     { x:-1, y:0 },
    nextDir: { x:-1, y:0 },
    food:    { x:9, y:9 },
  });
  // head (1,0) + dir(-1,0) = (0,0); snake tail is at (0,1), not (0,0)
  // Wait — this doesn't match. Let me redo:
  // head=(1,0), dir=left → newHead=(0,0). tail=(0,1). (0,0) != (0,1). Not a tail collision.
  // For a real tail-collision-allowed test:
  // snake = [ (2,0),(1,0),(0,0) ], dir = left, newHead = (1,0) — body collision → game over.
  // Actually testing the TAIL case:
  // snake = [ (0,1),(0,0),(1,0) ], dir = right (+x), newHead = (1,1)
  // tail = (1,0), newHead=(1,1) ≠ (1,0) — not a tail collision either.
  //
  // The clearest test: snake going in a U-shape where the tail is exactly one step ahead.
  // snake = [ (3,0),(2,0),(1,0),(0,0),(0,1),(1,1),(2,1),(3,1) ]
  //   head at (3,0), dir=down (+y), newHead=(3,1) == tail.
  //   tail=(3,1) will vacate → allowed.
  const snake = [
    {x:3,y:0},{x:2,y:0},{x:1,y:0},{x:0,y:0},
    {x:0,y:1},{x:1,y:1},{x:2,y:1},{x:3,y:1},
  ];
  const s2 = makeState({
    cols:    10,
    rows:    10,
    snake:   snake,
    dir:     { x: 0, y: 1 },
    nextDir: { x: 0, y: 1 },
    food:    { x: 9, y: 9 },
  });
  assert.strictEqual(step(s2).running, true, 'moving into vacating tail should not be game over');
});

// ── step — food eating ─────────────────────────────────────────────────────
group('step — food eating');

test('eating food increases score by 10 × level', function () {
  const s = makeState({
    snake:   [{ x:4,y:5 }, { x:3,y:5 }, { x:2,y:5 }],
    dir:     { x:1, y:0 },
    nextDir: { x:1, y:0 },
    food:    { x:5, y:5 },
    score:   0,
    level:   1,
  });
  assert.strictEqual(step(s, fixedRng(0.9)).score, 10);
});

test('eating food at level 2 scores 20', function () {
  const s = makeState({
    snake:   [{ x:4,y:5 }, { x:3,y:5 }, { x:2,y:5 }],
    dir:     { x:1, y:0 },
    nextDir: { x:1, y:0 },
    food:    { x:5, y:5 },
    score:   0,
    level:   2,
  });
  assert.strictEqual(step(s, fixedRng(0.9)).score, 20);
});

test('eating food grows the snake by 1', function () {
  const s = makeState({
    snake:   [{ x:4,y:5 }, { x:3,y:5 }, { x:2,y:5 }],
    dir:     { x:1, y:0 },
    nextDir: { x:1, y:0 },
    food:    { x:5, y:5 },
  });
  assert.strictEqual(step(s, fixedRng(0.9)).snake.length, 4);
});

test('eating food places new food at a different position', function () {
  const s = makeState({
    snake:   [{ x:4,y:5 }, { x:3,y:5 }, { x:2,y:5 }],
    dir:     { x:1, y:0 },
    nextDir: { x:1, y:0 },
    food:    { x:5, y:5 },
  });
  const s2 = step(s, fixedRng(0.9));
  assert.ok(!(s2.food.x === 5 && s2.food.y === 5), 'food should move after being eaten');
});

test('eating food sets justAte to true', function () {
  const s = makeState({
    snake:   [{ x:4,y:5 }, { x:3,y:5 }, { x:2,y:5 }],
    dir:     { x:1, y:0 },
    nextDir: { x:1, y:0 },
    food:    { x:5, y:5 },
  });
  assert.strictEqual(step(s, fixedRng(0.9)).justAte, true);
});

test('not eating food leaves justAte false', function () {
  const s  = createState(25, 25); // food is far from head
  const s2 = step(s);
  assert.strictEqual(s2.justAte, false);
});

// ── step — level up ────────────────────────────────────────────────────────
group('step — level up');

test('level increases when score crosses threshold', function () {
  // Threshold for level 1: 1 * 50 * 1 = 50. Score 40 + 10 = 50 → level up.
  const s = makeState({
    snake:   [{ x:4,y:5 }, { x:3,y:5 }, { x:2,y:5 }],
    dir:     { x:1, y:0 },
    nextDir: { x:1, y:0 },
    food:    { x:5, y:5 },
    score:   40,
    level:   1,
    speed:   150,
  });
  const s2 = step(s, fixedRng(0.9));
  assert.strictEqual(s2.level, 2);
});

test('speed (interval) decreases on level up', function () {
  const s = makeState({
    snake:   [{ x:4,y:5 }, { x:3,y:5 }, { x:2,y:5 }],
    dir:     { x:1, y:0 },
    nextDir: { x:1, y:0 },
    food:    { x:5, y:5 },
    score:   40,
    level:   1,
    speed:   150,
  });
  const s2 = step(s, fixedRng(0.9));
  assert.ok(s2.speed < 150, 'speed interval should decrease (game gets faster)');
});

test('speed does not drop below 60 ms', function () {
  const s = makeState({
    snake:   [{ x:4,y:5 }, { x:3,y:5 }, { x:2,y:5 }],
    dir:     { x:1, y:0 },
    nextDir: { x:1, y:0 },
    food:    { x:5, y:5 },
    score:   40,
    level:   1,
    speed:   60,  // already at minimum
  });
  const s2 = step(s, fixedRng(0.9));
  assert.ok(s2.speed >= 60);
});

test('no level-up when score is below threshold', function () {
  const s = makeState({
    snake:   [{ x:4,y:5 }, { x:3,y:5 }, { x:2,y:5 }],
    dir:     { x:1, y:0 },
    nextDir: { x:1, y:0 },
    food:    { x:5, y:5 },
    score:   20, // 20 + 10 = 30 < 50
    level:   1,
  });
  assert.strictEqual(step(s, fixedRng(0.9)).level, 1);
});

// ── step — bonus item ──────────────────────────────────────────────────────
group('step — bonus item');

test('eating a bonus clears it from state', function () {
  const s = makeState({
    snake:   [{ x:4,y:5 }, { x:3,y:5 }, { x:2,y:5 }],
    dir:     { x:1, y:0 },
    nextDir: { x:1, y:0 },
    food:    { x:20,y:20 },
    bonus:   { x:5, y:5 },
    score:   0,
    level:   1,
  });
  assert.strictEqual(step(s).bonus, null);
});

test('eating a bonus scores 50 × level', function () {
  const s = makeState({
    snake:   [{ x:4,y:5 }, { x:3,y:5 }, { x:2,y:5 }],
    dir:     { x:1, y:0 },
    nextDir: { x:1, y:0 },
    food:    { x:20,y:20 },
    bonus:   { x:5, y:5 },
    score:   0,
    level:   1,
  });
  assert.strictEqual(step(s).score, 50);
});

test('eating a bonus at level 2 scores 100', function () {
  const s = makeState({
    snake:   [{ x:4,y:5 }, { x:3,y:5 }, { x:2,y:5 }],
    dir:     { x:1, y:0 },
    nextDir: { x:1, y:0 },
    food:    { x:20,y:20 },
    bonus:   { x:5, y:5 },
    score:   0,
    level:   2,
  });
  assert.strictEqual(step(s).score, 100);
});

test('passing a bonus without eating it leaves it in place', function () {
  const s = makeState({
    snake:   [{ x:4,y:5 }, { x:3,y:5 }, { x:2,y:5 }],
    dir:     { x:1, y:0 },
    nextDir: { x:1, y:0 },
    food:    { x:20,y:20 },
    bonus:   { x:8, y:8 }, // not on the path
    score:   0,
  });
  const s2 = step(s);
  assert.deepStrictEqual(s2.bonus, { x:8, y:8 });
});

// ── Summary ────────────────────────────────────────────────────────────────
console.log('\n' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);
