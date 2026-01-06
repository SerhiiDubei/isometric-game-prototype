import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: '/', // ✅ Vercel uses root path
  server: {
    host: true, // Дозволяє доступ з будь-якого IP
    port: 5173, // Стандартний порт Vite
    open: true, // Автоматично відкриває браузер
  },
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
});
