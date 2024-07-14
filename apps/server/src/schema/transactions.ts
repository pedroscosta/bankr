import { createSchema } from "graphql-yoga";
import { z } from "zod";
import { KnownError } from "../errors/known-error";
import { AuthenticatedContext, verifyUser } from "../lib/jwt-auth";
import {
  PopulatedTransactionDocument,
  TransactionModel,
} from "../models/transaction";
import { UserModel } from "../models/user";

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
  receiver: z.string({ required_error: "Invalid receiver" }).trim(),
  amount: z
    .number({ required_error: "Invalid amount" })
    .min(0, "Invalid amount"),
});

export const transactionsSchema = createSchema<AuthenticatedContext>({
  typeDefs: /* GraphQL */ `
    type User {
      id: String!
      username: String!
      name: String!
      balance: Float
    }

    type Transaction {
      id: String!
      sender: User!
      receiver: User
      amount: Float!
      createdAt: Float!
    }

    type PaginatedTransactions {
      transactions: [Transaction]!
      page: Int!
      pageSize: Int!
      total: Int!
    }

    type Query {
      transactions(page: Int, pageSize: Int): PaginatedTransactions!
    }

    type Mutation {
      createTransaction(receiver: String!, amount: Float!): Transaction!
    }
  `,
  resolvers: {
    Query: {
      transactions: async (_, rawArgs, ctx) => {
        verifyUser(ctx);

        const args = getTransactionSchema.parse(rawArgs);

        const transactions = (await TransactionModel.find({
          $or: [{ receiver: ctx.user._id }, { sender: ctx.user._id }],
        })
          .limit(args.pageSize)
          .skip(args.page * args.pageSize)
          .sort({ createdAt: "desc" })
          .populate(["sender", "receiver"])) as PopulatedTransactionDocument[];

        const total = await TransactionModel.countDocuments({
          $or: [{ receiver: ctx.user._id }, { sender: ctx.user._id }],
        });

        return {
          transactions: transactions.map((transaction) => ({
            id: transaction._id,
            sender: {
              id: transaction.sender._id,
              username: transaction.sender.username,
              name: transaction.sender.name,
            },
            receiver:
              transaction.receiver !== null
                ? {
                    id: transaction.receiver._id,
                    username: transaction.receiver.username,
                    name: transaction.receiver.name,
                  }
                : null,
            amount: transaction.amount,
            createdAt: transaction.createdAt,
          })),
          page: args.page,
          pageSize: args.pageSize,
          total,
        };
      },
    },

    Mutation: {
      createTransaction: async (_, rawArgs, ctx) => {
        verifyUser(ctx);

        const args = sendTransactionSchema.parse(rawArgs);

        if (ctx.user.balance < args.amount) {
          throw new KnownError("Invalid amount", "BAD_REQUEST");
        }
        let receiver;

        try {
          receiver = await UserModel.findById(args.receiver);
        } catch (err) {
          throw new KnownError("Invalid receiver", "BAD_REQUEST");
        }

        if (!receiver || receiver._id.toString() === ctx.user._id.toString()) {
          throw new KnownError("Invalid receiver", "BAD_REQUEST");
        }

        const transaction = await new TransactionModel({
          sender: ctx.user._id,
          receiver: args.receiver,
          amount: args.amount,
          createdAt: Date.now(),
        });

        await ctx.user
          .set({
            balance: ctx.user.balance - transaction.amount,
          })
          .save();

        await receiver
          .set({
            balance: receiver.balance + transaction.amount,
          })
          .save();

        await transaction.save();

        return {
          id: transaction._id,
          sender: {
            id: ctx.user._id,
            username: ctx.user.username,
            name: ctx.user.name,
            balance: ctx.user.balance,
          },
          receiver: {
            id: receiver._id,
            username: receiver.username,
            name: receiver.name,
          },
          amount: transaction.amount,
          createdAt: transaction.createdAt,
        };
      },
    },
  },
});
