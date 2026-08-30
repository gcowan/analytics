# OG Games — a rebuild of the `og-games` page

A modern replacement for the "OG Games" page on newvisiontutoring.net: a small,
fast, offline-capable set of Orton–Gillingham practice games plus the supporting
content a parent actually needs to use them.

## Status and one important caveat

The live page at `https://www.newvisiontutoring.net/og-games.html` could not be
read while this was built — the network policy on the build machine blocks that
domain, and the archive copy was unavailable too. So this is a rebuild against
the *purpose* of the page (Orton–Gillingham practice games for New Vision
Tutoring's students), not a like-for-like port of its current wording or link
list.

Two things follow from that:

- If the current page lists specific games, activities or downloads, send them
  over and they can be folded in — the games are data-driven, so word banks and
  new activities are cheap to add.
- All the copy here is a first draft written in the voice of a tutoring practice.
  It should be read and edited by whoever owns the brand before it goes live.

## What is here

| File | What it is |
| --- | --- |
| `index.html` | The hub: what to play, in what order, filtered by skill and stage |
| `blend.html` | **Blend & Build** — sound-by-sound reading, then spelling from dictation |
| `sound-sort.html` | **Sound Sort** — ck/k/ke, ch/tch, ge/dge, soft c and g, ai/ay, FLOSS |
| `syllables.html` | **Syllable Split** — mark vowels, cut the word, name both syllable types |
| `heart-words.html` | **Heart Words** — map the regular sounds, learn the odd part, write from memory |
| `word-chains.html` | **Word Chains** — change one phoneme at a time |
| `suffix-lab.html` | **Suffix Lab** — double / drop the e / y to i / just add it |
| `how-to-use.html` | Parent guide: dosage, error-correction scripts, when to move on |
| `word-lists.html` | Every word bank, printable — plus a custom-list link builder for tutors |
| `data/words.js` | All curriculum content in one editable file |
| `assets/og.css` | Design system: tokens, components, light/dark, print |
| `assets/og.js` | Shared runtime: settings, speech, local progress, shareable lists |
| `sw.js`, `manifest.webmanifest` | Offline support and home-screen install |

`../og-games.html` is a redirect stub so the original URL keeps working.

## The ideas that matter

**Games follow a scope and sequence, and the site says so.** The old model of a
page of unrelated links leaves a parent guessing. Every game here is tagged with
a stage, the hub opens with "not sure where to start?", and the guide says
explicitly when to move up and when to drop back.

**The rule is taught, not just tested.** Sound Sort prints the rule above the
round and explains the reasoning at the end, including the exceptions
(`rich, much, such, which`). A child who can state the rule can spell words that
were never on the list.

**Tutor-authored word lists, with no accounts anywhere.** In `word-lists.html` a
tutor pastes this week's words and gets a link. The words are encoded *into the
link*, so there is no database, no login, no homework portal, and nothing to
maintain. It also means there is no personal data to protect — worth saying out
loud on a site aimed at children.

**Reading comfort is a first-class control.** The **Aa** button sets text size,
letter spacing, line spacing, typeface (including Verdana, widely recommended
for dyslexic readers) and a background tint, and remembers the choice per
device. Increased letter spacing has real evidence behind it; the tint is
offered as a comfort preference, deliberately without a therapeutic claim.

**Speech without a server.** Sound buttons use the browser's own speech engine,
so no audio files ship and no recording ever leaves the device. Each grapheme is
spoken as *sound + key word* ("sss, sun"), which is how it is taught in session.

**It works when the internet does not.** A service worker caches everything on
first visit; "Add to Home Screen" makes it open like an app. Practice in the car
is exactly the use case.

## Alternatives worth considering next

1. **Move the whole site off the current builder.** These pages load in well
   under a second with no third-party requests. If the rest of the site is on a
   drag-and-drop builder, the games will feel conspicuously faster than
   everything around them; a static site (GitHub Pages, Netlify, Cloudflare
   Pages) for the whole thing removes that mismatch and costs nothing.
2. **Or embed, if the builder stays.** Each game works inside an `<iframe>`
   pointed at the hosted copy, so the existing site keeps its navigation while
   the games live here.
3. **A "what should we practise?" check.** Ten items that place a child on the
   sequence and deep-link them to the right game. It is the single highest-value
   addition to the content and reuses the word banks already in `data/words.js`.
4. **A printable weekly practice sheet** generated from the same list a tutor
   shares — the on-screen game and the paper homework then match exactly.
5. **Progress a tutor can see.** Currently intentionally private to the device.
   An export button ("copy this week's results") would let a parent paste results
   into an email without anyone building an account system.
6. **More sets, same shapes.** `data/words.js` is deliberately the only file that
   needs editing to add vowel teams, prefixes/roots, or a spelling-list mode.
7. **Recorded human audio for the key words.** Browser voices vary in quality;
   ~40 short recordings would fix pronunciation of isolated sounds for good.

## Editing the content

Word banks, sorts, syllable words, heart words and chains all live in
`data/words.js`. Adding a decoding set is one entry:

```js
{ id: 'teams-oo', label: 'Vowel team oo', level: 4, skill: 'vowel-teams',
  words: make(['moon','soon','food','pool','room'], 'teams-oo') }
```

`make()` segments each word into graphemes automatically using the table at the
top of the file, so `moon` becomes `m · oo · n` on the tiles with no extra work.

## Checks that were run

Every page was driven headlessly (Playwright/Chromium): each game played through
a full round, the share-link round trip followed end to end, console errors
treated as failures, all nine pages checked for horizontal overflow at 390px,
and the palette checked against WCAG AA (two colours were darkened as a result).
