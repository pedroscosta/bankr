import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RelayEnvironmentProvider } from "react-relay";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { expect, test } from "vitest";
import { RegisterPage } from "..";

// https://github.com/facebook/relay/issues/4228#issuecomment-1480247642
import { vi } from "vitest";
(global as any).jest = vi;

test("register page renders and executes mutation", async () => {
  const environment = createMockEnvironment();

  // environment.mock.queuePendingOperation(Register, {});
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation)
  );

  const router = createMemoryRouter([
    { path: "/", element: <RegisterPage /> },
    { path: "/login", element: <p>Success</p> },
  ]);

  render(
    <RelayEnvironmentProvider environment={environment}>
      <RouterProvider router={router} />
    </RelayEnvironmentProvider>
  );

  const username = screen.getByRole("textbox", { name: "Username" });
  const name = screen.getByRole("textbox", { name: "Name" });
  const password = screen.getByLabelText("Password");
  const confirmPassword = screen.getByLabelText("Confirm Password");
  const submit = screen.getByRole("button", { name: "Sign up" });

  expect(screen.getByRole("heading", { name: "Sign up" })).toBeTruthy();
  expect(username).toBeTruthy();
  expect(name).toBeTruthy();
  expect(password).toBeTruthy();
  expect(confirmPassword).toBeTruthy();
  expect(submit).toBeTruthy();

  fireEvent.change(username, { target: { value: "test" } });
  fireEvent.change(name, { target: { value: "Test" } });
  fireEvent.change(password, { target: { value: "123456789" } });
  fireEvent.change(confirmPassword, { target: { value: "123456789" } });

  await waitFor(() => fireEvent.click(submit));

  expect(screen.getByText("Success")).toBeTruthy();
});

test("expect error messages when inputs are invalid", async () => {
  const environment = createMockEnvironment();

  // environment.mock.queuePendingOperation(Register, {});
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation)
  );

  const router = createMemoryRouter([
    { path: "/", element: <RegisterPage /> },
    { path: "/login", element: <p>Success</p> },
  ]);

  render(
    <RelayEnvironmentProvider environment={environment}>
      <RouterProvider router={router} />
    </RelayEnvironmentProvider>
  );

  const password = screen.getByLabelText("Password");
  const confirmPassword = screen.getByLabelText("Confirm Password");
  const submit = screen.getByRole("button", { name: "Sign up" });

  fireEvent.change(password, { target: { value: "123" } });
  fireEvent.change(confirmPassword, { target: { value: "1234567890" } });

  await waitFor(() => fireEvent.click(submit));

  expect(
    screen.getByText("Username must be at least 3 characters")
  ).toBeTruthy();
  expect(screen.getByText("Name must be at least 3 characters")).toBeTruthy();
  expect(
    screen.getByText("Password must be at least 8 characters")
  ).toBeTruthy();
  expect(screen.getByText("The passwords did not match")).toBeTruthy();
});
