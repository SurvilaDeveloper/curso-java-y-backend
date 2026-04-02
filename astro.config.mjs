import { defineConfig } from "astro/config";

const ENV = "github" // local o github

export default defineConfig({
  site: "https://surviladeveloper.github.io",
  base: ENV == "github" ? "/curso-java-y-backend" : ENV == "local" ? "/" : "/",

  markdown: {
    shikiConfig: {
      langAlias: {
        env: "dotenv",
        gradle: "groovy",
        Dockerfile: "docker",
        dockerignore: "plaintext",
      },
    },
  },
});