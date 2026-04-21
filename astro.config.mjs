import { defineConfig } from "astro/config";

const ENV = "local"; // "local" | "github"
const isGithub = ENV === "github";

export default defineConfig({
  site: "https://surviladeveloper.github.io",
  base: isGithub ? "/curso-java-y-backend" : "/",

  markdown: {
    shikiConfig: {
      langAlias: {
        env: "dotenv",
        gradle: "groovy",
        Dockerfile: "docker",
        dockerignore: "text",
        gitignore: "text",
        dns: "text",
        caddyfile: "text",
      },
    },
  },
});