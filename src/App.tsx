import { useEffect, useMemo, useState } from "react";
import { Cube3D } from "./components/Cube3D";
import { CubeNet } from "./components/CubeNet";
import { PhotoUpload } from "./components/PhotoUpload";
import { Solution } from "./components/Solution";
import {
  FACE_COLORS,
  FACE_NAMES,
  FACE_ORDER,
  colorCounts,
  solvedState,
  type FaceKey,
} from "./lib/cube";
import { ensureSolverReady, solveCube, type SolveResult } from "./lib/solver";

const PALETTE: FaceKey[] = ["U", "D", "F", "B", "R", "L"];

export default function App() {
  const [state, setState] = useState<Record<FaceKey, FaceKey[]>>(solvedState);
  const [activeColor, setActiveColor] = useState<FaceKey>("U");
  const [rotation, setRotation] = useState({ x: -25, y: -35 });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [solverStatus, setSolverStatus] = useState<"loading" | "ready" | "error">("loading");
  const [solving, setSolving] = useState(false);
  const [solution, setSolution] = useState<SolveResult | null>(null);
  const [solveError, setSolveError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, rotX: 0, rotY: 0 });

  // Initialize solver on mount
  useEffect(() => {
    let cancelled = false;
    ensureSolverReady()
      .then(() => {
        if (!cancelled) setSolverStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setSolverStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => colorCounts(state), [state]);

  const handleStickerClick = (face: FaceKey, index: number) => {
    // Don't allow changing centers — they define the face identity
    if (index === 4) return;
    setState((prev) => {
      const next = { ...prev, [face]: [...prev[face]] };
      next[face][index] = activeColor;
      return next;
    });
    setSolution(null);
    setSolveError(null);
  };

  const handleReset = () => {
    setState(solvedState());
    setSolution(null);
    setSolveError(null);
  };

  const handleRandomize = async () => {
    // Use cubejs to generate a real random state
    if (solverStatus !== "ready") return;
    const Cube = (await import("cubejs")).default;
    const rand = Cube.random();
    const str: string = rand.asString();
    // Map 54-char string back into state object
    const next: Record<FaceKey, FaceKey[]> = {} as any;
    FACE_ORDER.forEach((f, i) => {
      const slice = str.slice(i * 9, i * 9 + 9).split("");
      next[f] = slice as FaceKey[];
    });
    setState(next);
    setSolution(null);
    setSolveError(null);
  };

  const handleSolve = async () => {
    if (solverStatus !== "ready") return;
    setSolving(true);
    setSolveError(null);
    setSolution(null);
    // Defer so UI can update
    setTimeout(() => {
      try {
        const result = solveCube(state);
        setSolution(result);
      } catch (e: any) {
        setSolveError(e.message || "Could not solve this configuration.");
      } finally {
        setSolving(false);
      }
    }, 30);
  };

  // Drag to rotate 3D view
  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, rotX: rotation.x, rotY: rotation.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotation({
      x: Math.max(-89, Math.min(89, dragStart.rotX - dy * 0.5)),
      y: dragStart.rotY + dx * 0.5,
    });
  };
  const onPointerUp = () => setDragging(false);

  // Preset views
  const setView = (x: number, y: number) => setRotation({ x, y });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="h-3 w-3 rounded-sm bg-red-500" />
              <div className="h-3 w-3 rounded-sm bg-white" />
              <div className="h-3 w-3 rounded-sm bg-yellow-400" />
              <div className="h-3 w-3 rounded-sm bg-blue-500" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Rubik's Cube <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">Solver</span>
            </h1>
          </div>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Match the colors below to your real cube, then get a step-by-step solution in 22 moves or fewer.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: 3D Preview + controls */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                  3D Preview
                </h2>
                <span className="text-xs text-neutral-500">drag to rotate</span>
              </div>
              <div
                className="select-none touch-none cursor-grab active:cursor-grabbing"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <Cube3D state={state} rotation={rotation} />
              </div>

              {/* View presets */}
              <div className="mt-3 grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setView(-25, -35)}
                  className="rounded-lg bg-white/5 border border-white/10 py-1.5 text-xs font-medium hover:bg-white/10 transition"
                  title="Top-Front-Right"
                >
                  U·F·R
                </button>
                <button
                  type="button"
                  onClick={() => setView(-25, 55)}
                  className="rounded-lg bg-white/5 border border-white/10 py-1.5 text-xs font-medium hover:bg-white/10 transition"
                  title="Top-Front-Left"
                >
                  U·F·L
                </button>
                <button
                  type="button"
                  onClick={() => setView(25, -35)}
                  className="rounded-lg bg-white/5 border border-white/10 py-1.5 text-xs font-medium hover:bg-white/10 transition"
                  title="Bottom-Front-Right"
                >
                  D·F·R
                </button>
                <button
                  type="button"
                  onClick={() => setView(25, 145)}
                  className="rounded-lg bg-white/5 border border-white/10 py-1.5 text-xs font-medium hover:bg-white/10 transition"
                  title="Bottom-Back-Left"
                >
                  D·B·L
                </button>
              </div>
            </div>

            {/* Color palette */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                Active Color
              </h2>
              <p className="text-xs text-neutral-500 mb-3">
                Pick a color, then click stickers on the flat net to paint them.
              </p>
              <div className="grid grid-cols-6 gap-2">
                {PALETTE.map((c) => {
                  const isSelected = activeColor === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setActiveColor(c)}
                      className={`relative aspect-square rounded-xl transition-all ${
                        isSelected
                          ? "ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-300 scale-105"
                          : "hover:scale-105"
                      }`}
                      style={{
                        background: FACE_COLORS[c],
                        boxShadow:
                          "inset 0 0 0 1px rgba(255,255,255,0.2), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.3)",
                      }}
                      title={FACE_NAMES[c]}
                    >
                      <span
                        className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-wider"
                        style={{ color: isSelected ? "#a5b4fc" : "#6b7280" }}
                      >
                        {c}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Color counts */}
              <div className="mt-8 grid grid-cols-6 gap-2 text-center">
                {PALETTE.map((c) => (
                  <div key={c} className="text-xs">
                    <span
                      className={`font-mono font-bold ${
                        counts[c] === 9 ? "text-emerald-400" : "text-neutral-300"
                      }`}
                    >
                      {counts[c]}
                    </span>
                    <span className="text-neutral-500">/9</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reference photo */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
              <PhotoUpload photoUrl={photoUrl} onPhotoChange={setPhotoUrl} />
            </div>
          </div>

          {/* RIGHT: Editor + solve */}
          <div className="lg:col-span-3 space-y-6">
            {/* Net editor */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold">Paint Your Cube</h2>
                  <p className="text-sm text-neutral-400 mt-0.5">
                    The center sticker of each face is locked — it defines that face's color.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleRandomize}
                    disabled={solverStatus !== "ready"}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium hover:bg-white/10 transition disabled:opacity-50"
                  >
                    Random
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium hover:bg-white/10 transition"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="min-w-[460px] flex justify-center">
                  <CubeNet state={state} onStickerClick={handleStickerClick} stickerSize={38} />
                </div>
              </div>

              {/* Solve button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleSolve}
                  disabled={solverStatus !== "ready" || solving}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-4 text-lg font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-400 hover:to-fuchsia-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {solverStatus === "loading" && "Initializing solver…"}
                  {solverStatus === "error" && "Solver failed to load"}
                  {solverStatus === "ready" && (solving ? "Solving…" : "✨ Solve my cube")}
                </button>
                {solverStatus === "loading" && (
                  <p className="mt-2 text-xs text-center text-neutral-500">
                    First load takes ~4 seconds to build the lookup tables.
                  </p>
                )}
              </div>
            </div>

            {/* Solution */}
            {solveError && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
                <div className="font-semibold text-red-300">Can't solve this configuration</div>
                <p className="mt-1 text-sm text-red-200/80">{solveError}</p>
                <p className="mt-2 text-xs text-red-200/60">
                  Make sure every color appears exactly 9 times and each face's center matches its own color.
                </p>
              </div>
            )}

            {solution && (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-8">
                <Solution moves={solution.moves} />
              </div>
            )}

            {/* Quick instructions */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6">
              <h3 className="font-semibold mb-3">How to use</h3>
              <ol className="space-y-2 text-sm text-neutral-300 list-decimal list-inside">
                <li>Hold your real cube with <span className="font-semibold text-white">white on top</span> and <span className="font-semibold text-white">green in front</span>.</li>
                <li>Optionally upload a photo so you can reference it side-by-side.</li>
                <li>Select a color in the palette, then click the matching stickers on the flat net.</li>
                <li>Rotate the 3D preview to inspect — use the view buttons or drag it.</li>
                <li>Click <span className="font-semibold text-white">Solve my cube</span>. You'll get a move list in standard notation.</li>
              </ol>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-neutral-500">
          Solver uses Herbert Kociemba's two-phase algorithm via <span className="font-mono">cubejs</span>. Optimal solutions in ≤22 moves.
        </footer>
      </div>
    </div>
  );
}
