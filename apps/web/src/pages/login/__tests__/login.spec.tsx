import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RelayEnvironmentProvider } from "react-relay";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { expect, test } from "vitest";
import { LoginPage } from "..";

// https://github.com/facebook/relay/issues/4228#issuecomment-1480247642
import { vi } from "vitest";
(global as any).jest = vi;

test("login page renders and executes mutation", async () => {
  const environment = createMockEnvironment();

  // environment.mock.queuePendingOperation(Register, {});
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation)
  );

  const router = createMemoryRouter(
    [
      { path: "/login", element: <LoginPage /> },
      { path: "/", element: <p>Success</p> },
    ],
    { initialEntries: ["/login"] }
  );

  render(
    <RelayEnvironmentProvider environment={environment}>
      <RouterProvider router={router} />
    </RelayEnvironmentProvider>
  );

  const username = screen.getByRole("textbox", { name: "Username" });
  const password = screen.getByLabelText("Password");
  const submit = screen.getByRole("button", { name: "Sign in" });

  expect(screen.getByRole("heading", { name: "Login" })).toBeTruthy();
  expect(username).toBeTruthy();
  expect(password).toBeTruthy();
  expect(submit).toBeTruthy();

  fireEvent.change(username, { target: { value: "test" } });
  fireEvent.change(password, { target: { value: "123456789" } });

  await waitFor(() => fireEvent.click(submit));

  expect(document.cookie).toBe('token=<mock-value-for-field-"token">');

  expect(screen.getByText("Success")).toBeTruthy();
});
