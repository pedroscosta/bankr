import { render, screen } from "@testing-library/react";
import { RelayEnvironmentProvider } from "react-relay";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { expect, test } from "vitest";
import { DashboardPage } from "..";

// https://github.com/facebook/relay/issues/4228#issuecomment-1480247642
import { createRelayEnvironment } from "@/relay/__tests__/mocked-environment";
import { vi } from "vitest";
(global as any).jest = vi;

test("login page renders and executes mutation", async () => {
  const environment = createRelayEnvironment({
    transactionQuery: () => ({
      data: {
        transactions: {
          transactions: [
            {
              sender: {
                id: "1",
                username: "test",
                name: "Test",
              },
              receiver: {
                id: "2",
                username: "test2",
                name: "Test2",
              },
              id: "1",
              amount: 100,
              createdAt: 1679553199,
            },
          ],
          total: 1,
        },
      },
    }),
    userQuery: () => ({
      data: {
        me: {
          id: "1",
          username: "test",
          name: "Test",
          balance: 100,
        },
      },
    }),
  });

  const router = createMemoryRouter(
    [{ path: "/", element: <DashboardPage /> }],
    { initialEntries: ["/"] }
  );

  render(
    <RelayEnvironmentProvider environment={environment}>
      <RouterProvider router={router} />
    </RelayEnvironmentProvider>
  );

  await screen.findByTestId("transactions-count");

  const transactionsCount = screen.getByTestId("transactions-count");
  expect(transactionsCount).toBeTruthy();
  expect(transactionsCount.textContent).toBe("1");

  const balance = screen.getByTestId("balance");
  expect(balance).toBeTruthy();
  expect(balance.textContent).toBe("$100");

  const transactionReceiptients = screen.getAllByTestId(
    "transaction-person-name"
  );
  expect(transactionReceiptients).toHaveLength(1);
  expect(transactionReceiptients[0].textContent).toBe("Test2");

  const transactionRecipentIds = screen.getAllByTestId("transaction-person-id");
  expect(transactionRecipentIds).toHaveLength(1);
  expect(transactionRecipentIds[0].textContent).toBe("2");

  const transactionAmounts = screen.getAllByTestId("transaction-amount");
  expect(transactionAmounts).toHaveLength(1);
  expect(transactionAmounts[0].textContent).toBe("$100");
});
