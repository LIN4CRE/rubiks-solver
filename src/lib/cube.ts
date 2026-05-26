// Rubik's cube color / face utilities
// Standard color scheme:
//   U (Up)    = white
//   D (Down)  = yellow
//   F (Front) = green
//   B (Back)  = blue
//   R (Right) = red
//   L (Left)  = orange

export type FaceKey = "U" | "D" | "F" | "B" | "R" | "L";

export const FACE_ORDER: FaceKey[] = ["U", "R", "F", "D", "L", "B"];

// Colors shown in the UI, mapped to face-letter identity
export const FACE_COLORS: Record<FaceKey, string> = {
  U: "#ffffff", // white
  D: "#facc15", // yellow (tailwind yellow-400)
  F: "#22c55e", // green
  B: "#3b82f6", // blue
  R: "#ef4444", // red
  L: "#f97316", // orange
};

export const FACE_NAMES: Record<FaceKey, string> = {
  U: "Up (Top)",
  D: "Down (Bottom)",
  F: "Front",
  B: "Back",
  R: "Right",
  L: "Left",
};

// Default solved state — 9 stickers per face, 54 total
export function solvedState(): Record<FaceKey, FaceKey[]> {
  return {
    U: Array(9).fill("U"),
    D: Array(9).fill("D"),
    F: Array(9).fill("F"),
    B: Array(9).fill("B"),
    R: Array(9).fill("R"),
    L: Array(9).fill("L"),
  };
}

// Convert sticker-state map to the 54-char string expected by cubejs
// Order: U R F D L B, each face read left-to-right, top-to-bottom.
export function stateToString(state: Record<FaceKey, FaceKey[]>): string {
  return FACE_ORDER.map((f) => state[f].join("")).join("");
}

// Count how many of each color appear in the state
export function colorCounts(state: Record<FaceKey, FaceKey[]>): Record<FaceKey, number> {
  const counts: Record<FaceKey, number> = { U: 0, D: 0, F: 0, B: 0, R: 0, L: 0 };
  for (const f of FACE_ORDER) {
    for (const c of state[f]) counts[c]++;
  }
  return counts;
}

// Validate: exactly 9 of each color, and centers match their face.
// Returns null on success, or an error message.
export function validateState(state: Record<FaceKey, FaceKey[]>): string | null {
  const counts = colorCounts(state);
  for (const f of FACE_ORDER) {
    if (counts[f] !== 9) {
      return `Need exactly 9 stickers of each color. ${FACE_NAMES[f]} color has ${counts[f]}.`;
    }
  }
  // Centers are at index 4 of each face. They must match the face letter
  // so the solver knows which color is "up" etc.
  for (const f of FACE_ORDER) {
    if (state[f][4] !== f) {
      return `The center sticker of the ${FACE_NAMES[f]} face must be that face's own color.`;
    }
  }
  return null;
}

// Move notation descriptions
export const MOVE_DESCRIPTIONS: Record<string, string> = {
  U: "Turn the Up face clockwise",
  "U'": "Turn the Up face counter-clockwise",
  U2: "Turn the Up face 180°",
  D: "Turn the Down face clockwise",
  "D'": "Turn the Down face counter-clockwise",
  D2: "Turn the Down face 180°",
  F: "Turn the Front face clockwise",
  "F'": "Turn the Front face counter-clockwise",
  F2: "Turn the Front face 180°",
  B: "Turn the Back face clockwise",
  "B'": "Turn the Back face counter-clockwise",
  B2: "Turn the Back face 180°",
  R: "Turn the Right face clockwise",
  "R'": "Turn the Right face counter-clockwise",
  R2: "Turn the Right face 180°",
  L: "Turn the Left face clockwise",
  "L'": "Turn the Left face counter-clockwise",
  L2: "Turn the Left face 180°",
};
