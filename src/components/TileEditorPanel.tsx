// src/components/TileEditorPanel.tsx
import { TILE_CONFIGS } from "../game/config/tiles";
import type { DrawMode } from "../game/ui/TileEditor";

interface TileEditorPanelProps {
  onTileSelect: (tileId: string | null) => void;
  onClear: () => void;
  onSave: () => void;
  onClearSaved?: () => void;
  selectedTileId: string | null;
  drawMode: DrawMode;
  onDrawModeChange: (mode: DrawMode) => void;
}

export function TileEditorPanel({
  onTileSelect,
  onClear,
  onSave,
  onClearSaved,
  selectedTileId,
  drawMode,
  onDrawModeChange,
}: TileEditorPanelProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "100px",
        backgroundColor: "rgba(42, 42, 42, 0.95)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: "15px",
        zIndex: 1000,
        borderTop: "2px solid #555",
      }}
    >
      <div style={{ display: "flex", gap: "10px", flex: 1 }}>
        {TILE_CONFIGS.map((tile) => (
          <button
            key={tile.id}
            onClick={() => onTileSelect(tile.id)}
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: `#${tile.color.toString(16).padStart(6, "0")}`,
              border:
                selectedTileId === tile.id
                  ? "3px solid #ffff00"
                  : "2px solid #ffffff",
              cursor: "pointer",
              borderRadius: "4px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "10px",
              position: "relative",
              overflow: "hidden",
            }}
            title={tile.name}
          >
            {/* ✅ Відображаємо зображення, якщо воно є */}
            {tile.imageUrl && (
              <img
                src={tile.imageUrl}
                alt={tile.name}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none",
                }}
              />
            )}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
              }}
            >
              {tile.name}
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {/* ✅ Кнопки для перемикання режимів малювання */}
        <div
          style={{
            display: "flex",
            gap: "5px",
            backgroundColor: "#333",
            padding: "4px",
            borderRadius: "4px",
          }}
        >
          <button
            onClick={() => onDrawModeChange("line")}
            style={{
              padding: "6px 12px",
              backgroundColor: drawMode === "line" ? "#44ff44" : "#555",
              color: drawMode === "line" ? "#000" : "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "12px",
            }}
            title="Малювати лінією"
          >
            Лінія
          </button>
          <button
            onClick={() => onDrawModeChange("area")}
            style={{
              padding: "6px 12px",
              backgroundColor: drawMode === "area" ? "#44ff44" : "#555",
              color: drawMode === "area" ? "#000" : "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "12px",
            }}
            title="Малювати площиною"
          >
            Площина
          </button>
        </div>

        <button
          onClick={onSave}
          style={{
            padding: "8px 16px",
            backgroundColor: "#44ff44",
            color: "#000",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Зберегти
        </button>
        <button
          onClick={onClear}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ff4444",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Очистити
        </button>
        {onClearSaved && (
          <button
            onClick={onClearSaved}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ff8800",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            title="Очистити збережену карту з localStorage"
          >
            Очистити збережену
          </button>
        )}
        <button
          onClick={() => onTileSelect(null)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#666",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Скасувати вибір
        </button>
      </div>
    </div>
  );
}
