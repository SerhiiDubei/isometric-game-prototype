import { useState, useCallback } from "react";
import { PhaserCanvas } from "../PhaseCanvas";
import { TileEditorPanel } from "../TileEditorPanel";
import type { IsoScene } from "../../game/scenes/IsoScene";
import type { DrawMode } from "../../game/ui/TileEditor";

const Experience = () => {
  const [scene, setScene] = useState<IsoScene | null>(null);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<DrawMode>("line");

  const handleSceneReady = useCallback((isoScene: IsoScene) => {
    setScene(isoScene);
    // ✅ Встановлюємо початковий вибраний тайл та режим малювання
    if (isoScene.tileEditor) {
      setSelectedTileId(isoScene.tileEditor.getSelectedTileId());
      setDrawMode(isoScene.tileEditor.getDrawMode());
    }
  }, []);

  const handleTileSelect = useCallback(
    (tileId: string | null) => {
      if (scene?.tileEditor) {
        scene.tileEditor.setSelectedTileId(tileId);
        setSelectedTileId(tileId);
      }
    },
    [scene]
  );

  const handleClear = useCallback(() => {
    if (scene?.tileEditor) {
      scene.tileEditor.clearAllTiles();
    }
  }, [scene]);

  const handleSave = useCallback(() => {
    if (scene?.tileEditor) {
      scene.tileEditor.saveTiles();
      setSaveMessage("Тайли збережено!");
      setTimeout(() => setSaveMessage(null), 2000);
    }
  }, [scene]);

  const handleClearSaved = useCallback(() => {
    if (scene?.tileEditor) {
      scene.tileEditor.clearSavedMap();
      setSaveMessage("Збережена карта очищена! Перезавантажте сторінку.");
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }, [scene]);

  const handleDrawModeChange = useCallback(
    (mode: DrawMode) => {
      if (scene?.tileEditor) {
        scene.tileEditor.setDrawMode(mode);
        setDrawMode(mode);
      }
    },
    [scene]
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050507",
        color: "#fff",
        padding: 16,
        position: "relative",
      }}
    >
      <h1 style={{ fontSize: 20, marginBottom: 10 }}>
        Isometric Phaser + React шаблон
      </h1>
      <p style={{ opacity: 0.75, marginBottom: 12 }}>
        Стрілки/WASD — крок. Клік по тайлу — рух по A*. Виберіть тайл для
        малювання.
      </p>
      <div style={{ position: "relative" }}>
        <PhaserCanvas onSceneReady={handleSceneReady} />
        {scene && (
          <TileEditorPanel
            onTileSelect={handleTileSelect}
            onClear={handleClear}
            onSave={handleSave}
            onClearSaved={handleClearSaved}
            selectedTileId={selectedTileId}
            drawMode={drawMode}
            onDrawModeChange={handleDrawModeChange}
          />
        )}
        {saveMessage && (
          <div
            style={{
              position: "absolute",
              top: 50,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#00ff00",
              color: "#000",
              padding: "10px 20px",
              borderRadius: "4px",
              fontSize: "18px",
              fontWeight: "bold",
              zIndex: 2000,
            }}
          >
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Experience;
