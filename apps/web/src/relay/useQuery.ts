import { useToast } from "@/components/ui/use-toast";
import { GraphQLError } from "@/graphql/types";
import { logout } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useRelayEnvironment } from "react-relay";
import { useNavigate } from "react-router-dom";
import { fetchQuery, GraphQLTaggedNode, OperationType } from "relay-runtime";

export const useQuery = <T extends OperationType>(
  query: GraphQLTaggedNode,
  variables: T["variables"] = {},
  errorCallback?: (error: GraphQLError) => void
) => {
  const environment = useRelayEnvironment();

  const navigate = useNavigate();
  const { toast } = useToast();

  const [data, setData] = useState<{ pending: boolean; data?: T["response"] }>({
    pending: true,
  });

  const fetch = () => {
    fetchQuery<T>(environment, query, variables).subscribe({
      start: () => {
        setData({ pending: true });
      },
      error:
        errorCallback ??
        ((err: GraphQLError) => {
          if (err.source?.errors[0].message === "Unauthorized") {
            logout(navigate);
            return;
          }
          toast({
            title: "Oops, something went wrong",
            description:
              err.source?.errors?.[0]?.message ?? "An unknown error occurred",
            variant: "destructive",
          });
        }),
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
