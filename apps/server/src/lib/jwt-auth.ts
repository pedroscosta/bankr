import { YogaInitialContext } from "graphql-yoga";
import jwt from "jsonwebtoken";
import { KnownError } from "../errors/known-error";
import { UserDocument, UserModel } from "../models/user";

export const sign = async (user: UserDocument) => {
  return jwt.sign({ sub: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
};

export const parseToken = async (token?: string) => {
  if (!token) return { user: null };

  try {
    const decoded = jwt.verify(token.substring(7), process.env.JWT_SECRET!);

    if (!decoded) return { user: null };

    const user = await UserModel.findById(decoded.sub);

    if (!user) return { user: null };

    return { user };
  } catch (error) {
    return { user: null };
  }
};

export type AuthenticatedContext = YogaInitialContext & {
  user: UserDocument;
};

export const verifyUser = (
  ctx?: YogaInitialContext & {
    user?: UserDocument;
  }
) => {
  if (!ctx?.user) throw new KnownError("Unauthorized", "UNAUTHORIZED");
};
