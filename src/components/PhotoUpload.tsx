import { useRef, useState } from "react";

interface PhotoUploadProps {
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
}

export function PhotoUpload({ photoUrl, onPhotoChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onPhotoChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
          Reference Photo
        </h3>
        {photoUrl && (
          <button
            type="button"
            onClick={() => onPhotoChange(null)}
            className="text-xs text-neutral-400 hover:text-white transition"
          >
            Remove
          </button>
        )}
      </div>

      {photoUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
          <img
            src={photoUrl}
            alt="Cube reference"
            className="w-full h-56 object-cover"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 rounded-lg bg-black/70 backdrop-blur px-3 py-1.5 text-xs font-medium text-white border border-white/20 hover:bg-black/90 transition"
          >
            Change
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
            dragging
              ? "border-indigo-400 bg-indigo-500/10"
              : "border-white/15 bg-black/20 hover:border-white/30 hover:bg-black/40"
          }`}
        >
          <div className="text-3xl">📷</div>
          <div className="text-sm font-medium text-white">Upload a photo of your cube</div>
          <div className="text-xs text-neutral-500">
            Helpful as a visual reference while you color in the editor
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
