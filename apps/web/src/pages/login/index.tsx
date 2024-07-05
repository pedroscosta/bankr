import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { loginMutation } from "@/__generated__/loginMutation.graphql";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Login } from "@/graphql/mutations/login-mutation";
import { MutationError } from "@/graphql/types";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useMutation } from "react-relay";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  username: z
    .string({ message: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must be at most 20 characters")
    .trim(),
});

export function LoginPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [login] = useMutation<loginMutation>(Login);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setPending(true);

    login({
      variables: {
        username: values.username,
        password: values.password,
      },
      onCompleted: (res, errors) => {
        setPending(false);

        if (errors && errors.length > 0) {
          setError(errors[0].message);
          return;
        }

        document.cookie = `token=${res.login.token}; path=/`;
        navigate("/", { replace: true });
      },
      onError: (err: MutationError) => {
        setPending(false);
        setError(err.source?.errors[0].message || "An unknown error occurred");
      },
    });
  }

  return (
    <div className="flex w-full h-screen justify-center items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your username below to login to your account.
          </CardDescription>
          {error && (
            <div className="pt-6">
              <Alert variant="destructive" className="space-y-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex items-center flex-col gap-2">
              <Button className="w-full" disabled={pending}>
                {pending ? "Loading..." : "Sign in"}
              </Button>
              <a
                href="/register"
                className="text-secondary-foreground hover:text-primary hover:underline"
              >
                Or register an account
              </a>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
