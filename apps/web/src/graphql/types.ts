import { PayloadError } from "relay-runtime";

export type GraphQLError<T = any> = Error & {
  source?: {
    errors: PayloadError[];
    variables: T;
  };
};
