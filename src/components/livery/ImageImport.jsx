import { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { loadImageFile } from '@/lib/importImage';

export default function ImageImport({ onImageLayer }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    loadImageFile(file, onImageLayer);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-foreground/80 uppercase tracking-widest font-rajdhani font-bold">Image</p>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed cursor-pointer transition-colors py-3 px-2 text-center
          ${dragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-secondary/40'}`}
      >
        <ImagePlus className="w-5 h-5 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground leading-tight">Drop image or click</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.svg"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}