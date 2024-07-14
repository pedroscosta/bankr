import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    sendTransactionMutation: () => ({
      data: {
        sendTransaction: {
          id: "1",
          amount: 100,
          createdAt: 1679553199,
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
  await waitFor(() =>
    fireEvent.click(screen.getByRole("button", { name: "New transaction" }))
  );

  const account = screen.getByLabelText("Account");
  const amount = screen.getByLabelText("Value");

  expect(account).toBeTruthy();
  expect(amount).toBeTruthy();

  fireEvent.change(account, { target: { value: "2" } });
  fireEvent.change(amount, { target: { value: "100" } });

  await waitFor(() =>
    fireEvent.click(screen.getByRole("button", { name: "Send" }))
  );

  expect(screen.queryByText("Send money to another account.")).toBeNull(); // Modal is closed (aka success)
});
