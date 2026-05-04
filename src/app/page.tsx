"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CameraPanel from "./components/CameraPanel";

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
  fontFamily: string;
  titleAlign: string;
  bgPattern: string;
  showDate: boolean;
  titlePosition: string;
};

type StickerPosition = { x: number; y: number; scale: number; rotation: number };

const defaultStickerPositions: StickerPosition[] = [
  { x: 80, y: 88, scale: 1, rotation: 0 },
  { x: 88, y: 88, scale: 1, rotation: 0 },
  { x: 72, y: 88, scale: 1, rotation: 0 },
  { x: 64, y: 88, scale: 1, rotation: 0 },
];

const defaultPalette = ["#ff78ad", "#c4bbff", "#f7d867", "#8fe7cb"];
const backgroundSwatches = [
  "#ffffff", "#fff8fd", "#f4ebf2", "#f1c8db", "#f18cb4", "#ef608f",
  "#ffe98f", "#ffd76b", "#d4f5e9", "#c4e0ff", "#e8dcff", "#f2f2f2",
  "#2d2d2d", "#1a1a2e", "#fdf6ec", "#f0e6d3",
];
const borderSwatches = [
  "#f474a2", "#df4b84", "#ca9eff", "#73d8b0", "#f3be71", "#4f2346",
  "#ffffff", "#000000", "#d4af37", "#c0c0c0", "#e8c4c4", "#3a5a40",
];
const stickerOptions = [
  "♥", "🎀", "✨", "🌸", "🦋", "🍒", "📸", "⭐",
  "💍", "🥂", "🎓", "🎂", "🎄", "👑", "🌙", "💐",
  "🤍", "🖤", "🫧", "💫", "🎉", "🪩", "🧸", "🩷",
];

const layoutOptions: LayoutOption[] = [
  { key: "strip4", label: "4-strip", frames: 4, columns: 1 },
  { key: "strip3", label: "3-strip", frames: 3, columns: 1 },
  { key: "strip2", label: "2-strip", frames: 2, columns: 1 },
  { key: "grid2x2", label: "2×2 grid", frames: 4, columns: 2 },
  { key: "grid2x3", label: "2×3 grid", frames: 6, columns: 2 },
  { key: "duo", label: "duo", frames: 2, columns: 2 },
  { key: "single", label: "single", frames: 1, columns: 1 },
  { key: "wide3", label: "3-wide", frames: 3, columns: 3 },
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
  { key: "Warm", css: "brightness(1.05) saturate(1.1) sepia(0.12)" },
  { key: "Cool", css: "brightness(1.02) saturate(0.9) hue-rotate(15deg)" },
  { key: "Film", css: "contrast(1.1) saturate(0.85) brightness(0.95)" },
  { key: "Pop", css: "contrast(1.15) saturate(1.4) brightness(1.05)" },
  { key: "Matte", css: "contrast(0.85) brightness(1.1) saturate(0.8)" },
  { key: "Golden", css: "sepia(0.35) saturate(1.2) brightness(1.05)" },
  { key: "Noir", css: "grayscale(0.8) contrast(1.2) brightness(0.9)" },
];

const fontOptions = [
  { key: "script", label: "Script", css: "var(--font-script), cursive" },
  { key: "sans", label: "Sans", css: "var(--font-body), sans-serif" },
  { key: "serif", label: "Serif", css: "var(--font-display), serif" },
  { key: "mono", label: "Mono", css: "var(--font-geist-mono), monospace" },
];

const patternOptions = [
  { key: "solid", label: "Solid" },
  { key: "stripes", label: "Stripes" },
  { key: "polka", label: "Polka" },
  { key: "grid", label: "Grid" },
  { key: "diagonal", label: "Diagonal" },
];

const titleAlignOptions = [
  { key: "left", label: "Left" },
  { key: "center", label: "Center" },
  { key: "right", label: "Right" },
];

const titlePositionOptions = [
  { key: "bottom", label: "Bottom" },
  { key: "top", label: "Top" },
];

const templateTags = ["All", "Sweet", "Dreamy", "Couples", "BFF", "Wedding", "Birthday", "Grad", "Retro", "Minimal", "Holiday", "Party"] as const;

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
      fontFamily: "script",
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
      fontFamily: "script",
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
      fontFamily: "serif",
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
      fontFamily: "script",
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
      fontFamily: "script",
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
      fontFamily: "sans",
    },
  },
  {
    name: "Ever After",
    tag: "Wedding",
    preset: {
      title: "happily ever after",
      subtitle: "the wedding",
      borderColor: "#d4af37",
      backgroundColor: "#fdf6ec",
      filter: "Golden",
      framePalette: ["#f5e6c8", "#ecdcc0", "#e8d4b0", "#f0e2ca"],
      stickers: ["💍", "🥂", "🤍", "💐"],
      fontFamily: "serif",
      bgPattern: "solid",
      layout: "strip4",
    },
  },
  {
    name: "Ivory Blush",
    tag: "Wedding",
    preset: {
      title: "with love",
      subtitle: "our special day",
      borderColor: "#e8c4c4",
      backgroundColor: "#ffffff",
      filter: "Warm",
      framePalette: ["#f5ddd5", "#eddad2", "#fae3db", "#f8e8e2"],
      stickers: ["🤍", "💐", "✨"],
      fontFamily: "serif",
      titleAlign: "center",
      bgPattern: "solid",
    },
  },
  {
    name: "Party Pop",
    tag: "Birthday",
    preset: {
      title: "it's my birthday!",
      subtitle: "let's party",
      borderColor: "#ff6b9d",
      backgroundColor: "#fff8fd",
      filter: "Pop",
      framePalette: ["#ff6b9d", "#ffd93d", "#6bcb77", "#4d96ff"],
      stickers: ["🎂", "🎉", "🎀", "⭐"],
      fontFamily: "script",
      bgPattern: "polka",
    },
  },
  {
    name: "Neon Cake",
    tag: "Birthday",
    preset: {
      title: "b-day vibes",
      subtitle: "another year cuter",
      borderColor: "#ff44cc",
      backgroundColor: "#1a1a2e",
      filter: "Pop",
      framePalette: ["#ff44cc", "#44ffcc", "#ffcc44", "#cc44ff"],
      stickers: ["🎂", "🪩", "✨", "🎉"],
      fontFamily: "sans",
      bgPattern: "solid",
    },
  },
  {
    name: "Cap & Gown",
    tag: "Grad",
    preset: {
      title: "class of 2026",
      subtitle: "we did it!",
      borderColor: "#1a1a2e",
      backgroundColor: "#f2f2f2",
      filter: "Film",
      framePalette: ["#1a1a2e", "#2d3a5c", "#4a5a7a", "#7a8aa0"],
      stickers: ["🎓", "⭐", "✨"],
      fontFamily: "serif",
      titleAlign: "center",
    },
  },
  {
    name: "Gold Grad",
    tag: "Grad",
    preset: {
      title: "the graduate",
      subtitle: "2026",
      borderColor: "#d4af37",
      backgroundColor: "#1a1a2e",
      filter: "Golden",
      framePalette: ["#d4af37", "#c5a028", "#b8941f", "#e0c04a"],
      stickers: ["🎓", "👑", "🥂"],
      fontFamily: "serif",
      bgPattern: "solid",
    },
  },
  {
    name: "Prom Queen",
    tag: "Party",
    preset: {
      title: "prom night",
      subtitle: "dancing queen",
      borderColor: "#ca9eff",
      backgroundColor: "#e8dcff",
      filter: "Fairy",
      framePalette: ["#ca9eff", "#f4a4dc", "#ffd76b", "#8fe7cb"],
      stickers: ["👑", "🪩", "✨", "💫"],
      fontFamily: "script",
      bgPattern: "polka",
    },
  },
  {
    name: "Retro Film",
    tag: "Retro",
    preset: {
      title: "retro booth",
      subtitle: "say cheese",
      borderColor: "#000000",
      backgroundColor: "#f0e6d3",
      filter: "Film",
      framePalette: ["#d4c5a9", "#c4b599", "#b8a88e", "#cfc0a5"],
      stickers: ["📸", "⭐"],
      fontFamily: "mono",
      roundness: 6,
      bgPattern: "stripes",
    },
  },
  {
    name: "Polaroid",
    tag: "Retro",
    preset: {
      title: "instant memories",
      subtitle: "shake it",
      borderColor: "#e0e0e0",
      backgroundColor: "#ffffff",
      filter: "Warm",
      framePalette: ["#f5f5f0", "#f0f0eb", "#eaeae5", "#e8e8e3"],
      stickers: ["📸"],
      fontFamily: "mono",
      padding: 16,
      gap: 8,
      roundness: 6,
      layout: "single",
    },
  },
  {
    name: "Clean",
    tag: "Minimal",
    preset: {
      title: "photo booth",
      subtitle: new Date().toLocaleDateString(),
      borderColor: "#000000",
      backgroundColor: "#ffffff",
      filter: "Original",
      framePalette: ["#f2f2f2", "#e8e8e8", "#f2f2f2", "#e8e8e8"],
      stickers: [],
      fontFamily: "sans",
      borderWidth: 1,
      roundness: 8,
      bgPattern: "solid",
    },
  },
  {
    name: "Noir",
    tag: "Minimal",
    preset: {
      title: "the booth",
      subtitle: "b&w series",
      borderColor: "#ffffff",
      backgroundColor: "#2d2d2d",
      filter: "B&W",
      framePalette: ["#4a4a4a", "#3d3d3d", "#4a4a4a", "#3d3d3d"],
      stickers: ["🖤"],
      fontFamily: "serif",
      bgPattern: "solid",
    },
  },
  {
    name: "Jolly",
    tag: "Holiday",
    preset: {
      title: "merry & bright",
      subtitle: "holiday 2026",
      borderColor: "#3a5a40",
      backgroundColor: "#fdf6ec",
      filter: "Warm",
      framePalette: ["#c62828", "#3a5a40", "#c62828", "#3a5a40"],
      stickers: ["🎄", "⭐", "✨", "🤍"],
      fontFamily: "serif",
      bgPattern: "stripes",
    },
  },
  {
    name: "Champagne",
    tag: "Party",
    preset: {
      title: "cheers!",
      subtitle: "new year's eve",
      borderColor: "#d4af37",
      backgroundColor: "#1a1a2e",
      filter: "Golden",
      framePalette: ["#d4af37", "#f5e6c8", "#d4af37", "#f5e6c8"],
      stickers: ["🥂", "🪩", "✨", "🎉"],
      fontFamily: "serif",
      bgPattern: "polka",
    },
  },
  {
    name: "Baby Love",
    tag: "Sweet",
    preset: {
      title: "baby shower",
      subtitle: "oh baby!",
      borderColor: "#c4e0ff",
      backgroundColor: "#ffffff",
      filter: "Pastel",
      framePalette: ["#c4e0ff", "#ffd6e7", "#c4e0ff", "#ffd6e7"],
      stickers: ["🧸", "🤍", "⭐", "🫧"],
      fontFamily: "script",
      bgPattern: "polka",
      layout: "grid2x2",
    },
  },
  {
    name: "Tropical",
    tag: "Party",
    preset: {
      title: "paradise",
      subtitle: "tropical vibes",
      borderColor: "#ff6b9d",
      backgroundColor: "#d4f5e9",
      filter: "Pop",
      framePalette: ["#ff6b9d", "#ffd93d", "#6bcb77", "#44d4ff"],
      stickers: ["🌸", "✨", "🦋"],
      fontFamily: "script",
      bgPattern: "diagonal",
    },
  },
  {
    name: "Dreamy Blush",
    tag: "Dreamy",
    preset: {
      title: "dreamy days",
      subtitle: "in the clouds",
      borderColor: "#e8c4c4",
      backgroundColor: "#fff8fd",
      filter: "Matte",
      framePalette: ["#f5d5d5", "#e8c4c4", "#fce4ec", "#f8d5e0"],
      stickers: ["🫧", "✨", "🩷", "🌙"],
      fontFamily: "script",
      bgPattern: "solid",
      titleAlign: "center",
    },
  },
  {
    name: "MacBook Cam",
    tag: "Retro",
    preset: {
      title: "photo booth",
      subtitle: "facetime hd",
      borderColor: "#c5c5c5",
      backgroundColor: "#1e1e1e",
      filter: "B&W",
      framePalette: ["#2d2d2d", "#3a3a3a", "#2d2d2d", "#3a3a3a"],
      stickers: ["📷", "🖥️", "💻"],
      fontFamily: "mono",
      roundness: 8,
      borderWidth: 1,
      bgPattern: "solid",
      titleAlign: "center",
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
  fontFamily: "script",
  titleAlign: "left",
  bgPattern: "solid",
  showDate: false,
  titlePosition: "bottom",
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

function getFontCss(fontFamily: string) {
  return fontOptions.find((f) => f.key === fontFamily)?.css ?? fontOptions[0].css;
}

function getPatternCss(pattern: string, bgColor: string) {
  const light = "rgba(255,255,255,0.15)";
  const dark = "rgba(0,0,0,0.04)";
  switch (pattern) {
    case "stripes":
      return `repeating-linear-gradient(0deg, ${dark} 0px, ${dark} 2px, transparent 2px, transparent 14px), ${bgColor}`;
    case "polka":
      return `radial-gradient(circle, ${dark} 2px, transparent 2px) 0 0 / 16px 16px, ${bgColor}`;
    case "grid":
      return `linear-gradient(${light} 1px, transparent 1px) 0 0 / 18px 18px, linear-gradient(90deg, ${light} 1px, transparent 1px) 0 0 / 18px 18px, ${bgColor}`;
    case "diagonal":
      return `repeating-linear-gradient(45deg, ${dark} 0px, ${dark} 2px, transparent 2px, transparent 12px), ${bgColor}`;
    default:
      return bgColor;
  }
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

async function downloadStripAsPng(design: DesignState, photos: string[] = [], stickerPositions: StickerPosition[] = defaultStickerPositions) {
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

  // Pre-load photo images
  const loadedImages: (HTMLImageElement | null)[] = await Promise.all(
    Array.from({ length: layout.frames }).map((_, i) => {
      if (!photos[i]) return Promise.resolve(null);
      return new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = photos[i];
      });
    })
  );

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
  const filterCss = getFilterCss(design.filter);

  for (let index = 0; index < layout.frames; index += 1) {
    const column = index % layout.columns;
    const row = Math.floor(index / layout.columns);
    const x = startX + column * (frameWidth + design.gap);
    const y = startY + row * (frameHeight + design.gap);

    context.fillStyle = design.framePalette[index % design.framePalette.length];
    context.beginPath();
    context.roundRect(x, y, frameWidth, frameHeight, design.roundness);
    context.fill();

    const img = loadedImages[index];
    if (img) {
      context.save();
      context.beginPath();
      context.roundRect(x, y, frameWidth, frameHeight, design.roundness);
      context.clip();
      if (filterCss !== "none") {
        context.filter = filterCss;
      }
      // Cover-fit the image
      const scale = Math.max(frameWidth / img.width, frameHeight / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      context.drawImage(img, x + (frameWidth - drawW) / 2, y + (frameHeight - drawH) / 2, drawW, drawH);
      context.filter = "none";
      context.restore();
    } else {
      context.fillStyle = "rgba(255, 255, 255, 0.85)";
      context.font = "700 26px Nunito";
      context.fillText(`#${index + 1}`, x + frameWidth - 62, y + frameHeight - 18);
    }
  }

  const fontMap: Record<string, string> = {
    script: "Caveat",
    sans: "Nunito",
    serif: "DM Serif Display",
    mono: "Geist Mono",
  };
  const canvasFontName = fontMap[design.fontFamily] || "Caveat";
  const isLight = isLightColor(design.backgroundColor);
  const textColor = isLight ? "#5d2a4f" : "#f8eff5";
  const subColor = isLight ? "#7a4f68" : "#d4b8c8";

  const textAreaY = design.titlePosition === "top" ? stripY + 10 : canvasHeight - 70;

  let textX = startX;
  context.textAlign = "left";
  if (design.titleAlign === "center") {
    textX = canvasWidth / 2;
    context.textAlign = "center";
  } else if (design.titleAlign === "right") {
    textX = canvasWidth - startX;
    context.textAlign = "right";
  }

  context.fillStyle = textColor;
  context.font = `700 42px ${canvasFontName}`;
  context.fillText(design.title || "My Strip", textX, textAreaY);
  context.fillStyle = subColor;
  context.font = `700 18px ${canvasFontName}`;
  context.fillText(design.subtitle || "cherry booth", textX, textAreaY + 32);

  if (design.showDate) {
    context.font = `600 14px Nunito`;
    context.fillText(new Date().toLocaleDateString(), textX, textAreaY + 52);
  }

  context.textAlign = "center";
  context.textBaseline = "middle";
  design.stickers.slice(0, 4).forEach((sticker, index) => {
    const pos = stickerPositions[index] ?? defaultStickerPositions[index] ?? defaultStickerPositions[0];
    const scale = pos.scale ?? 1;
    const rotation = pos.rotation ?? 0;
    context.font = `600 ${Math.round(38 * scale)}px Nunito`;
    const sx = stripX + (pos.x / 100) * stripWidth;
    const sy = stripY + (pos.y / 100) * stripHeight;
    context.save();
    context.translate(sx, sy);
    context.rotate((rotation * Math.PI) / 180);
    context.fillText(sticker, 0, 0);
    context.restore();
  });
  context.textAlign = "left";
  context.textBaseline = "alphabetic";

  const link = document.createElement("a");
  link.download = `${(design.title || "my-strip").toLowerCase().replaceAll(" ", "-")}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function isLightColor(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}

function StripPreview({
  design,
  compact = false,
  photos = [],
  stickerPositions,
  onStickerUpdate,
  onStickerDrop,
}: {
  design: DesignState;
  compact?: boolean;
  photos?: string[];
  stickerPositions?: StickerPosition[];
  onStickerUpdate?: (index: number, pos: StickerPosition) => void;
  onStickerDrop?: (sticker: string, pos: StickerPosition) => void;
}) {
  const layout = getLayoutByKey(design.layout);
  const frameHeight = compact ? 52 : layout.columns === 1 ? 88 : 76;
  const fontCss = getFontCss(design.fontFamily);
  const bgStyle = getPatternCss(design.bgPattern, design.backgroundColor);
  const textColor = isLightColor(design.backgroundColor) ? "#5d2a4f" : "#f8eff5";
  const subtextColor = isLightColor(design.backgroundColor) ? "#7a4f68" : "#d4b8c8";

  const stripRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<number | null>(null);
  const interactionRef = useRef<{
    type: "move" | "resize" | "rotate";
    idx: number;
    startClientX: number;
    startClientY: number;
    startPos: StickerPosition;
  } | null>(null);

  const toPercent = useCallback((clientX: number, clientY: number) => {
    const rect = stripRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    return { x, y };
  }, []);

  const startInteraction = useCallback(
    (e: React.PointerEvent, idx: number, type: "move" | "resize" | "rotate") => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const pos = (stickerPositions ?? defaultStickerPositions)[idx] ?? defaultStickerPositions[0];
      interactionRef.current = { type, idx, startClientX: e.clientX, startClientY: e.clientY, startPos: { ...pos } };
      setSelectedSticker(idx);
    },
    [stickerPositions],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const interaction = interactionRef.current;
      if (!interaction || !onStickerUpdate) return;
      const rect = stripRef.current?.getBoundingClientRect();
      if (!rect) return;
      const { type, idx, startClientX, startClientY, startPos } = interaction;

      if (type === "move") {
        const dx = ((e.clientX - startClientX) / rect.width) * 100;
        const dy = ((e.clientY - startClientY) / rect.height) * 100;
        onStickerUpdate(idx, {
          ...startPos,
          x: Math.max(0, Math.min(100, startPos.x + dx)),
          y: Math.max(0, Math.min(100, startPos.y + dy)),
        });
      } else if (type === "resize") {
        const centerX = rect.left + (startPos.x / 100) * rect.width;
        const centerY = rect.top + (startPos.y / 100) * rect.height;
        const startDist = Math.hypot(startClientX - centerX, startClientY - centerY);
        const currentDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        const factor = startDist > 5 ? currentDist / startDist : 1;
        onStickerUpdate(idx, { ...startPos, scale: Math.max(0.3, Math.min(4, startPos.scale * factor)) });
      } else if (type === "rotate") {
        const centerX = rect.left + (startPos.x / 100) * rect.width;
        const centerY = rect.top + (startPos.y / 100) * rect.height;
        const angle = Math.atan2(e.clientX - centerX, -(e.clientY - centerY)) * (180 / Math.PI);
        onStickerUpdate(idx, { ...startPos, rotation: angle });
      }
    },
    [onStickerUpdate],
  );

  const handlePointerUp = useCallback(() => {
    interactionRef.current = null;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!onStickerDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOver(true);
  }, [onStickerDrop]);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!onStickerDrop) return;
    const sticker = e.dataTransfer.getData("text/plain");
    if (!sticker) return;
    const pt = toPercent(e.clientX, e.clientY);
    if (pt) onStickerDrop(sticker, { ...pt, scale: 1, rotation: 0 });
  }, [onStickerDrop, toPercent]);

  const footerBlock = (
    <div
      className="strip-footer"
      style={{
        fontSize: compact ? "0.62rem" : "0.82rem",
        fontFamily: fontCss,
        textAlign: design.titleAlign as "left" | "center" | "right",
        color: textColor,
      }}
    >
      <p style={{ fontWeight: 700 }}>{design.title || "Untitled strip"}</p>
      <p style={{ color: subtextColor }}>{design.subtitle || "cherry booth"}</p>
      {design.showDate && !compact && (
        <p style={{ fontSize: "0.68rem", color: subtextColor, marginTop: 2 }}>
          {new Date().toLocaleDateString()}
        </p>
      )}
    </div>
  );

  const positions = stickerPositions ?? defaultStickerPositions;
  const interactive = !compact && !!onStickerUpdate;

  return (
    <div
      ref={stripRef}
      className={`strip ${compact ? "strip-compact" : ""} ${dragOver ? "strip-drag-over" : ""}`}
      style={{
        borderColor: design.borderColor,
        borderWidth: design.borderWidth,
        background: bgStyle,
        padding: compact ? 6 : design.padding,
        borderRadius: compact ? 12 : design.roundness + 4,
      }}
      onPointerMove={interactive ? handlePointerMove : undefined}
      onPointerUp={interactive ? handlePointerUp : undefined}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => setSelectedSticker(null)}
    >
      {design.titlePosition === "top" && footerBlock}
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
              overflow: "hidden",
            }}
          >
            {photos[index] ? (
              <img
                src={photos[index]}
                alt={`Shot ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <span>#{index + 1}</span>
            )}
          </div>
        ))}
      </div>
      {design.titlePosition !== "top" && footerBlock}
      {design.stickers.slice(0, 4).map((sticker, i) => {
        const pos = positions[i] ?? defaultStickerPositions[i] ?? defaultStickerPositions[0];
        const scale = pos.scale ?? 1;
        const rotation = pos.rotation ?? 0;
        const baseFontSize = compact ? 0.7 : 1.2;
        const isSelected = interactive && selectedSticker === i;
        return (
          <div
            key={`${sticker}-${i}`}
            className={`sticker-transform-box ${isSelected ? "selected" : ""}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              fontSize: `${baseFontSize * scale}rem`,
            }}
            onClick={(e) => { e.stopPropagation(); if (interactive) setSelectedSticker(i); }}
          >
            <span
              className="sticker-emoji"
              onPointerDown={interactive ? (e) => startInteraction(e, i, "move") : undefined}
            >
              {sticker}
            </span>
            {isSelected && (
              <>
                <div className="sticker-bounds" />
                <div className="sticker-handle sticker-handle-tl" onPointerDown={(e) => startInteraction(e, i, "resize")} />
                <div className="sticker-handle sticker-handle-tr" onPointerDown={(e) => startInteraction(e, i, "resize")} />
                <div className="sticker-handle sticker-handle-bl" onPointerDown={(e) => startInteraction(e, i, "resize")} />
                <div className="sticker-handle sticker-handle-br" onPointerDown={(e) => startInteraction(e, i, "resize")} />
                <div className="sticker-rotate-line" />
                <div className="sticker-rotate-handle" onPointerDown={(e) => startInteraction(e, i, "rotate")} />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [design, setDesign] = useState<DesignState>(defaultDesign);
  const [recentCards, setRecentCards] = useState(defaultRecentCards);
  const [savedCount, setSavedCount] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [templateFilter, setTemplateFilter] = useState("All");
  const [stickerPositions, setStickerPositions] = useState<StickerPosition[]>([...defaultStickerPositions]);

  const handleStickerUpdate = useCallback((index: number, pos: StickerPosition) => {
    setStickerPositions((prev) => {
      const next = [...prev];
      next[index] = pos;
      return next;
    });
  }, []);

  const handleStickerDrop = useCallback((sticker: string, pos: StickerPosition) => {
    setDesign((current) => {
      const existing = current.stickers;
      const idx = existing.indexOf(sticker);
      if (idx !== -1) {
        // Already on the strip — just update its position
        setStickerPositions((prev) => {
          const next = [...prev];
          next[idx] = pos;
          return next;
        });
        return current;
      }
      if (existing.length >= 4) return current; // max 4
      const newStickers = [...existing, sticker];
      setStickerPositions((prev) => {
        const next = [...prev];
        next[newStickers.length - 1] = pos;
        return next;
      });
      return { ...current, stickers: newStickers };
    });
  }, []);

  const activeLayout = useMemo(() => getLayoutByKey(design.layout), [design.layout]);
  const filteredTemplates = useMemo(
    () => templateFilter === "All" ? templateCards : templateCards.filter((c) => c.tag === templateFilter),
    [templateFilter]
  );

  const handlePhotosChange = useCallback((photos: string[]) => {
    setCapturedPhotos(photos);
  }, []);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setDesign(loadStoredDesign());
    setRecentCards(loadStoredRecentCards());
    setSavedCount(loadStoredCount());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("cherry-strip-design", JSON.stringify(design));
  }, [design, hydrated]);

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
      <header className="sticky top-0 z-20 border-b border-dashed border-[var(--pink-200)] bg-[color:var(--page-bg)]/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-5 py-4 sm:px-10">
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
              {design.framePalette.map((color, i) => (
                <span key={i} className="palette-dot" style={{ backgroundColor: color }} />
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

      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-12 px-5 py-9 sm:px-10">
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

        <section className="studio-layout">
            <article className="panel-card">
              <div className="panel-topline">
                <span>♡ step 01 · capture</span>
                <span>{capturedPhotos.length > 0 ? `${capturedPhotos.length}/${activeLayout.frames} shots` : "live ♥"}</span>
              </div>
              <h3>Say cheese!</h3>
              <CameraPanel
                framesNeeded={activeLayout.frames}
                filterCss={getFilterCss(design.filter)}
                onPhotosChange={handlePhotosChange}
              />
            </article>

            <article className="panel-card">
              <div className="panel-topline">
                <span>♡ step 02 · design</span>
                <span>live preview →</span>
              </div>
              <h3>Customize ♥</h3>

              <div className="panel-card-scroll">
              <details className="customize-section" open>
                <summary>Text & Typography</summary>
                <div className="section-body">
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

                  <p className="label">Font</p>
                  <div className="pill-grid">
                    {fontOptions.map((f) => (
                      <button
                        key={f.key}
                        className={`tiny-pill ${f.key === design.fontFamily ? "on" : ""}`}
                        type="button"
                        style={{ fontFamily: f.css }}
                        onClick={() => setDesign((current) => ({ ...current, fontFamily: f.key }))}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <p className="label">Text alignment</p>
                  <div className="pill-grid">
                    {titleAlignOptions.map((a) => (
                      <button
                        key={a.key}
                        className={`tiny-pill ${a.key === design.titleAlign ? "on" : ""}`}
                        type="button"
                        onClick={() => setDesign((current) => ({ ...current, titleAlign: a.key }))}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>

                  <p className="label">Title position</p>
                  <div className="pill-grid">
                    {titlePositionOptions.map((p) => (
                      <button
                        key={p.key}
                        className={`tiny-pill ${p.key === design.titlePosition ? "on" : ""}`}
                        type="button"
                        onClick={() => setDesign((current) => ({ ...current, titlePosition: p.key }))}
                      >
                        {p.label}
                      </button>
                    ))}
                    <button
                      className={`tiny-pill ${design.showDate ? "on" : ""}`}
                      type="button"
                      onClick={() => setDesign((current) => ({ ...current, showDate: !current.showDate }))}
                    >
                      Date stamp
                    </button>
                  </div>
                </div>
              </details>

              <details className="customize-section" open>
                <summary>Layout & Spacing</summary>
                <div className="section-body">
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
                    <input className="range-input" type="range" min={4} max={28} value={design.padding} onChange={(event) => setDesign((current) => ({ ...current, padding: Number(event.target.value) }))} />
                    <span>{design.padding}</span>
                  </div>
                  <div className="slider-line slider-input-line">
                    <span>Gap</span>
                    <input className="range-input" type="range" min={2} max={20} value={design.gap} onChange={(event) => setDesign((current) => ({ ...current, gap: Number(event.target.value) }))} />
                    <span>{design.gap}</span>
                  </div>
                  <div className="slider-line slider-input-line">
                    <span>Round</span>
                    <input className="range-input" type="range" min={0} max={30} value={design.roundness} onChange={(event) => setDesign((current) => ({ ...current, roundness: Number(event.target.value) }))} />
                    <span>{design.roundness}</span>
                  </div>
                  <div className="slider-line slider-input-line">
                    <span>Border</span>
                    <input className="range-input" type="range" min={0} max={6} value={design.borderWidth} onChange={(event) => setDesign((current) => ({ ...current, borderWidth: Number(event.target.value) }))} />
                    <span>{design.borderWidth}px</span>
                  </div>
                </div>
              </details>

              <details className="customize-section">
                <summary>Colors & Style</summary>
                <div className="section-body">
                  <p className="label">Filter</p>
                  <div className="pill-grid pill-grid-wrap">
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

                  <p className="label">Background pattern</p>
                  <div className="pill-grid">
                    {patternOptions.map((p) => (
                      <button
                        key={p.key}
                        className={`tiny-pill ${p.key === design.bgPattern ? "on" : ""}`}
                        type="button"
                        onClick={() => setDesign((current) => ({ ...current, bgPattern: p.key }))}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <p className="label">Background color</p>
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
                    <label className="swatch-btn swatch-custom" aria-label="Custom background color">
                      <input type="color" value={design.backgroundColor} onChange={(e) => setDesign((current) => ({ ...current, backgroundColor: e.target.value }))} />
                      <span>+</span>
                    </label>
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
                    <label className="swatch-btn swatch-custom" aria-label="Custom border color">
                      <input type="color" value={design.borderColor} onChange={(e) => setDesign((current) => ({ ...current, borderColor: e.target.value }))} />
                      <span>+</span>
                    </label>
                  </div>
                </div>
              </details>

              <details className="customize-section" open>
                <summary>Stickers</summary>
                <div className="section-body">
                  <p className="label">Stickers <span className="muted">(max 4 — tap to toggle, drag onto strip)</span></p>
                  <div className="sticker-grid">
                    {stickerOptions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        draggable
                        className={`sticker-chip ${design.stickers.includes(item) ? "on" : ""}`}
                        onClick={() =>
                          setDesign((current) => ({ ...current, stickers: toggleSticker(current.stickers, item) }))
                        }
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", item);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </details>
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
                <StripPreview design={design} photos={capturedPhotos} stickerPositions={stickerPositions} onStickerUpdate={handleStickerUpdate} onStickerDrop={handleStickerDrop} />
              </div>
              <div className="preview-stats">
                <span>{activeLayout.frames} frames</span>
                <span>{design.filter} filter</span>
                <span>{design.stickers.length}/4 stickers</span>
                <span>{activeLayout.label}</span>
              </div>
              <div className="tool-row">
                <button className="pink-pill" type="button" onClick={() => downloadStripAsPng(design, capturedPhotos, stickerPositions)}>
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
            <div className="pill-grid pill-grid-wrap">
              {templateTags.map((tag) => (
                <button
                  key={tag}
                  className={`tiny-pill ${tag === templateFilter ? "on" : ""}`}
                  type="button"
                  onClick={() => setTemplateFilter(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="template-grid">
            {filteredTemplates.map((card) => (
              <article key={card.name} className="template-card">
                <StripPreview design={{ ...defaultDesign, ...card.preset }} compact />
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
                <button className="pink-pill" type="button" onClick={() => downloadStripAsPng(design, capturedPhotos, stickerPositions)}>
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

      <footer className="mx-auto mt-3 w-full max-w-[1600px] border-t border-dashed border-[var(--pink-200)] px-5 py-6 text-xs text-[var(--ink-soft)] sm:px-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <p>♥ © 2026 cherry/booth · made with love</p>
          <p>booth 02 · pink room · open until midnight</p>
        </div>
      </footer>
    </div>
  );
}
