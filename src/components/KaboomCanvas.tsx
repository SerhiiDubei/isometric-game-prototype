import { useEffect, useRef } from "react";
import { createKaboomGame } from "../game/scenes/kaboomGame";

export function KaboomCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const destroyRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    destroyRef.current = createKaboomGame({ canvas: c });

    return () => {
      destroyRef.current?.();
      destroyRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "80vh",
        display: "block",
        borderRadius: 12,
        border: "1px solid #27272a",
        background: "#0a0a0e",
      }}
    />
  );
}
