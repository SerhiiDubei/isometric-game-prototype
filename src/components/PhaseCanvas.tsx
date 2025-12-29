import { useEffect, useRef } from "react";

import Phaser from "phaser";
import { createGame } from "../game/utils/createGame";
import type { IsoScene } from "../game/scenes/IsoScene";

export function PhaserCanvas({
  onSceneReady,
}: {
  onSceneReady?: (scene: IsoScene) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    gameRef.current = createGame(hostRef.current);

    // ✅ Очікуємо, поки сцена буде готова
    const checkScene = () => {
      const scene = gameRef.current?.scene.getScene("IsoScene") as IsoScene;
      if (scene && scene.scene.isActive() && onSceneReady) {
        onSceneReady(scene);
      } else {
        // Якщо сцена ще не готова, перевіряємо через невелику затримку
        setTimeout(checkScene, 100);
      }
    };

    // Починаємо перевірку після невеликої затримки
    setTimeout(checkScene, 100);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onSceneReady]);

  return (
    <div
      ref={hostRef}
      className="h-[80vh] w-full rounded-xl overflow-hidden border border-zinc-800"
    />
  );
}
