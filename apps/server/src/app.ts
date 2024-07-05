import Router from "@koa/router";
import "dotenv/config";
import Koa, { Request } from "koa";
import { graphqlHTTP, OptionsData } from "koa-graphql";
import mongoose from "mongoose";
import { schema } from "./schema";

const connectToDatabase = async () => {
  const mongoURl = process.env.MONGO_URL;

  console.log("Connecting to database...");

  if (!mongoURl) {
    console.error("MONGO_URL must be defined in .env");
    throw new Error("MONGO_URL must be defined in .env");
  }

  mongoose.connection.on("close", () =>
    console.log("Database connection closed.")
  );

  mongoose.connection.on("error", (error) =>
    console.log("Database connection error.", error)
  );

  await mongoose.connect(mongoURl);
};

const app = new Koa();
const router = new Router();

const graphqlSettings = async (req: Request): Promise<OptionsData> => {
  // TODO: Add user to context

  return {
    graphiql: {
      headerEditorEnabled: true,
      shouldPersistHeaders: true,
    },
    schema,
    pretty: true,
    context: {},
    customFormatErrorFn: ({ message, locations, stack }) => {
      console.error("GraphQL error:", message, locations, stack);

      return {
        message,
        locations,
        stack,
      };
    },
  };
};

router.all("/graphql", graphqlHTTP(graphqlSettings));

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 4000;

const main = async () => {
  await connectToDatabase();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

main();
