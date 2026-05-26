import { MOVE_DESCRIPTIONS } from "../lib/cube";

interface SolutionProps {
  moves: string[];
}

export function Solution({ moves }: SolutionProps) {
  if (moves.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <div className="text-2xl font-bold text-emerald-300">Already solved! 🎉</div>
        <p className="mt-2 text-emerald-200/80">Your cube is already in the solved state.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Solution</h3>
          <p className="text-sm text-neutral-400">
            {moves.length} moves · apply in order from left to right
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(moves.join(" "));
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 transition"
        >
          Copy
        </button>
      </div>

      {/* Move pills with descriptions on hover */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {moves.map((m, i) => (
          <div
            key={i}
            className="group relative flex flex-col items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 px-2 py-2 hover:border-indigo-400/50 transition"
            title={MOVE_DESCRIPTIONS[m] || ""}
          >
            <span className="text-[10px] font-mono text-neutral-500 leading-none">{i + 1}</span>
            <span className="text-lg font-bold text-white leading-none mt-0.5">{m}</span>
          </div>
        ))}
      </div>

      {/* Notation guide */}
      <details className="rounded-xl border border-white/10 bg-white/5 p-4">
        <summary className="cursor-pointer font-semibold text-white">How to read the moves</summary>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-neutral-300">
          <div>
            <div className="font-semibold text-white mb-1">Faces</div>
            <p>
              <span className="font-mono text-indigo-300">U</span> = Up, <span className="font-mono text-indigo-300">D</span> = Down, <span className="font-mono text-indigo-300">L</span> = Left, <span className="font-mono text-indigo-300">R</span> = Right, <span className="font-mono text-indigo-300">F</span> = Front, <span className="font-mono text-indigo-300">B</span> = Back.
            </p>
          </div>
          <div>
            <div className="font-semibold text-white mb-1">Modifiers</div>
            <p>
              <span className="font-mono text-indigo-300">R</span> = clockwise 90°, <span className="font-mono text-indigo-300">R'</span> = counter-clockwise 90°, <span className="font-mono text-indigo-300">R2</span> = 180°.
            </p>
          </div>
          <div className="sm:col-span-2 text-neutral-400">
            Always look directly at the face you're turning to decide "clockwise".
          </div>
        </div>
      </details>
    </div>
  );
}
