import { MOSAIC_TILES, MOSAIC_VERSION } from './mosaicTiles';

/**
 * Tilted, slowly scrolling wall of chapter and ColorStack nationals photos, sitting
 * behind the auth pages. Adjacent columns drift in opposite directions, which reads
 * as movement without anything sliding far enough to distract from the form.
 *
 * Tiles come from scripts/build-mosaic.mjs, which cuts a grid of crops out of each
 * source photo. Do not point this at the originals: they are 12 MB together.
 *
 * Pure CSS. Each column lists its tiles twice and animates to -50%, so the loop is
 * seamless with no JS ticking every frame.
 */

/**
 * The chapter only has about 14 usable photos, so the wall is kept deliberately
 * coarse: fewer, larger tiles means fewer slots to fill and far fewer repeats.
 * Raising these numbers makes the repetition obvious again.
 */
const COLUMNS = 6;
const TILES_PER_COLUMN = 4;

/** Deterministic RNG, so the layout is stable across renders and reloads. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: readonly T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Deals every tile out before reusing any, reshuffling between passes, so the
 * repeats that are unavoidable land as far apart as possible and a photo never
 * shows up twice inside one column.
 */
function buildGrid(): string[][] {
  const needed = COLUMNS * TILES_PER_COLUMN;
  const sequence: string[] = [];
  for (let pass = 0; sequence.length < needed; pass++) {
    sequence.push(...shuffled(MOSAIC_TILES, 1337 + pass));
  }
  return Array.from({ length: COLUMNS }, (_, c) =>
    sequence.slice(c * TILES_PER_COLUMN, (c + 1) * TILES_PER_COLUMN)
  );
}

const GRID = buildGrid();

export default function PhotoMosaic() {
  return (
    <div className="mosaic" aria-hidden="true">
      <div className="mosaic-grid">
        {GRID.map((tiles, col) => (
          <div
            key={col}
            className="mosaic-col"
            style={{
              // Staggered durations keep the columns from ever resyncing.
              animationDuration: `${58 + col * 9}s`,
              animationDirection: col % 2 === 0 ? 'normal' : 'reverse',
            }}
          >
            {/* Listed twice: the second copy is what makes the wrap seamless. */}
            {[...tiles, ...tiles].map((name, i) => (
              <img
                key={`${name}-${i}`}
                src={`/images/mosaic/${MOSAIC_VERSION}/${name}.webp`}
                alt=""
                className="mosaic-tile"
                loading={col < 4 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mosaic-wash" />
    </div>
  );
}
