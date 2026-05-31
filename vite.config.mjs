import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "website",
  publicDir: "public",
  build: {
    emptyOutDir: true,
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "website/index.html"),
        links: resolve(import.meta.dirname, "website/links.html"),
        notFound: resolve(import.meta.dirname, "website/404.html"),
      },
    },
  },
});
