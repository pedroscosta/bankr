const mockingoose = require("mockingoose");
import { graphql } from "graphql";
import { schema } from "..";
import { TransactionModel } from "../../models/transaction";
import { UserModel } from "../../models/user";

describe("transactions schema", () => {
  const _user = new UserModel({
    username: "pedro",
    name: "Pedro",
    password: "123456789",
  });

  const _otherUser = new UserModel({
    username: "hunter",
    name: "Hunter",
    password: "123456789",
  });

  const _transactions = [...new Array(20)].map(
    (_, i) =>
      new TransactionModel({
        sender: i % 2 === 0 ? _user : _otherUser,
        receiver: i % 2 === 0 ? _otherUser : _user,
        amount: 100,
        createdAt: Date.now(),
      })
  );

  beforeEach(() => {
    mockingoose.resetAll();
    TransactionModel.schema.path("sender", Object);
    TransactionModel.schema.path("receiver", Object);
  });

  it("should return a list of transactions", async () => {
    mockingoose(TransactionModel)
      .toReturn((query: any) => {
        return _transactions.slice(
          query.options.skip,
          query.options.skip + query.options.limit
        );
      }, "find")
      .toReturn((query: any) => {
        return _transactions.length;
      }, "countDocuments");

    const query = /* GraphQL */ `
      query Query($page: Int, $pageSize: Int) {
        transactions(page: $page, pageSize: $pageSize) {
          transactions {
            id
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
            amount
            createdAt
          }
          page
          pageSize
          total
        }
      }
    `;

    const result = await graphql({
      schema,
      source: query,
      variableValues: {},
      contextValue: {
        user: _user,
      },
    });

    expect(result.errors).toBeUndefined();

    const { transactions, page, pageSize } = result?.data?.transactions as any;

    expect(page).toBe(0);
    expect(pageSize).toBe(10);

    expect(transactions).toBeDefined();
    expect(transactions?.length).toBe(10);
    expect(transactions?.[0]?.id).toBeDefined();
    expect(transactions?.[0]?.sender?.id).toBeDefined();
    expect(transactions?.[0]?.sender?.username).toBeDefined();
    expect(transactions?.[0]?.sender?.name).toBeDefined();
    expect(transactions?.[0]?.receiver?.id).toBeDefined();
    expect(transactions?.[0]?.receiver?.username).toBeDefined();
    expect(transactions?.[0]?.receiver?.name).toBeDefined();
    expect(transactions?.[0]?.amount).toBeDefined();
    expect(transactions?.[0]?.createdAt).toBeDefined();
  }, 30_000);

  it("should return a list of transactions with pagination", async () => {
    mockingoose(TransactionModel)
      .toReturn((query: any) => {
        return _transactions.slice(
          query.options.skip,
          query.options.skip + query.options.limit
        );
      }, "find")
      .toReturn((query: any) => {
        return _transactions.length;
      }, "countDocuments");

    const query = /* GraphQL */ `
      query Query($page: Int, $pageSize: Int) {
        transactions(page: $page, pageSize: $pageSize) {
          transactions {
            id
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
            amount
            createdAt
          }
          page
          pageSize
          total
        }
      }
    `;

    const result = await graphql({
      schema,
      source: query,
      variableValues: {
        page: 1,
        pageSize: 5,
      },
      contextValue: {
        user: _user,
      },
    });

    expect(result.errors).toBeUndefined();

    const { transactions, page, pageSize } = result?.data?.transactions as any;

    expect(page).toBe(1);
    expect(pageSize).toBe(5);

    expect(transactions).toBeDefined();
    expect(transactions?.length).toBe(5);
    expect(transactions?.[0]?.id).toBeDefined();
    expect(transactions?.[0]?.sender?.id).toBeDefined();
    expect(transactions?.[0]?.sender?.username).toBeDefined();
    expect(transactions?.[0]?.sender?.name).toBeDefined();
    expect(transactions?.[0]?.receiver?.id).toBeDefined();
    expect(transactions?.[0]?.receiver?.username).toBeDefined();
    expect(transactions?.[0]?.receiver?.name).toBeDefined();
    expect(transactions?.[0]?.amount).toBeDefined();
    expect(transactions?.[0]?.createdAt).toBeDefined();
  }, 30_000);

  it("should create a transaction", async () => {
    mockingoose(UserModel).toReturn((query: any) => {
      if (query._conditions._id.toString() === _user._id.toString()) {
        return _user;
      }
      if (query._conditions._id.toString() === _otherUser._id.toString()) {
        return _otherUser;
      }

      return null;
    }, "findOne");

    const mutation = /* GraphQL */ `
      mutation Mut($receiver: String!, $amount: Float!) {
        createTransaction(receiver: $receiver, amount: $amount) {
          id
          sender {
            id
            username
            name
            balance
          }
          receiver {
            id
            username
            name
          }
          amount
          createdAt
        }
      }
    `;

    const result = await graphql({
      schema,
      source: mutation,
      variableValues: {
        receiver: _otherUser._id.toString(),
        amount: 100,
      },
      contextValue: {
        user: _user,
      },
    });

    expect(result.errors).toBeUndefined();

    const { createTransaction } = result?.data as any;

    expect(createTransaction).toBeDefined();
    expect(createTransaction?.id).toBeDefined();

    expect(createTransaction?.sender?.id).toBeDefined();
    expect(createTransaction?.sender?.username).toBeDefined();
    expect(createTransaction?.sender?.name).toBeDefined();
    expect(createTransaction?.sender?.balance).toBe(400);

    expect(createTransaction?.receiver?.id).toBeDefined();
    expect(createTransaction?.receiver?.username).toBeDefined();
    expect(createTransaction?.receiver?.name).toBeDefined();
    expect(createTransaction?.receiver?.balance).toBeUndefined();

    expect(createTransaction?.amount).toBe(100);
    expect(createTransaction?.createdAt).toBeDefined();
  }, 30_000);

  it("shouldn't create a transaction with invalid receiver", async () => {
    mockingoose(UserModel).toReturn((query: any) => {
      if (query._conditions._id.toString() === _user._id.toString()) {
        return _user;
      }
      if (query._conditions._id.toString() === _otherUser._id.toString()) {
        return _otherUser;
      }

      return null;
    }, "findOne");

    const mutation = /* GraphQL */ `
      mutation Mut($receiver: String!, $amount: Float!) {
        createTransaction(receiver: $receiver, amount: $amount) {
          id
          sender {
            id
            username
            name
            balance
          }
          receiver {
            id
            username
            name
          }
          amount
          createdAt
        }
      }
    `;

    const result = await graphql({
      schema,
      source: mutation,
      variableValues: {
        receiver: "invalid",
        amount: 100,
      },
      contextValue: {
        user: _user,
      },
    });

    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBe(1);
    expect(result.errors?.[0]?.message).toBe("Invalid receiver");

    expect(result.data).toBeNull();
  }, 30_000);

  it("shouldn't create a transaction with same user as receiver", async () => {
    mockingoose(UserModel).toReturn((query: any) => {
      if (query._conditions._id.toString() === _user._id.toString()) {
        return _user;
      }
      if (query._conditions._id.toString() === _otherUser._id.toString()) {
        return _otherUser;
      }

      return null;
    }, "findOne");

    const mutation = /* GraphQL */ `
      mutation Mut($receiver: String!, $amount: Float!) {
        createTransaction(receiver: $receiver, amount: $amount) {
          id
          sender {
            id
            username
            name
            balance
          }
          receiver {
            id
            username
            name
          }
          amount
          createdAt
        }
      }
    `;

    const result = await graphql({
      schema,
      source: mutation,
      variableValues: {
        receiver: _user._id.toString(),
        amount: 100,
      },
      contextValue: {
        user: _user,
      },
    });

    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBe(1);
    expect(result.errors?.[0]?.message).toBe("Invalid receiver");

    expect(result.data).toBeNull();
  }, 30_000);

  it("shouldn't create a transaction with invalid amount", async () => {
    mockingoose(UserModel).toReturn((query: any) => {
      if (query._conditions._id.toString() === _user._id.toString()) {
        return _user;
      }
      if (query._conditions._id.toString() === _otherUser._id.toString()) {
        return _otherUser;
      }

      return null;
    }, "findOne");

    const mutation = /* GraphQL */ `
      mutation Mut($receiver: String!, $amount: Float!) {
        createTransaction(receiver: $receiver, amount: $amount) {
          id
          sender {
            id
            username
            name
            balance
          }
          receiver {
            id
            username
            name
          }
          amount
          createdAt
        }
      }
    `;

    const result = await graphql({
      schema,
      source: mutation,
      variableValues: {
        receiver: _otherUser._id.toString(),
        amount: 600,
      },
      contextValue: {
        user: _user,
      },
    });

    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBe(1);
    expect(result.errors?.[0]?.message).toBe("Invalid amount");

    expect(result.data).toBeNull();
  }, 30_000);

  it("shouldn't create a transaction with negative amount", async () => {
    mockingoose(UserModel).toReturn((query: any) => {
      if (query._conditions._id.toString() === _user._id.toString()) {
        return _user;
      }
      if (query._conditions._id.toString() === _otherUser._id.toString()) {
        return _otherUser;
      }

      return null;
    }, "findOne");

    const mutation = /* GraphQL */ `
      mutation Mut($receiver: String!, $amount: Float!) {
        createTransaction(receiver: $receiver, amount: $amount) {
          id
          sender {
            id
            username
            name
            balance
          }
          receiver {
            id
            username
            name
          }
          amount
          createdAt
        }
      }
    `;

    const result = await graphql({
      schema,
      source: mutation,
      variableValues: {
        receiver: _otherUser._id.toString(),
        amount: -100,
      },
      contextValue: {
        user: _user,
      },
    });

    expect(result.errors).toBeDefined();
    expect(JSON.parse(result.errors?.[0]?.message ?? "")?.[0]?.message).toBe(
      "Invalid amount"
    );

    expect(result.data).toBeNull();
  }, 30_000);
});
