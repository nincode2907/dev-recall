import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const runtime = { host: "127.0.0.1", port: 15300, strictPort: true };

export default defineConfig({
  plugins: [
    react(),
    {
      name: "dev-recall-runtime-links",
      configureServer(server) {
        server.httpServer?.once("listening", () => {
          console.log(
            "\nDev Recall đã lắng nghe: [http://127.0.0.1:15300](http://127.0.0.1:15300)",
          );
          console.log(
            "Proxy (cần kiểm tra route): [http://dev-recall.localhost](http://dev-recall.localhost)\n",
          );
        });
      },
    },
  ],
  server: { ...runtime, allowedHosts: ["dev-recall.localhost"] },
  preview: { ...runtime, allowedHosts: ["dev-recall.localhost"] },
});
