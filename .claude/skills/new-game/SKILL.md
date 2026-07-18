---
name: new-game
description: Build a new single-file browser game for this site and ship it live on GitHub Pages through a reviewed pull request. Use whenever someone wants to add a new game to this repo (e.g. "/new-game make a breakout game", "let's add a maze game").
---

# Adding a new game to this site

This repo hosts a collection of small single-file browser games
(`snake.html`, `pong.html`, the tic-tac-toe game at `index.html`, ...).
Follow this process end-to-end for every new game — it's the same
flow used for the existing ones, so stay consistent with it rather
than inventing a new structure.

## 1. Figure out what to build

If it isn't already obvious from what was asked, ask ONE quick
question to pin down the game (e.g. "What kind of game — something
like Snake, Breakout, a maze, a quiz?"). Don't interrogate with a long
back-and-forth; a kid using this wants to see something playable
fast. Pick sensible defaults yourself for anything not specified
(controls, difficulty, colors) rather than asking about every detail.

## 2. Build it as one self-contained HTML file

- Single file: `<game-name>.html` (lowercase, hyphen-free, e.g.
  `breakout.html`), at the **repo root** — no subfolders. That
  matches every existing game here.
- No external dependencies (no CDN scripts/fonts) — inline
  everything, so it works offline and never breaks from a dead link.
- Dark background, light text, `system-ui`/monospace font, centered
  layout, responsive to small screens — look at `snake.html` or
  `pong.html` for the established visual style and reuse it rather
  than inventing a new one each time.
- Show the controls somewhere on the page (a hint line under the
  game), and make it keyboard- and click/tap-friendly.

## 3. Verify it actually works before shipping it

Don't skip this — a broken game merged straight to a live site is a
bad experience. Serve the file locally and drive it headlessly:

```bash
python3 -m http.server 8123 &
timeout 15 bash -c 'until curl -sf http://localhost:8123/<game-name>.html >/dev/null; do sleep 0.5; done'
chromium --headless --disable-gpu --no-sandbox --screenshot=/tmp/check.png \
  --window-size=800,600 http://localhost:8123/<game-name>.html
```

Look at the screenshot (read it as an image) to confirm it actually
rendered the game and not a blank page or an error. If the game has
interactive logic worth checking (scoring, collisions, win
conditions), drive it further with the Chrome DevTools Protocol the
same way this repo's Pong game was verified — launch
`chromium --headless=new --remote-debugging-port=<port>
--remote-allow-origins=*`, connect over the websocket, and use
`Runtime.evaluate` to inspect game state and `Input.dispatchKeyEvent`
to simulate play. Check for console errors before calling it done.

Kill the local server and any headless Chromium processes you started
once you're done checking.

## 4. Ship it through a pull request

Never push straight to `master`. Work in a scratch clone so you don't
disturb whatever's checked out elsewhere:

```bash
git clone https://github.com/gcowan/analytics.git /tmp/analytics-work
cd /tmp/analytics-work
git checkout -b claude/add-<game-name>-game
# git config user.name / user.email locally first if not already set
cp <path-to-built-file> <game-name>.html
git add <game-name>.html
git commit -m "Add <game-name> game"
git push -u origin claude/add-<game-name>-game
gh pr create --title "Add <game-name> game" \
  --body "Adds <game-name>.html — <one-line description>. Verified locally: <what you checked>."
```

Tell whoever's driving the PR URL, and **ask before merging** — don't
merge it yourself without a go-ahead, even though this is a low-stakes
personal repo. Once they say yes:

```bash
gh pr merge <number> --repo gcowan/analytics --merge
```

## 5. Make it live on GitHub Pages

This is the step that's easy to forget: **GitHub Pages serves from
the `gh-pages` branch, not `master`**. Merging to `master` alone does
NOT make the game live. `gh-pages` has its own extra commits (the
site's homepage), so don't force-push or overwrite it — merge
`master` into it:

```bash
cd /tmp/analytics-work
git fetch origin master gh-pages
git checkout -B gh-pages origin/gh-pages
git merge origin/master -m "Merge master into gh-pages: add <game-name>.html"
git push origin gh-pages
```

Then confirm it's actually live (Pages rebuilds can take ~30-60s, so
poll rather than checking once):

```bash
for i in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://gcowan.github.io/analytics/<game-name>.html)
  [ "$code" = "200" ] && echo "live!" && break
  sleep 5
done
```

Report the final URL back:
`http://gcowan.github.io/analytics/<game-name>.html`.

## Notes

- `snake.html` and `pong.html` are good reference points for style
  and structure — skim one before building a new game.
- If `gh` isn't authenticated (`gh auth status` fails), that has to be
  fixed by whoever's running this in an interactive terminal
  (`gh auth login`) — it can't be done from a non-interactive session.
