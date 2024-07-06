export type GraphQLError = {
  message: string;
  locations: {
    line: number;
    column: number;
  }[];
};

export type MutationError<T = any> = Error & {
  source?: {
    errors: GraphQLError[];
    variables: T;
  };
};
