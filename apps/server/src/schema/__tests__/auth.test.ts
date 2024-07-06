const mockingoose = require("mockingoose");
import { graphql } from "graphql";
import { verify } from "jsonwebtoken";
import { schema } from "..";
import { UserModel } from "../../models/user";

describe("auth schema", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it("should register a new user", async () => {
    mockingoose(UserModel);

    const mutation = /* GraphQL */ `
      mutation Mut($username: String!, $password: String!, $name: String!) {
        register(username: $username, password: $password, name: $name) {
          user {
            id
            username
            name
          }
        }
      }
    `;

    const result = await graphql({
      schema,
      source: mutation,
      variableValues: {
        username: "pedro",
        password: "123456789",
        name: "Pedro",
      },
    });

    expect(result.errors).toBeUndefined();

    const { user } = result?.data?.register as any;

    expect(user).toBeDefined();

    expect(user?.username).toBe("pedro");
    expect(user?.name).toBe("Pedro");
    expect(user?.id).toBeDefined();
  }, 30_000);

  it("should not register a new user with a duplicated username", async () => {
    mockingoose(UserModel).toReturn(() => {
      const err = new Error("duplicated username") as any;
      err.code = 11000; // Duplication error code
      throw err;
    }, "save");

    const mutation = /* GraphQL */ `
      mutation Mut($username: String!, $password: String!, $name: String!) {
        register(username: $username, password: $password, name: $name) {
          user {
            id
            username
            name
          }
        }
      }
    `;

    const result = await graphql({
      schema,
      source: mutation,
      variableValues: {
        username: "pedro",
        password: "123456789",
        name: "Pedro",
      },
    });

    expect(result.errors).toBeDefined();

    expect(result.errors?.[0]?.message).toBe("Username already exists");

    expect(result.data).toBeNull();
  }, 30_000);

  it("should login a valid user", async () => {
    const _user = new UserModel({
      username: "pedro",
      name: "Pedro",
      password: "123456789",
    });

    process.env.JWT_SECRET = "123456789";

    _user.password = await _user.hashPassword(_user.password);

    mockingoose(UserModel).toReturn((query: any) => {
      if (query._conditions.username === "pedro") {
        return _user;
      }

      return null;
    }, "findOne");

    const mutation = /* GraphQL */ `
      mutation Mut($username: String!, $password: String!) {
        login(username: $username, password: $password) {
          token
          user {
            id
            username
            name
          }
        }
      }
    `;

    const result = await graphql({
      schema,
      source: mutation,
      variableValues: {
        username: "pedro",
        password: "123456789",
      },
    });

    expect(result.errors).toBeUndefined();

    const { token, user } = result?.data?.login as any;

    expect(token).toBeDefined();

    const decoded = await verify(token, process.env.JWT_SECRET!);
    // Jest is not able to compare the _id field, so we need to convert it to a string
    expect(decoded.sub?.toString()).toEqual(_user._id.toString());

    expect(user).toBeDefined();
    expect(user?.id.toString()).toEqual(_user._id.toString());
    expect(user?.username).toBe(_user.username);
    expect(user?.name).toBe(_user.name);
  }, 30_000);

  it("should not login with a invalid username", async () => {
    const _user = new UserModel({
      username: "pedro",
      name: "Pedro",
      password: "123456789",
    });

    process.env.JWT_SECRET = "123456789";

    _user.password = await _user.hashPassword(_user.password);

    mockingoose(UserModel).toReturn((query: any) => {
      if (query._conditions.username === "pedro") {
        return _user;
      }

      return null;
    }, "findOne");

    const mutation = /* GraphQL */ `
      mutation Mut($username: String!, $password: String!) {
        login(username: $username, password: $password) {
          token
          user {
            id
            username
            name
          }
        }
      }
    `;

    const result = await graphql({
      schema,
      source: mutation,
      variableValues: {
        username: "pEdro",
        password: "123456789",
      },
    });

    expect(result.errors).toBeDefined();

    expect(result.errors?.[0]?.message).toBe("Invalid username or password");

    expect(result.data).toBeNull();
  }, 30_000);

  it("should not login with a invalid password", async () => {
    const _user = new UserModel({
      username: "pedro",
      name: "Pedro",
      password: "123456789",
    });

    process.env.JWT_SECRET = "123456789";

    _user.password = await _user.hashPassword(_user.password);

    mockingoose(UserModel).toReturn((query: any) => {
      if (query._conditions.username === "pedro") {
        return _user;
      }

      return null;
    }, "findOne");

    const mutation = /* GraphQL */ `
      mutation Mut($username: String!, $password: String!) {
        login(username: $username, password: $password) {
          token
          user {
            id
            username
            name
          }
        }
      }
    `;

    const result = await graphql({
      schema,
      source: mutation,
      variableValues: {
        username: "pedro",
        password: "0123456789",
      },
    });

    expect(result.errors).toBeDefined();

    expect(result.errors?.[0]?.message).toBe("Invalid username or password");

    expect(result.data).toBeNull();
  }, 30_000);
});
