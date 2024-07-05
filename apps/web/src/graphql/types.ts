export type MutationError<T = any> = Error & {
  source?: {
    errors: {
      message: string;
      locations: {
        line: number;
        column: number;
      }[];
    }[];
    variables: T;
  };
};
