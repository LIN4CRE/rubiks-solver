import { FACE_COLORS, type FaceKey } from "../lib/cube";

interface Cube3DProps {
  state: Record<FaceKey, FaceKey[]>;
  rotation: { x: number; y: number };
}

// Renders a 3D isometric view of the cube using CSS 3D transforms.
// Shows 3 faces at a time (the ones facing the viewer based on rotation).
// Clicking a face sticker is NOT supported in 3D view — use the net editor.
export function Cube3D({ state, rotation }: Cube3DProps) {
  const stickerSize = 52;
  const gap = 4;
  const faceSize = stickerSize * 3 + gap * 2;
  const half = faceSize / 2;

  const faceStyle = (transform: string): React.CSSProperties => ({
    position: "absolute",
    width: faceSize,
    height: faceSize,
    left: "50%",
    top: "50%",
    marginLeft: -half,
    marginTop: -half,
    transform,
    backfaceVisibility: "hidden",
    background: "#0a0a0a",
    padding: gap / 2,
    borderRadius: 8,
  });

  const stickerGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap,
    width: "100%",
    height: "100%",
  };

  // Face transform order: we build the cube from its center.
  // For a standard cube with +Z toward viewer, +Y down, +X right:
  //   F (front): translateZ(+half)
  //   B (back):  rotateY(180deg) translateZ(+half)
  //   R (right): rotateY(90deg) translateZ(+half)
  //   L (left):  rotateY(-90deg) translateZ(+half)
  //   U (up):    rotateX(-90deg) translateZ(+half)
  //   D (down):  rotateX(90deg) translateZ(+half)
  const faces: { key: FaceKey; transform: string }[] = [
    { key: "F", transform: `translateZ(${half}px)` },
    { key: "B", transform: `rotateY(180deg) translateZ(${half}px)` },
    { key: "R", transform: `rotateY(90deg) translateZ(${half}px)` },
    { key: "L", transform: `rotateY(-90deg) translateZ(${half}px)` },
    { key: "U", transform: `rotateX(-90deg) translateZ(${half}px)` },
    { key: "D", transform: `rotateX(90deg) translateZ(${half}px)` },
  ];

  return (
    <div
      className="relative mx-auto"
      style={{
        width: faceSize * 2.2,
        height: faceSize * 2.2,
        perspective: 1200,
      }}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: 0,
          height: 0,
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: "transform 0.4s cubic-bezier(.22,.61,.36,1)",
        }}
      >
        {faces.map((f) => (
          <div key={f.key} style={faceStyle(f.transform)}>
            <div style={stickerGrid}>
              {state[f.key].map((c, i) => (
                <div
                  key={i}
                  style={{
                    background: FACE_COLORS[c],
                    borderRadius: 4,
                    boxShadow:
                      "inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.3)",
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
