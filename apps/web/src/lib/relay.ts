import { GraphQLError } from "@/graphql/types";
import {
  Environment,
  FetchFunction,
  Network,
  RecordSource,
  Store,
} from "relay-runtime";
import { getCookie } from "./utils";

type QueryResponse<T = any> = {
  data: T;
  errors?: GraphQLError[];
};

const fetchQuery: FetchFunction = async (operation, variables) => {
  const token = getCookie("token");
  return (
    await fetch(import.meta.env.VITE_PUBLIC_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        // Add authentication and other headers here
        "content-type": "application/json",
        authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        query: operation.text, // GraphQL text from input
        variables,
      }),
    })
  ).json();
};

const network = Network.create(fetchQuery);
const store = new Store(new RecordSource());

const environment = new Environment({
  network,
  store,
});

export default environment;
