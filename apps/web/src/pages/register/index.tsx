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

import { registerMutation } from "@/__generated__/registerMutation.graphql";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Register } from "@/graphql/mutations/register-mutation";
import { MutationError } from "@/graphql/types";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useMutation } from "react-relay";
import { useNavigate } from "react-router-dom";

const formSchema = z
  .object({
    username: z
      .string({ message: "Username is required" })
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .trim(),
    name: z
      .string({ message: "Name is required" })
      .min(3, "Name must be at least 3 characters")
      .max(64, "Name must be at most 64 characters")
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .trim(),
    // OPtional because we validate it in a custom refinement
    confirmPassword: z.string().trim().optional(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

export function RegisterPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [register] = useMutation<registerMutation>(Register);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setPending(true);

    register({
      variables: values,
      onCompleted: (_, errors) => {
        setPending(false);

        if (errors && errors.length > 0) {
          setError(errors[0].message);
          return;
        }

        navigate("/login", { replace: true });
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
          <CardTitle className="text-2xl w-full text-center">Sign up</CardTitle>
          <CardDescription>
            Enter your information below to create your account.
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
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
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
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex items-center flex-col gap-2">
              <Button className="w-full" disabled={pending}>
                {pending ? "Loading..." : "Sign up"}
              </Button>
              <a
                href="/login"
                className="text-secondary-foreground hover:text-primary hover:underline"
              >
                Or sign in
              </a>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
