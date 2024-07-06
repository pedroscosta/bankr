import { createSchema } from "graphql-yoga";
import { z } from "zod";
import { AuthenticatedContext, verifyUser } from "../lib/jwt-auth";

const getTransactionSchema = z.object({
  page: z
    .number()
    .min(0)
    .nullish()
    .transform((s) => s ?? 0),
  pageSize: z
    .number()
    .min(0)
    .max(100)
    .nullish()
    .transform((s) => s ?? 10),
});

const sendTransactionSchema = z.object({
  receiver: z.string().trim(),
  amount: z.number().min(0),
});

export const userSchema = createSchema<AuthenticatedContext>({
  typeDefs: /* GraphQL */ `
    type User {
      id: String!
      username: String!
      name: String!
      balance: Float
    }

    type Query {
      me: User!
    }
  `,
  resolvers: {
    Query: {
      me: async (_, _rawArgs, ctx) => {
        verifyUser(ctx);

        return {
          id: ctx.user._id,
          username: ctx.user.username,
          name: ctx.user.name,
          balance: ctx.user.balance,
        };
      },
    },
  },
});
