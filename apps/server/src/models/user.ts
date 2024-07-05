import bcrypt from "bcryptjs";
import mongoose, { Document, Schema } from "mongoose";

export type User = {
  username: string;
  name: string;
  password: string;
};

export type UserDocumentInterface = User &
  Document & {
    hashPassword(password: string): Promise<string>;
    comparePasswords(
      candidatePassword: string,
      hashedPassword: string
    ): Promise<boolean>;
  };

const UserSchema = new Schema<UserDocumentInterface>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "Password must have at least 8 characters"],
    select: false,
  },
});

UserSchema.index({ username: 1 });

UserSchema.methods = {
  hashPassword: async (password: string) => {
    const salt = await bcrypt.genSalt(16);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  },

  comparePasswords: async (
    candidatePassword: string,
    hashedPassword: string
  ) => {
    const res = await bcrypt.compare(candidatePassword, hashedPassword);
    return res;
  },
};

UserSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  user.password = await user.hashPassword(user.password);

  next();
});

export const UserModel = mongoose.model<UserDocumentInterface>(
  "User",
  UserSchema
);
