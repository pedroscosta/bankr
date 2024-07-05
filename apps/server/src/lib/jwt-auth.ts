import jwt from "jsonwebtoken";
import { UserDocument, UserModel } from "../models/user";

export const sign = async (user: UserDocument) => {
  return jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
};

export const parseToken = async (token?: string) => {
  if (!token) return { user: null };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (!decoded) return { user: null };

    const user = await UserModel.findById(decoded.sub);

    if (!user) return { user: null };

    return { user };
  } catch (error) {
    return { user: null };
  }
};

export const verifyUser = (ctx?: any) => {
  if (!ctx?.user) throw new Error("Unauthorized");
};
