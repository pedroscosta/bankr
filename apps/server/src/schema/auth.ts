import { createSchema } from "graphql-yoga";
import { z } from "zod";
import { KnownError } from "../errors/known-error";
import { sign } from "../lib/jwt-auth";
import { UserModel } from "../models/user";

const DUPLICATION_ERROR_CODE = 11000;

const registerSchema = z
  .object({
    username: z.string().min(3).max(20).trim(),
    name: z.string().min(3).max(64).trim(),
    password: z.string().min(8).trim(),
  })
  .strict();

const loginSchema = z
  .object({
    username: z.string().min(3).max(20).trim(),
    password: z.string().min(8).trim(),
  })
  .strict();

export const authSchema = createSchema({
  typeDefs: /* GraphQL */ `
    type User {
      id: String!
      username: String!
      name: String!
    }

    type RegisterResponse {
      user: User
    }

    type LoginResponse {
      token: String
      user: User
    }

    type Mutation {
      register(
        username: String!
        name: String!
        password: String!
      ): RegisterResponse!

      login(username: String!, password: String!): LoginResponse!
    }
  `,
  resolvers: {
    Mutation: {
      register: async (_, rawArgs) => {
        const args = registerSchema.parse(rawArgs);

        const user = new UserModel({
          username: args.username,
          name: args.name,
          password: args.password,
        });

        await user.save().catch((err) => {
          if (err.code === DUPLICATION_ERROR_CODE) {
            throw new KnownError("Username already exists", "CONFLICT");
          } else {
            // We don't know what happened, so we just throw a generic error
            // exposing the original error to the client is a bad practice
            throw new Error("Unknown error");
          }
        });

        return {
          user: {
            id: user._id,
            username: user.username,
            name: user.name,
          },
        };
      },
      login: async (_, rawArgs) => {
        const args = loginSchema.parse(rawArgs);

        const user = await UserModel.findOne({ username: args.username });

        if (!user) {
          throw new KnownError("Invalid username or password", "BAD_REQUEST");
        }

        if (!(await user.comparePasswords(args.password, user.password))) {
          throw new KnownError("Invalid username or password", "BAD_REQUEST");
        }

        const token = await sign(user);

        return {
          token,
          user: {
            id: user._id,
            username: user.username,
            name: user.name,
          },
        };
      },
    },
  },
});
