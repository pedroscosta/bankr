import { graphql } from "react-relay";

export const Register = graphql`
  mutation registerMutation(
    $username: String!
    $name: String!
    $password: String!
  ) {
    register(username: $username, name: $name, password: $password) {
      user {
        id
        name
      }
    }
  }
`;
