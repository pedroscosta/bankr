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
import { environment } from "@/lib/relay";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { commitMutation } from "react-relay";
import { z } from "zod";

type CreateTransactionProps = {
  fetch: () => void;
};

const formSchema = z.object({
  account: z.string({ message: "Account is required" }).trim(),
  amount: z.number().min(0),
});

export const CreateTransaction = ({ fetch }: CreateTransactionProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account: "",
      amount: undefined,
    },
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
      onError: (err: Error) => {
        setPending(false);
        toast({
          title: "Oops, something went wrong",
          description: err.message,
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
                        {...field}
                        onChange={(event) =>
                          field.onChange(+event.target.value)
                        }
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
