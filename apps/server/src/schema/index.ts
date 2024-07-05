import { mergeSchemas } from "graphql-yoga";
import { usersSchema } from "./users";

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
  schemas: [usersSchema],
});
