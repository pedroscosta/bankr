import { writeFile } from "fs/promises";

import { printSchema } from "graphql/utilities";
import path from "path";
import { schema } from "../schema";

export async function updateSchema() {
  await writeFile(
    path.join(__dirname, "../schema/schema.graphql"),
    printSchema(schema)
  );

  process.exit(0);
}

updateSchema();
