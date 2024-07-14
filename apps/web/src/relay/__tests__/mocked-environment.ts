import {
  Environment,
  FetchFunction,
  GraphQLResponse,
  Network,
  RecordSource,
  Store,
  Variables,
} from "relay-runtime";

const createFetchFn: (
  resolvers: Record<string, (vars: Variables) => GraphQLResponse>
) => FetchFunction = (resolvers) => {
  return async (request, variables) => {
    return new Promise((resolve) => {
      resolve(resolvers[request.name](variables));
    });
  };
};

export function createRelayEnvironment(
  resolvers: Record<string, (vars: Variables) => any>
) {
  return new Environment({
    network: Network.create(createFetchFn(resolvers)),
    store: new Store(new RecordSource()),
  });
}
