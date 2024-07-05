import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthGuard from "./guards/auth";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello world!</div>,
  },
  {
    path: "/login",
    element: (
      <AuthGuard redirect="/" reverse>
        <LoginPage />
      </AuthGuard>
    ),
  },
  {
    path: "/register",
    element: (
      <AuthGuard redirect="/" reverse>
        <RegisterPage />
      </AuthGuard>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
