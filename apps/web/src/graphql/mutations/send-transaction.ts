import { graphql } from "react-relay";

export const SendTransaction = graphql`
  mutation sendTransactionMutation($receiver: String!, $amount: Float!) {
    createTransaction(receiver: $receiver, amount: $amount) {
      id
    }
  }
`;
