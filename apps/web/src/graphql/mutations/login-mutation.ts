import { graphql } from "react-relay";

export const Login = graphql`
  mutation loginMutation($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        name
      }
    }
  }
`;
