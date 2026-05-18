export const RANKS = [
  { name: "Distributor", color: "#9898b8" },
  { name: "Senior Distributor", color: "#60a5fa" },
  { name: "Silver", color: "#c0c0d0" },
  { name: "Gold", color: "#ffd700" },
  { name: "Diamond", color: "#22d3ee" },
  { name: "Ruby", color: "#fb7185" },
  { name: "Emerald", color: "#22d3a5" },
  { name: "Crown", color: "#a29bfe" },
  { name: "Double Crown", color: "#f472b6" },
  { name: "Triple Crown", color: "#6c5ce7" },
];

export function getRankColor(rankName) {
  return RANKS.find((r) => r.name === rankName)?.color ?? "#9898b8";
}

export const COLORS = [
  { name: "Purple", hex: "#6c5ce7", bg: "rgba(108,92,231,0.15)" },
  { name: "Violet", hex: "#a29bfe", bg: "rgba(162,155,254,0.15)" },
  { name: "Cyan", hex: "#22d3ee", bg: "rgba(34,211,238,0.15)" },
  { name: "Green", hex: "#00cec9", bg: "rgba(0,206,201,0.15)" },
  { name: "Gold", hex: "#ffd700", bg: "rgba(255,215,0,0.12)" },
  { name: "Amber", hex: "#fdcb6e", bg: "rgba(253,203,110,0.15)" },
  { name: "Rose", hex: "#fb7185", bg: "rgba(251,113,133,0.15)" },
  { name: "Blue", hex: "#60a5fa", bg: "rgba(96,165,250,0.15)" },
  { name: "Orange", hex: "#fb923c", bg: "rgba(251,146,60,0.15)" },
  { name: "Lime", hex: "#a3e635", bg: "rgba(163,230,53,0.15)" },
];

export const ICONS = [
  "?????", "??", "??", "??", "??", "??", "??", "??",
  "??", "??", "??", "??", "??", "??", "??", "??",
  "??", "?", "??", "??",
];
