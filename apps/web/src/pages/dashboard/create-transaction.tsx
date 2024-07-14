import { sendTransactionMutation } from "@/__generated__/sendTransactionMutation.graphql";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { SendTransaction } from "@/graphql/mutations/send-transaction";
import { GraphQLError } from "@/graphql/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { commitMutation, useRelayEnvironment } from "react-relay";
import { z } from "zod";

type CreateTransactionProps = {
  fetch: () => void;
  maxAmount: number;
};

export const CreateTransaction = ({
  fetch,
  maxAmount,
}: CreateTransactionProps) => {
  const environment = useRelayEnvironment();

  const formSchema = z.object({
    account: z
      .string({ message: "Account is required" })
      .min(1, { message: "Account is required" })
      .trim(),
    amount: z.coerce
      .number()
      .gt(0, { message: "Amount must be greater than 0" })
      .max(maxAmount, {
        message: "Amount must be less than or equal to $" + maxAmount,
      })
      .refine(
        (n) => {
          return (
            n.toString().split(".")[1] === undefined ||
            n.toString().split(".")[1]?.length <= 2
          );
        },
        { message: "Max precision is 2 decimal places" }
      ),
  });

  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account: "",
      amount: 0,
    },
    mode: "onSubmit",
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setPending(true);

    commitMutation<sendTransactionMutation>(environment, {
      mutation: SendTransaction,
      variables: {
        receiver: values.account,
        amount: values.amount,
      },
      onCompleted: () => {
        setPending(false);
        setOpen(false);
        fetch();
      },
      onError: (err: GraphQLError) => {
        setPending(false);
        toast({
          title: "Oops, something went wrong",
          description:
            err.source?.errors[0].message || "An unknown error occurred",
          variant: "destructive",
        });
      },
    });
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          New transaction
          <Plus className="h-4 w-4 text-primary-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New transaction</DialogTitle>
          <DialogDescription>Send money to another account.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-6"
          >
            <div className="mx-auto flex w-full flex-col items-center max-w-sm gap-4 ">
              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Account</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        // onChange={(event) =>
                        //   field.onChange(+event.target.value)
                        // }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">{pending ? "Sending..." : "Send"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
