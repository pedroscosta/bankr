import { useEffect, useState } from "react";
import { useRelayEnvironment } from "react-relay";
import { fetchQuery, GraphQLTaggedNode, OperationType } from "relay-runtime";

export const useQuery = <T extends OperationType>(
  query: GraphQLTaggedNode,
  variables: T["variables"] = {},
  errorCallback?: (error: Error) => void
) => {
  const environment = useRelayEnvironment();

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
