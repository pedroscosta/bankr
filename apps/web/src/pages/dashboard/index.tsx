import { format } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleUser,
  Copy,
  DollarSign,
  HandCoins,
  Layers,
} from "lucide-react";

import { transactionQuery } from "@/__generated__/transactionQuery.graphql";
import { userQuery } from "@/__generated__/userQuery.graphql";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transactions } from "@/graphql/queries/transaction-query";
import { CurrentUser } from "@/graphql/queries/user-query";
import { logout } from "@/lib/utils";
import { useQuery } from "@/relay/useQuery";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateTransaction } from "./create-transaction";

export function DashboardPage() {
  const ITEMS_PER_PAGE = 5;

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(0);

  const {
    data: transactions,
    pending: pendingTransactions,
    fetch: fetchTransactions,
  } = useQuery<transactionQuery>(Transactions, {
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
  });

  const {
    data: user,
    pending: pendingUser,
    fetch: fetchUser,
  } = useQuery<userQuery>(CurrentUser);

  const maxPages = Math.ceil(
    (transactions?.transactions?.total ?? 0) / ITEMS_PER_PAGE
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="w-full sticky top-0 flex flex-row h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <nav className="flex flex-row text-lg font-medium items-center">
          <a
            href="#"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <HandCoins className="h-6 w-6 mr-4" />
          </a>
          <a
            href="#"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </a>
        </nav>

        <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout(navigate);
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex flex-1 justify-center">
        <div className="w-full flex flex-col gap-4 p-4 md:gap-8 md:p-8 md:max-w-7xl">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 w-full">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Number of Transactions
                </CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {pendingTransactions && <Skeleton className="h-8 w-24" />}
                {!pendingTransactions && (
                  <div
                    className="text-2xl font-bold"
                    data-testid="transactions-count"
                  >
                    {transactions?.transactions?.total ?? 0}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {pendingUser && <Skeleton className="h-8 w-24" />}
                {!pendingUser && (
                  <div className="text-2xl font-bold" data-testid="balance">
                    ${user?.me?.balance}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-4 md:gap-8">
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Transactions</CardTitle>
                  <CardDescription>
                    Recent transactions of your account.
                  </CardDescription>
                </div>
                <div className="ml-auto flex flex-row gap-4 items-center">
                  <p>Account number:</p>
                  <div className="bg-muted h-9 px-2 rounded-md border flex flex-row items-center gap-2">
                    <p>{user?.me?.id}</p>
                    <Button
                      variant="ghost"
                      className="size-6 p-0 bg-muted"
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(user?.me?.id ?? "");
                        } catch (error: any) {
                          console.error(error);
                        }
                      }}
                    >
                      <Copy className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <CreateTransaction
                    fetch={() => {
                      fetchUser();
                      fetchTransactions();
                    }}
                    maxAmount={user?.me?.balance ?? 0}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTransactions &&
                      [...Array(ITEMS_PER_PAGE).keys()].map((i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-6 w-6" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="ml-auto h-6 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="ml-auto h-6 w-12" />
                          </TableCell>
                        </TableRow>
                      ))}
                    {!pendingTransactions &&
                      transactions?.transactions?.transactions.map((t) => {
                        const receiving = user?.me?.id === t?.receiver?.id;
                        const otherPerson = receiving ? t?.sender : t?.receiver;

                        return (
                          <TableRow key={t?.id}>
                            <TableCell>
                              {receiving ? (
                                <Badge className="text-xs size-8 flex items-center justify-center p-0">
                                  <ArrowDownLeft className="size-5" />
                                </Badge>
                              ) : (
                                <Badge
                                  className="text-xs  size-8 flex items-center justify-center p-0"
                                  variant={"outline"}
                                >
                                  <ArrowUpRight className="size-5" />
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div
                                className="font-medium"
                                data-testid="transaction-person-name"
                              >
                                {otherPerson?.name}
                              </div>
                              <div
                                className="hidden text-sm text-muted-foreground md:inline"
                                data-testid="transaction-person-id"
                              >
                                {otherPerson?.id}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {format(t?.createdAt ?? 0, "dd/MM/yyyy HH:mm:ss")}
                            </TableCell>
                            <TableCell
                              className="text-right"
                              data-testid="transaction-amount"
                            >{`${(t?.amount ?? 0) < 0 ? "-" : ""}$${t?.amount ?? 0}`}</TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="justify-end">
                <Pagination className="mx-0 w-fit">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        disabled={currentPage === 0}
                        onClick={() => {
                          setCurrentPage(currentPage - 1);
                        }}
                        className="hover:cursor-pointer"
                      />
                    </PaginationItem>
                    {currentPage > 0 && (
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => {
                            setCurrentPage(currentPage - 1);
                          }}
                        >
                          {currentPage}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink isActive>
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                    {currentPage < maxPages - 1 && (
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => {
                            setCurrentPage(currentPage + 1);
                          }}
                        >
                          {currentPage + 2}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    {currentPage < maxPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        disabled={currentPage >= maxPages - 1}
                        onClick={() => {
                          setCurrentPage(currentPage + 1);
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
