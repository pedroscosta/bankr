import mongoose, { Document, Schema } from "mongoose";
import { UserDocument } from "./user";

export type Transaction = {
  _id: string;
  sender: Schema.Types.ObjectId | UserDocument;
  receiver: Schema.Types.ObjectId | UserDocument | null;
  amount: number;
  createdAt: number;
};

export type PopulatedTransaction = {
  _id: string;
  sender: UserDocument;
  receiver: UserDocument | null;
  amount: number;
  createdAt: number;
};

export type TransactionDocument = Transaction & Document;
export type PopulatedTransactionDocument = PopulatedTransaction & Document;

const TransactionSchema = new Schema<TransactionDocument>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Number,
    required: true,
    default: Date.now,
  },
});

TransactionSchema.index({ sender: 1 });
TransactionSchema.index({ receiver: 1 });

export const TransactionModel = mongoose.model<TransactionDocument>(
  "Transaction",
  TransactionSchema
);
