import { mergeSchemas } from "graphql-yoga";
import { authSchema } from "./auth";
import { transactionsSchema } from "./transactions";
import { userSchema } from "./user";

export const schema = mergeSchemas({
  typeDefs: /* GraphQL */ `
    type Query {
      info: String!
    }
  `,
  resolvers: {
    Query: {
      info: () => {
        return "follow me on twitter: @pedroscosta_!";
      },
    },
  },
  schemas: [authSchema, transactionsSchema, userSchema],
});
