import { mergeSchemas } from "graphql-yoga";
import { usersSchema } from "./auth";
import { transactionsSchema } from "./transactions";

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
  schemas: [usersSchema, transactionsSchema],
});
