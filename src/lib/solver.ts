// Wrapper around cubejs solver
// cubejs is a CommonJS module; we import it and use default export
import Cube from "cubejs";
import type { FaceKey } from "./cube";
import { stateToString, validateState } from "./cube";

let solverReady = false;
let initPromise: Promise<void> | null = null;

export function ensureSolverReady(): Promise<void> {
  if (solverReady) return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = new Promise<void>((resolve, reject) => {
    // Defer so the UI can render the "loading" state before we block the main thread.
    // initSolver() is synchronous CPU work (4-5s on first call) that builds lookup tables.
    setTimeout(() => {
      try {
        (Cube as any).initSolver();
        solverReady = true;
        resolve();
      } catch (e) {
        reject(e);
      }
    }, 20);
  });
  return initPromise;
}

export interface SolveResult {
  moves: string[];
  notation: string;
}

export function solveCube(state: Record<FaceKey, FaceKey[]>): SolveResult {
  const err = validateState(state);
  if (err) throw new Error(err);

  if (!solverReady) throw new Error("Solver not initialized. Call ensureSolverReady() first.");

  const str = stateToString(state);
  const cube = (Cube as any).fromString(str);
  const notation: string = cube.solve();
  const moves = notation.trim().length === 0 ? [] : notation.trim().split(/\s+/);
  return { moves, notation };
}
