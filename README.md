# Rainwormhole

A 2D portal puzzler in 13 kilobytes. Built for [js13kGames 2026](https://js13kgames.com/) —
theme: *Unicorns and Rainbows*.

**[Play it here](https://cuneytinann.github.io/Rainwormhole/)**

The unicorn's horn fires the cold portal, her tail fires the warm one. Portals stick to
clouds like wet paint and slide straight off stone. Between the two ends a rainbow
wormhole stretches open — that's where the name comes from.

Final submission: **12,878 bytes** zipped (limit 13,312). 21 levels, no external
resources, every pixel drawn in code and every sound synthesised at runtime.

---

## Controls

| | Desktop | Mobile |
|---|---|---|
| Move | `A` `D` or arrows | ◀ ▶ |
| Jump | `Space` / `W` / `↑` | ⬆ |
| Cold portal (horn) | left click | ◉ blue |
| Warm portal (tail) | right click | ◉ orange |
| Grab / drop | `E` | ▣ |
| Restart level | `R` | ⟳ |
| Mute | `M` | ♪ |
| Aim | mouse | tap anywhere |

---

## The mechanic

Most portal games let you aim anywhere. This one doesn't.

```
horn  -110.0° .. +20.1°   (130.1° arc, in front)
tail   +49.8° .. +200.0°  (150.1° arc, behind)
```

The two arcs don't overlap. **79.8° of the circle belongs to neither** — split into a
29.8° gap above and a 50.0° gap below. A limb outside its sector fades visually and
won't fire, which is free feedback in no language at all.

The consequence: to place both ends of a wormhole you usually have to **turn the horse
around**. Roughly half the puzzles are really about which way she's facing.

One design constraint worth recording: when the horse turns, a local angle `A` becomes
`180° − A`. Up (−90°) and down (+90°) are the **fixed points** of that transformation,
so a blind spot placed there survives the turn and kills that direction permanently. An
earlier "horn forward, tail backward" layout left a 78° dead zone straight up. The
sectors are asymmetric on purpose.

### Other rules

- Portals only hold on **cloud** (`=`). Stone (`#`) rejects them.
- A failed shot **destroys that limb's existing portal** — miss, hit stone, or land
  within 20.4 px of the other portal and it pops.
- Momentum carries through, and every transit multiplies it by `BOOST = 1.12`, capped at
  17 px/frame. Looping a portal pair builds speed; that's the only way across some rooms.
- Measured jump reach on flat ground, key held: **2.02 tiles up, 5.2 tiles across**. The
  horizontal figure surprises people — air acceleration (`4.2`) is higher than run speed
  (`2.4`), so you accelerate *while airborne*.

---

## Tiles

Levels are 26×14 grids of characters, 24 px per tile, play field 624×336.

| | |
|---|---|
| `.` | empty |
| `#` | stone — portals **don't** stick |
| `=` | cloud — portals **do** stick |
| `S` | spawn |
| `E` | exit (treasure chest) |
| `C` | cube — carried with `E`, presses buttons, blocks lasers |
| `A` | anvil — too heavy to carry, falls through portals, crushes, presses buttons |
| `B` | button |
| `G` | gate (open while a button is held or a receiver is lit) |
| `\|` | prism curtain — strips portals that touch it |
| `^` | black ink — instant death, swallows cubes and shades alike |
| `K` | shade — patrols; portals refuse to carry it |
| `L` | laser emitter — fires at its first open neighbour |
| `R` | laser receiver — opens the gate, and **latches** once lit |

Lasers bend through portals (up to 3 hops), kill the player and shades on contact, and
are blocked by cubes — including a cube you're carrying, which makes it a shield.

---

## Levels

21 levels, no hint text anywhere. Every rule is taught by the shape of the room.

1. basics — tail down, horn up, fall
2. two walls — enter a portal by **walking**, not falling
3. turn around — the target sits in the blind spot
4. horizontal momentum — fall seven tiles, leave a wall at 14 px/frame
5. the well — vertical momentum out of a one-tile shaft
6. cube, button, gate
7. prism — the beam passes, you don't
8. ink trench
9. shade — open a hole under it; portals don't carry darkness
10. anvil — can't be lifted, can be dropped
11. launch — infinite fall, then steer
12. laser: carry the beam to the receiver
13. laser: burn the shade, then move the portals and the beam dies
14. laser: a ceiling exit throws the beam **downward**
15. prism + cube — send what you carry through a portal
16. soft landing — same fall, two exits, different flight
17. shield — hold the cube in front of the beam
18. latch — the button opens the gate, the receiver keeps it open
19. one wall, two targets — same wall, opposite facings
20. anvil shield — drop what you can't carry into the beam
21. finale

---

## Building

Three stages. The only number that matters is the final zip.

```bash
npm i terser roadroller
pip install zopfli
node paket.js rainwormhole.html Rainwormhole.zip
```

`rainwormhole.html` is the source — commented, with cut markers. `index.html` is the
packed output that ships inside the zip; don't edit it by hand.

| stage | script | index.html | zip |
|---|---|---|---|
| terser only | 36,850 | 37,568 | 14,531 ✗ |
| + Roadroller | 14,929 | 15,647 | 12,056 |
| + zopfli instead of `zip -9` | — | — | **11,695** |

Roadroller isn't optional — without it the entry is 1,219 bytes over the limit. RegPack
was tried and abandoned: it's built for 1k–4k demos and couldn't finish on a 36 KB
payload in ten minutes.

Zopfli is worth ~360 bytes for free. Same DEFLATE format, much longer search, unpacks
anywhere:

```python
import zopfli.zlib, struct, zlib
d = open('index.html','rb').read()
c = zopfli.zlib.compress(d)[2:-4]
n, crc = b'index.html', zlib.crc32(d) & 0xffffffff
dt = ((2026-1980)<<9)|(9<<5)|13; tm = 13<<11      # a VALID DOS date matters
lh = b'PK\x03\x04'+struct.pack('<HHHHHIIIHH',20,0,8,tm,dt,crc,len(c),len(d),len(n),0)+n
cd = b'PK\x01\x02'+struct.pack('<HHHHHHIIIHHHHHII',20,20,0,8,tm,dt,crc,len(c),len(d),len(n),0,0,0,0,0,0)+n
eo = b'PK\x05\x06'+struct.pack('<HHHHIIH',0,0,1,1,len(cd),len(lh)+len(c),0)
open('out.zip','wb').write(lh+c+cd+eo)
```

### Cut markers

Blocks that can be removed with one command if the budget runs out. Each is marked
`/*--CUT:TAG--*/`, and `/*--KEEP-IF-CUT:TAG--*/` blocks are the fallbacks that take over.

| tag | what | saves |
|---|---|---|
| `MUZIK` | rain ambience + thunder | ~261 |
| `PLAY` | title screen | ~145 |
| `IDLE` | rearing animation | ~143 |
| `JUMP` | jump animation | ~53 |

---

## Verification

Eyeballing lied repeatedly during this project, so most claims here are measured.

- **Scripted solutions.** 18 of the 21 levels have a keypress-by-keypress script that
  plays the intended solution and asserts the exit is reached. Run after every change.
- **Teleport scan.** Every valid portal pair in every level × 3 lateral offsets ×
  3 entry speeds — 87,588 transitions, 0 leaving the player embedded in a wall or off
  the map.
- **Trap test.** No spawn sealed in a pocket; gravity-aware reachability confirms the
  exit is unreachable without portals in all 21 rooms.
- **Console.** The packed build runs 600 frames with zero thrown errors and zero console
  output.

Two engine bugs were found by the solver, not by playing:

1. The variable-jump cut (`if(!jump && vy < -2) vy = -2`) was clamping *all* upward
   velocity, including portal launches — 8.8 px/frame in, −1.2 out. Vertical momentum
   had never worked.
2. The entry window for a floor portal was 7 px wide. The player box is 17 px in a 24 px
   tile, so a 1 px overhang let the neighbouring floor catch you. Fixed in `passable()`.

---

## Accessibility

The rainbow tube between portals uses **counter-phase** contrast: the pattern doesn't
move, the contrast inverts, 7.5 times a second. That's above the 3 Hz limit in
WCAG 2.3.1, so it relies on the **area exception**.

Measured across all 21 levels using the worst case in each (the most distant valid
portal pair, i.e. the longest possible tube): the flashing area peaks at **0.44 % of the
screen**, against a 25 % threshold. `FS_AMP` is held at 12 for this reason — please
don't raise it without re-measuring.

---

## Credits

Sound engine: **[ZzFX](https://github.com/KilledByAPixel/ZzFX)** by Frank Force, MIT.
The 17 effects and the rain ambience are original — ZzFX is the instrument, not the
notes. The rain doesn't go through ZzFX at all; it's a custom seamless buffer.

Everything else — code, art, physics, levels — is original.

A note for anyone reading the source: the code comments are in **Turkish**. Sorry. The
comments carry the *why* behind most decisions, so they're worth a translator if you're
digging.

## Repository

| file | what |
|---|---|
| `rainwormhole.html` | **source** — commented, cut markers, edit here |
| `index.html` | packed build, 17,210 bytes |
| `Rainwormhole.zip` | the submitted entry, 12,878 bytes |
| `paket.js` | build chain |
| `bolum-atolyesi.html` | level editor — drop the game file on it and it runs *that* build, so it can't go stale |
| `genlik-tezgahi.html` | flicker/amplitude bench with live WCAG numbers |

## Licence

MIT. See `LICENSE`.
