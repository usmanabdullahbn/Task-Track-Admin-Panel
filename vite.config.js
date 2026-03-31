import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: true, // or '0.0.0.0'
    port: 5173,
    allowedHosts: ["www.sgitt.com"], // ✅ add this line
  },
});
