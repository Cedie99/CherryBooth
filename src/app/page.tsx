"use client";

import { useEffect, useMemo, useState } from "react";

type LayoutOption = {
  key: string;
  label: string;
  frames: number;
  columns: number;
};

type FilterOption = {
  key: string;
  css: string;
};

type DesignState = {
  title: string;
  subtitle: string;
  layout: string;
  padding: number;
  gap: number;
  roundness: number;
  borderColor: string;
  borderWidth: number;
  backgroundColor: string;
  filter: string;
  stickers: string[];
  framePalette: string[];
};

const defaultPalette = ["#ff78ad", "#c4bbff", "#f7d867", "#8fe7cb"];
const backgroundSwatches = ["#fff8fd", "#f4ebf2", "#f1c8db", "#f18cb4", "#ef608f", "#ffe98f", "#ffd76b"];
const borderSwatches = ["#f474a2", "#df4b84", "#ca9eff", "#73d8b0", "#f3be71", "#4f2346"];
const stickerOptions = ["♥", "🎀", "✨", "🌸", "🦋", "🍒", "📸", "⭐"];

const layoutOptions: LayoutOption[] = [
  { key: "strip4", label: "4-strip", frames: 4, columns: 1 },
  { key: "strip3", label: "3-strip", frames: 3, columns: 1 },
  { key: "grid2x2", label: "2×2 grid", frames: 4, columns: 2 },
  { key: "duo", label: "duo", frames: 2, columns: 2 },
];

const filterOptions: FilterOption[] = [
  { key: "Original", css: "none" },
  { key: "Rosy", css: "saturate(1.1) hue-rotate(-7deg)" },
  { key: "Dreamy", css: "contrast(0.95) brightness(1.06) saturate(1.22)" },
  { key: "Sweet", css: "brightness(1.07) saturate(1.28)" },
  { key: "Pastel", css: "saturate(0.75) brightness(1.08)" },
  { key: "Fairy", css: "contrast(0.9) saturate(1.15) hue-rotate(12deg)" },
  { key: "Vintage", css: "sepia(0.25) contrast(0.88)" },
  { key: "B&W", css: "grayscale(1) contrast(1.05)" },
];

const templateCards: Array<{
  name: string;
  tag: string;
  preset: Partial<DesignState>;
}> = [
  {
    name: "Strawberry",
    tag: "Sweet",
    preset: {
      title: "strawberry day",
      borderColor: "#ff8cb9",
      backgroundColor: "#fff8fd",
      filter: "Sweet",
      framePalette: ["#ff86b6", "#ffb6cf", "#ffd76b", "#ffdff0"],
      stickers: ["🍒", "♥", "✨"],
    },
  },
  {
    name: "Cloud Nine",
    tag: "Dreamy",
    preset: {
      title: "cloud nine",
      borderColor: "#d6c7ff",
      backgroundColor: "#f4ebf2",
      filter: "Dreamy",
      framePalette: ["#d8ccff", "#c4bbff", "#f6d9ff", "#f0ecff"],
      stickers: ["✨", "⭐", "🦋"],
    },
  },
  {
    name: "Date Night",
    tag: "Couples",
    preset: {
      title: "date night",
      borderColor: "#3c1234",
      backgroundColor: "#f1c8db",
      filter: "Vintage",
      framePalette: ["#b36a8d", "#f3a6c7", "#8f4f73", "#f7bfd7"],
      stickers: ["♥", "🎀"],
    },
  },
  {
    name: "Bestie",
    tag: "BFF",
    preset: {
      title: "bestie booth",
      borderColor: "#ff76ac",
      backgroundColor: "#ffe98f",
      filter: "Rosy",
      framePalette: ["#ff76ac", "#ffd76b", "#8fe7cb", "#c4bbff"],
      stickers: ["🌸", "📸", "✨"],
    },
  },
  {
    name: "Garden",
    tag: "BFF",
    preset: {
      title: "garden snap",
      borderColor: "#73d8b0",
      backgroundColor: "#f4ebf2",
      filter: "Pastel",
      framePalette: ["#73d8b0", "#8fe7cb", "#ffe98f", "#f8d4e5"],
      stickers: ["🌸", "🦋"],
    },
  },
  {
    name: "Y2K",
    tag: "Sweet",
    preset: {
      title: "y2k cutie",
      borderColor: "#f4a4dc",
      backgroundColor: "#ffd76b",
      filter: "Fairy",
      framePalette: ["#f4a4dc", "#c4bbff", "#ff94bf", "#f7d867"],
      stickers: ["⭐", "🎀", "♥"],
    },
  },
];

const defaultRecentCards = [
  "Mia & Leo",
  "jules + soph",
  "Hana",
  "the bestie crew",
  "A & J wedding",
  "kira",
  "mom & me",
  "the prom group",
];

const defaultDesign: DesignState = {
  title: "Cherry Booth",
  subtitle: "spring 2026",
  layout: "strip4",
  padding: 12,
  gap: 8,
  roundness: 14,
  borderColor: "#f474a2",
  borderWidth: 2,
  backgroundColor: "#fff8fd",
  filter: "Rosy",
  stickers: ["♥", "✨", "🎀"],
  framePalette: defaultPalette,
};

function shufflePalette(colors: string[]) {
  const next = [...colors];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [next[index], next[target]] = [next[target], next[index]];
  }
  return next;
}

function getLayoutByKey(layout: string) {
  return layoutOptions.find((item) => item.key === layout) ?? layoutOptions[0];
}

function getFilterCss(filter: string) {
  return filterOptions.find((item) => item.key === filter)?.css ?? "none";
}

function toggleSticker(stickers: string[], value: string) {
  if (stickers.includes(value)) {
    return stickers.filter((sticker) => sticker !== value);
  }
  return [...stickers, value].slice(0, 4);
}

function loadStoredDesign() {
  if (typeof window === "undefined") {
    return defaultDesign;
  }

  const saved = localStorage.getItem("cherry-strip-design");
  if (!saved) {
    return defaultDesign;
  }

  try {
    return { ...defaultDesign, ...JSON.parse(saved) };
  } catch {
    return defaultDesign;
  }
}

function loadStoredRecentCards() {
  if (typeof window === "undefined") {
    return defaultRecentCards;
  }

  const saved = localStorage.getItem("cherry-strip-recent");
  if (!saved) {
    return defaultRecentCards;
  }

  try {
    return JSON.parse(saved) as string[];
  } catch {
    return defaultRecentCards;
  }
}

function loadStoredCount() {
  if (typeof window === "undefined") {
    return 0;
  }

  const value = localStorage.getItem("cherry-strip-count");
  return Number(value) || 0;
}

function downloadStripAsPng(design: DesignState) {
  const layout = getLayoutByKey(design.layout);
  const rows = Math.ceil(layout.frames / layout.columns);
  const frameWidth = layout.columns === 1 ? 410 : 290;
  const frameHeight = layout.columns === 1 ? 280 : 215;
  const canvasPadding = 28;

  const canvasWidth =
    canvasPadding * 2 +
    design.padding * 2 +
    layout.columns * frameWidth +
    (layout.columns - 1) * design.gap;
  const canvasHeight =
    canvasPadding * 2 +
    design.padding * 2 +
    rows * frameHeight +
    (rows - 1) * design.gap +
    130;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.fillStyle = "#f5e8ef";
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  context.fillStyle = design.backgroundColor;
  context.strokeStyle = design.borderColor;
  context.lineWidth = design.borderWidth * 2;

  const stripX = canvasPadding;
  const stripY = canvasPadding;
  const stripWidth = canvasWidth - canvasPadding * 2;
  const stripHeight = canvasHeight - canvasPadding * 2;

  context.beginPath();
  context.roundRect(stripX, stripY, stripWidth, stripHeight, design.roundness * 1.8);
  context.fill();
  context.stroke();

  const startX = stripX + design.padding;
  const startY = stripY + design.padding;

  for (let index = 0; index < layout.frames; index += 1) {
    const column = index % layout.columns;
    const row = Math.floor(index / layout.columns);
    const x = startX + column * (frameWidth + design.gap);
    const y = startY + row * (frameHeight + design.gap);

    context.fillStyle = design.framePalette[index % design.framePalette.length];
    context.beginPath();
    context.roundRect(x, y, frameWidth, frameHeight, design.roundness);
    context.fill();

    context.fillStyle = "rgba(255, 255, 255, 0.85)";
    context.font = "700 26px Nunito";
    context.fillText(`#${index + 1}`, x + frameWidth - 62, y + frameHeight - 18);
  }

  context.fillStyle = "#5d2a4f";
  context.font = "700 42px Caveat";
  context.fillText(design.title || "My Strip", startX, canvasHeight - 58);
  context.font = "700 18px Nunito";
  context.fillText(design.subtitle || "cherry booth", startX, canvasHeight - 26);

  context.font = "600 38px Nunito";
  design.stickers.slice(0, 4).forEach((sticker, index) => {
    context.fillText(sticker, canvasWidth - 62 - index * 44, canvasHeight - 26);
  });

  const link = document.createElement("a");
  link.download = `${(design.title || "my-strip").toLowerCase().replaceAll(" ", "-")}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function StripPreview({
  design,
  compact = false,
}: {
  design: DesignState;
  compact?: boolean;
}) {
  const layout = getLayoutByKey(design.layout);
  const frameHeight = compact ? 52 : layout.columns === 1 ? 88 : 76;

  return (
    <div
      className={`strip ${compact ? "strip-compact" : ""}`}
      style={{
        borderColor: design.borderColor,
        borderWidth: design.borderWidth,
        background: design.backgroundColor,
        padding: compact ? 6 : design.padding,
        borderRadius: compact ? 12 : design.roundness + 4,
      }}
    >
      <div
        className="strip-grid"
        style={{
          gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
          gap: compact ? 4 : design.gap,
          filter: getFilterCss(design.filter),
        }}
      >
        {Array.from({ length: layout.frames }).map((_, index) => (
          <div
            key={`${design.framePalette[index % design.framePalette.length]}-${index}`}
            className="strip-frame"
            style={{
              background: design.framePalette[index % design.framePalette.length],
              minHeight: frameHeight,
              borderRadius: compact ? 8 : design.roundness,
            }}
          >
            <span>#{index + 1}</span>
          </div>
        ))}
      </div>
      <div className="strip-footer" style={{ fontSize: compact ? "0.62rem" : "0.82rem" }}>
        <p>{design.title || "Untitled strip"}</p>
        <p>{design.subtitle || "cherry booth"}</p>
      </div>
      {!compact ? (
        <div className="strip-stickers">
          {design.stickers.slice(0, 4).map((sticker) => (
            <span key={sticker}>{sticker}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Home() {
  const [design, setDesign] = useState<DesignState>(loadStoredDesign);
  const [recentCards, setRecentCards] = useState(loadStoredRecentCards);
  const [savedCount, setSavedCount] = useState(loadStoredCount);

  const activeLayout = useMemo(() => getLayoutByKey(design.layout), [design.layout]);

  useEffect(() => {
    localStorage.setItem("cherry-strip-design", JSON.stringify(design));
  }, [design]);

  const saveCurrentStrip = () => {
    const label = design.title.trim() || `strip ${savedCount + 1}`;
    const nextRecent = [label, ...recentCards.filter((item) => item !== label)].slice(0, 8);
    const nextCount = savedCount + 1;
    setRecentCards(nextRecent);
    setSavedCount(nextCount);
    localStorage.setItem("cherry-strip-recent", JSON.stringify(nextRecent));
    localStorage.setItem("cherry-strip-count", String(nextCount));
  };

  const resetDesign = () => {
    setDesign(defaultDesign);
  };

  const randomizeColors = () => {
    setDesign((current) => ({ ...current, framePalette: shufflePalette(current.framePalette) }));
  };

  const applyTemplate = (preset: Partial<DesignState>) => {
    setDesign((current) => ({ ...current, ...preset }));
  };

  return (
    <div className="min-h-screen cherry-ui">
      <div className="fixed left-6 top-24 text-6xl hidden xl:block opacity-70">🌸</div>
      <div className="fixed left-6 top-[66%] text-5xl hidden xl:block opacity-70">✨</div>
      <div className="fixed right-9 top-52 text-6xl hidden xl:block opacity-60">♥</div>
      <div className="fixed right-9 top-[44%] text-5xl hidden xl:block opacity-65">🦋</div>
      <div className="fixed right-9 top-[84%] text-5xl hidden xl:block opacity-65">🎀</div>

      <header className="sticky top-0 z-20 border-b border-dashed border-[var(--pink-200)] bg-[color:var(--page-bg)]/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1380px] items-center justify-between px-5 py-4 sm:px-10">
          <div className="flex items-center gap-3">
            <button className="heart-chip" onClick={resetDesign} type="button" aria-label="Reset design">
              ♥
            </button>
            <h1 className="brand-logo">cherry <span>booth · 2026</span></h1>
          </div>

          <p className="hidden text-sm text-[var(--ink-soft)] md:block">
            ❀ a self-serve studio for cute strips, made with love ❀
          </p>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-1 sm:flex">
              {design.framePalette.map((color) => (
                <span key={color} className="palette-dot" style={{ backgroundColor: color }} />
              ))}
            </div>
            <button className="ghost-pill" onClick={randomizeColors} type="button">
              Shuffle colors
            </button>
            <button className="pink-pill" onClick={saveCurrentStrip} type="button">
              ♥ Save strip
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1380px] flex-col gap-12 px-5 py-9 sm:px-10">
        <section className="hero-wrap">
          <p className="kicker">✿ spring 2026 · issue 01 ✿</p>
          <h2 className="hero-title">
            Make it <span>cute</span>,
            <br />
            make it <span>yours</span>.
          </h2>
          <p className="hero-copy">
            Design your own strip: pick a vibe, tweak spacing and shape, add stickers,
            and export a print-ready keepsake.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <article className="panel-card">
            <div className="panel-topline">
              <span>♡ step 01 · capture</span>
              <span>live ♥</span>
            </div>
            <h3>Say cheese!</h3>
            <div className="camera-box">
              <span>● live</span>
              <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="panel-row">
              <button className="capture-btn" type="button" onClick={randomizeColors}>♥</button>
              <div>
                <p>tap heart to remix palette</p>
                <p className="muted">
                  {activeLayout.frames} photos · {activeLayout.columns === 1 ? "vertical" : "grid"} layout
                </p>
              </div>
            </div>
            <div className="slider-line">
              <span>Frames</span>
              <div className="track"><i style={{ width: `${activeLayout.frames * 25}%` }} /></div>
              <span>{activeLayout.frames}x</span>
            </div>
            <div className="slider-line">
              <span>Stickers</span>
              <div className="track"><i style={{ width: `${Math.max(10, design.stickers.length * 25)}%` }} /></div>
              <span>{design.stickers.length}</span>
            </div>
          </article>

          <article className="panel-card">
            <div className="panel-topline">
              <span>♡ step 02 · make it yours</span>
              <span>live preview →</span>
            </div>
            <h3>Customize ♥</h3>

            <p className="label">Strip text</p>
            <div className="field-grid">
              <input
                className="text-input"
                value={design.title}
                onChange={(event) => setDesign((current) => ({ ...current, title: event.target.value }))}
                maxLength={26}
                placeholder="Strip title"
              />
              <input
                className="text-input"
                value={design.subtitle}
                onChange={(event) => setDesign((current) => ({ ...current, subtitle: event.target.value }))}
                maxLength={28}
                placeholder="Subtitle"
              />
            </div>

            <p className="label">Layout</p>
            <div className="layout-grid">
              {layoutOptions.map((option) => (
                <button
                  key={option.key}
                  className={`layout-option ${design.layout === option.key ? "active" : ""}`}
                  type="button"
                  onClick={() => setDesign((current) => ({ ...current, layout: option.key }))}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="slider-line slider-input-line">
              <span>Padding</span>
              <input
                className="range-input"
                type="range"
                min={6}
                max={22}
                value={design.padding}
                onChange={(event) =>
                  setDesign((current) => ({ ...current, padding: Number(event.target.value) }))
                }
              />
              <span>{design.padding}</span>
            </div>
            <div className="slider-line slider-input-line">
              <span>Gap</span>
              <input
                className="range-input"
                type="range"
                min={4}
                max={16}
                value={design.gap}
                onChange={(event) =>
                  setDesign((current) => ({ ...current, gap: Number(event.target.value) }))
                }
              />
              <span>{design.gap}</span>
            </div>
            <div className="slider-line slider-input-line">
              <span>Round</span>
              <input
                className="range-input"
                type="range"
                min={6}
                max={24}
                value={design.roundness}
                onChange={(event) =>
                  setDesign((current) => ({ ...current, roundness: Number(event.target.value) }))
                }
              />
              <span>{design.roundness}</span>
            </div>
            <div className="slider-line slider-input-line">
              <span>Border</span>
              <input
                className="range-input"
                type="range"
                min={1}
                max={5}
                value={design.borderWidth}
                onChange={(event) =>
                  setDesign((current) => ({ ...current, borderWidth: Number(event.target.value) }))
                }
              />
              <span>{design.borderWidth}px</span>
            </div>

            <p className="label">Filter</p>
            <div className="pill-grid">
              {filterOptions.map((item) => (
                <button
                  key={item.key}
                  className={`tiny-pill ${item.key === design.filter ? "on" : ""}`}
                  type="button"
                  onClick={() => setDesign((current) => ({ ...current, filter: item.key }))}
                >
                  {item.key}
                </button>
              ))}
            </div>
            <p className="label">Background</p>
            <div className="swatches">
              {backgroundSwatches.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`swatch-btn ${color === design.backgroundColor ? "active" : ""}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Set background ${color}`}
                  onClick={() => setDesign((current) => ({ ...current, backgroundColor: color }))}
                />
              ))}
            </div>

            <p className="label">Border color</p>
            <div className="swatches">
              {borderSwatches.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`swatch-btn ${color === design.borderColor ? "active" : ""}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Set border ${color}`}
                  onClick={() => setDesign((current) => ({ ...current, borderColor: color }))}
                />
              ))}
            </div>

            <p className="label">Stickers</p>
            <div className="sticker-grid">
              {stickerOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`sticker-chip ${design.stickers.includes(item) ? "on" : ""}`}
                  onClick={() =>
                    setDesign((current) => ({ ...current, stickers: toggleSticker(current.stickers, item) }))
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </article>

          <article className="panel-card">
            <div className="panel-topline">
              <span>♡ step 03 · preview</span>
              <span>print-ready</span>
            </div>
            <h3>Print ready ✿</h3>
            <p className="preview-heading">Live strip mockup</p>
            <div className="preview-canvas">
              <StripPreview design={design} />
            </div>
            <div className="tool-row">
              <button className="pink-pill" type="button" onClick={() => downloadStripAsPng(design)}>
                ♥ Download PNG
              </button>
              <button className="ghost-pill" type="button" onClick={saveCurrentStrip}>
                Save to recent
              </button>
            </div>
            <p className="tiny-note">Export uses local rendering in your browser, no upload required.</p>
          </article>
        </section>

        <section className="section-shell">
          <div className="section-head">
            <div>
              <p className="kicker">✿ s 02 · the library</p>
              <h3>Pick a <span>cutie.</span></h3>
            </div>
            <div className="pill-grid">
              {["All", "Sweet", "Dreamy", "Couples", "BFF"].map((item, index) => (
                <button key={item} className={`tiny-pill ${index === 0 ? "on" : ""}`} type="button">
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="template-grid">
            {templateCards.map((card) => (
              <article key={card.name} className="template-card">
                <StripPreview design={{ ...design, ...card.preset }} compact />
                <div className="card-meta">
                  <h4>{card.name}</h4>
                  <span>{card.tag}</span>
                </div>
                <span className="edge" style={{ borderColor: card.preset.borderColor }} />
                <button className="mini-btn" type="button" onClick={() => applyTemplate(card.preset)}>
                  Use template
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell">
          <div className="section-head">
            <div>
              <p className="kicker">✿ s 03 · recently made</p>
              <h3>Sweet things from this week ♥</h3>
            </div>
          </div>

          <div className="recent-row">
            {recentCards.map((name) => (
              <article key={name} className="recent-item">
                <StripPreview design={design} compact />
                <p>{name}</p>
              </article>
            ))}
          </div>

          <div className="cta-banner">
            <h3>
              Print it.
              <br />
              Post it.
              <br />
              <span>Keep it sweet.</span>
            </h3>
            <div>
              <p>
                Every strip can be customized frame-by-frame and exported instantly.
                Save your favorites and remix templates in one click.
              </p>
              <div className="cta-actions">
                <button className="pink-pill" type="button" onClick={() => downloadStripAsPng(design)}>
                  ♥ Download
                </button>
                <button className="ghost-dark" type="button" onClick={saveCurrentStrip}>Save design</button>
                <button className="ghost-dark" type="button" onClick={randomizeColors}>Remix colors</button>
                <button className="ghost-dark" type="button" onClick={resetDesign}>Reset</button>
              </div>
              <p className="muted">♥ {8402 + savedCount} strips made this week</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-3 w-full max-w-[1380px] border-t border-dashed border-[var(--pink-200)] px-5 py-6 text-xs text-[var(--ink-soft)] sm:px-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <p>♥ © 2026 cherry/booth · made with love</p>
          <p>booth 02 · pink room · open until midnight</p>
        </div>
      </footer>
    </div>
  );
}
