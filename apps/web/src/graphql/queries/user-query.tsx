import { graphql } from "react-relay";

export const CurrentUser = graphql`
  query userQuery {
    me {
      id
      username
      name
      balance
    }
  }
`;
