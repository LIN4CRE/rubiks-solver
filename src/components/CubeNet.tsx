import { FACE_COLORS, FACE_ORDER, type FaceKey } from "../lib/cube";

interface FaceProps {
  colors: FaceKey[];
  onStickerClick?: (index: number) => void;
  size?: number; // px per sticker
  interactive?: boolean;
  showLabels?: boolean;
  face?: FaceKey;
}

export function Face({ colors, onStickerClick, size = 44, interactive = true, showLabels = false, face }: FaceProps) {
  const totalSize = size * 3 + 8; // 3 stickers + padding
  return (
    <div
      className="relative rounded-lg bg-neutral-900 p-1 shadow-inner"
      style={{ width: totalSize, height: totalSize }}
    >
      {showLabels && face && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          {face}
        </div>
      )}
      <div className="grid grid-cols-3 gap-1">
        {colors.map((c, i) => (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onStickerClick?.(i)}
            className="rounded-sm transition-all border border-black/40"
            style={{
              width: size,
              height: size,
              background: FACE_COLORS[c],
              boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.15), inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.25)`,
              cursor: interactive ? "pointer" : "default",
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface CubeNetProps {
  state: Record<FaceKey, FaceKey[]>;
  onStickerClick?: (face: FaceKey, index: number) => void;
  stickerSize?: number;
  interactive?: boolean;
}

// Standard unfolded net layout (matches the cubejs README diagram):
//            U
//      L   F   R   B
//            D
export function CubeNet({ state, onStickerClick, stickerSize = 36, interactive = true }: CubeNetProps) {
  const s = stickerSize;
  const faceSize = s * 3 + 8;

  const gridCols = 4;
  const gridRows = 3;
  const totalWidth = faceSize * gridCols + 16;
  const totalHeight = faceSize * gridRows + 16;

  const positions: Record<FaceKey, { col: number; row: number }> = {
    U: { col: 1, row: 0 },
    L: { col: 0, row: 1 },
    F: { col: 1, row: 1 },
    R: { col: 2, row: 1 },
    B: { col: 3, row: 1 },
    D: { col: 1, row: 2 },
  };

  return (
    <div
      className="relative mx-auto"
      style={{ width: totalWidth, height: totalHeight }}
    >
      {FACE_ORDER.map((f) => {
        const { col, row } = positions[f];
        return (
          <div
            key={f}
            className="absolute"
            style={{
              left: col * faceSize + 8,
              top: row * faceSize + 8,
            }}
          >
            <Face
              face={f}
              colors={state[f]}
              size={s}
              interactive={interactive}
              showLabels
              onStickerClick={(i) => onStickerClick?.(f, i)}
            />
          </div>
        );
      })}
    </div>
  );
}
