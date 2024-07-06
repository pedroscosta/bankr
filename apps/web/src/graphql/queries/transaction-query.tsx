import { graphql } from "react-relay";

export const Transactions = graphql`
  query transactionQuery($page: Int, $pageSize: Int) {
    transactions(page: $page, pageSize: $pageSize) {
      transactions {
        sender {
          id
          username
          name
        }
        receiver {
          id
          username
          name
        }
        id
        amount
        createdAt
      }
      total
    }
  }
`;
