/**
 * snake-logic.js — pure, stateless game logic for Snake.
 *
 * Works in both browser (exposes window.SnakeLogic) and Node.js (module.exports).
 * All functions take a state object and return a NEW state — nothing is mutated.
 */
(function (exports) {
  'use strict';

  /**
   * Create the initial game state.
   * Food is placed at a safe default; callers should immediately replace it
   * with randomEmpty() for a truly random starting position.
   *
   * @param {number} [cols=25]
   * @param {number} [rows=25]
   * @returns {object}
   */
  function createState(cols, rows) {
    cols = cols || 25;
    rows = rows || 25;
    var cx = Math.floor(cols / 2);
    var cy = Math.floor(rows / 2);
    return {
      cols:    cols,
      rows:    rows,
      snake:   [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }],
      dir:     { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food:    { x: 2, y: 2 },
      bonus:   null,
      score:   0,
      level:   1,
      speed:   150,   // interval in ms; lower = faster
      running: true,
      paused:  false,
      justAte: false, // true for exactly the tick food was eaten
    };
  }

  /**
   * Return true if pos coincides with any snake segment.
   *
   * @param {Array}  snake
   * @param {{x,y}}  pos
   * @returns {boolean}
   */
  function onSnake(snake, pos) {
    return snake.some(function (s) { return s.x === pos.x && s.y === pos.y; });
  }

  /**
   * Return a random grid cell not occupied by the snake or the current food.
   *
   * @param {Array}       snake
   * @param {{x,y}|null}  food   - existing food cell to avoid (pass null if none)
   * @param {number}      cols
   * @param {number}      rows
   * @param {function}    [rng]  - () => [0,1); defaults to Math.random
   * @returns {{x,y}}
   */
  function randomEmpty(snake, food, cols, rows, rng) {
    rng = rng || Math.random;
    var pos;
    var attempts = 0;
    do {
      pos = { x: Math.floor(rng() * cols), y: Math.floor(rng() * rows) };
      if (++attempts > cols * rows * 2) break; // safety valve on near-full grids
    } while (
      onSnake(snake, pos) ||
      (food !== null && food !== undefined && pos.x === food.x && pos.y === food.y)
    );
    return pos;
  }

  /**
   * Queue a direction change.  A 180° reversal is silently ignored.
   * Returns the same state object (not a copy) when the direction is rejected.
   *
   * @param {object}  state
   * @param {{x,y}}   d     - desired direction
   * @returns {object}
   */
  function applyDir(state, d) {
    if (d.x !== 0 && d.x === -state.dir.x) return state;
    if (d.y !== 0 && d.y === -state.dir.y) return state;
    return Object.assign({}, state, { nextDir: { x: d.x, y: d.y } });
  }

  /**
   * Advance the game by one tick.  Returns a new state — input is not mutated.
   *
   * Key behaviours:
   *   - Wall or self collision  → running: false  (game over)
   *   - Food eaten              → snake grows, score increases, new food placed,
   *                               level/speed may increase, justAte: true
   *   - Bonus eaten             → score increases, bonus cleared, justAte: true
   *   - Paused or not running   → state returned unchanged
   *
   * Collision check: the tail segment is excluded from the self-collision check
   * when the snake is not eating (the tail will vacate that cell this tick).
   * When the snake IS eating, the full body is checked because the tail stays.
   *
   * @param {object}    state
   * @param {function}  [rng]  - () => [0,1); defaults to Math.random
   * @returns {object}
   */
  function step(state, rng) {
    if (!state.running || state.paused) {
      return Object.assign({}, state, { justAte: false });
    }

    var cols = state.cols;
    var rows = state.rows;
    var dir  = { x: state.nextDir.x, y: state.nextDir.y };
    var head = { x: state.snake[0].x + dir.x, y: state.snake[0].y + dir.y };

    // ── Wall collision ────────────────────────────────────────────────────────
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      return Object.assign({}, state, { running: false, dir: dir, justAte: false });
    }

    // ── Self collision ────────────────────────────────────────────────────────
    // Determine whether food will be eaten this tick so we know if the tail moves.
    var food     = state.food;
    var willEat  = food && head.x === food.x && head.y === food.y;
    // If not eating, the tail vacates its cell — exclude it from the check.
    var bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);
    if (bodyToCheck.some(function (s) { return s.x === head.x && s.y === head.y; })) {
      return Object.assign({}, state, { running: false, dir: dir, justAte: false });
    }

    // ── Move ──────────────────────────────────────────────────────────────────
    var newSnake = [head].concat(state.snake);
    var bonus    = state.bonus;
    var score    = state.score;
    var level    = state.level;
    var speed    = state.speed;
    var justAte  = false;

    if (willEat) {
      score  += 10 * level;
      justAte = true;
      food    = randomEmpty(newSnake, null, cols, rows, rng);
      if (score >= level * 50 * level) {
        level++;
        speed = Math.max(60, speed - 15);
      }
    } else if (bonus && head.x === bonus.x && head.y === bonus.y) {
      score  += 50 * level;
      bonus   = null;
      justAte = true;
    }

    // Remove tail only when no food was eaten
    var finalSnake = justAte && willEat ? newSnake : newSnake.slice(0, -1);

    return Object.assign({}, state, {
      snake:   finalSnake,
      dir:     dir,
      food:    food,
      bonus:   bonus,
      score:   score,
      level:   level,
      speed:   speed,
      justAte: justAte,
    });
  }

  // ── Exports ─────────────────────────────────────────────────────────────────
  exports.createState  = createState;
  exports.onSnake      = onSnake;
  exports.randomEmpty  = randomEmpty;
  exports.applyDir     = applyDir;
  exports.step         = step;

})(typeof module !== 'undefined' ? module.exports : (window.SnakeLogic = window.SnakeLogic || {}));
