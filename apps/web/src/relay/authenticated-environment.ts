import {
  Environment,
  FetchFunction,
  Network,
  RecordSource,
  Store,
} from "relay-runtime";
import { getCookie } from "../lib/utils";

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

const environment = new Environment({
  network: Network.create(fetchFunction),
  store: new Store(new RecordSource()),
});

export { environment };
