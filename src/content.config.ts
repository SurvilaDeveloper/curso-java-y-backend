// content.config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number(),
  module: z.string(),
  level: z
    .enum(["intro", "base", "intermedio", "avanzado"])
    .default("base"),
  draft: z.boolean().default(false),
});

const createTemasCollection = (base: string) =>
  defineCollection({
    loader: glob({ pattern: "**/*.md", base }),
    schema: baseSchema,
  });

const javaTemas = createTemasCollection("./src/content/temas");
const springbootTemas = createTemasCollection(
  "./src/content/springboot/temas",
);
const mavenTemas = createTemasCollection("./src/content/maven/temas");
const dockerTemas = createTemasCollection("./src/content/docker/temas");
const flywayTemas = createTemasCollection("./src/content/flyway/temas");
const attacksTemas = createTemasCollection("./src/content/attacks/temas");
const securityTemas = createTemasCollection("./src/content/security/temas");

export const collections = {
  javaTemas,
  springbootTemas,
  mavenTemas,
  dockerTemas,
  flywayTemas,
  attacksTemas,
  securityTemas,
};
