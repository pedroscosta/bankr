import { createSchema } from "graphql-yoga";
import { UserModel } from "../models/user";

export const usersSchema = createSchema({
  typeDefs: /* GraphQL */ `
    type User {
      id: ID!
      username: String!
      name: String!
    }

    type RegisterResponse {
      user: User
      error: String
    }

    type Mutation {
      registerUser(username: String!, name: String!, password: String!): User!
    }
  `,
  resolvers: {
    Mutation: {
      registerUser: async (_, args) => {
        const user = new UserModel({
          username: args.username,
          name: args.name,
          password: args.password,
        });

        await user.save().catch((err) => {
          if (err.code === 11000) {
            throw new Error("Username already exists.");
          } else {
            throw new Error("Unknown error.");
          }
        });

        return {
          id: user._id,
          username: user.username,
          name: user.name,
        };
      },
    },
  },
});
