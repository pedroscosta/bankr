import { GraphQLError } from "@/graphql/types";
import { useEffect, useState } from "react";
import {
  Environment,
  FetchFunction,
  fetchQuery,
  GraphQLTaggedNode,
  Network,
  OperationType,
  RecordSource,
  Store,
} from "relay-runtime";
import { getCookie } from "./utils";

type QueryResponse<T = any> = {
  data: T;
  errors?: GraphQLError[];
};

const fetchFunction: FetchFunction = async (operation, variables) => {
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

const network = Network.create(fetchFunction);
const store = new Store(new RecordSource());

const environment = new Environment({
  network,
  store,
});

export default environment;

export const useQuery = <T extends OperationType>(
  query: GraphQLTaggedNode,
  variables: T["variables"] = {},
  errorCallback?: (error: Error) => void
) => {
  const [data, setData] = useState<{ pending: boolean; data?: T["response"] }>({
    pending: true,
  });

  const fetch = () => {
    fetchQuery<T>(environment, query, variables).subscribe({
      start: () => {
        setData({ pending: true });
      },
      error: errorCallback,
      next: (data) => {
        setData({ pending: false, data });
      },
    });
  };

  useEffect(() => {
    fetch();
  }, [JSON.stringify(variables)]);

  return { ...data, fetch };
};
