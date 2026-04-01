// content.config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number(),
  module: z.string(),
  level: z.enum(["intro", "base", "intermedio", "avanzado"]).default("base"),
  draft: z.boolean().default(false),
});

const javaTemas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/temas" }),
  schema: baseSchema,
});

const springbootTemas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/springboot/temas" }),
  schema: baseSchema,
});

const mavenTemas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/maven/temas" }),
  schema: baseSchema,
});

const dockerTemas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/docker/temas" }),
  schema: baseSchema,
});

const flywayTemas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/flyway/temas" }),
  schema: baseSchema,
});

export const collections = {
  javaTemas,
  springbootTemas,
  mavenTemas,
  dockerTemas,
  flywayTemas,
};
