import { format } from "date-fns";
import {
  ArrowUpRight,
  CircleUser,
  DollarSign,
  HandCoins,
  Layers,
  Plus,
} from "lucide-react";

import { transactionQuery } from "@/__generated__/transactionQuery.graphql";
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
import { useToast } from "@/components/ui/use-toast";
import { Transactions } from "@/graphql/queries/transaction-query";
import environment from "@/lib/relay";
import { useEffect, useState } from "react";
import { fetchQuery } from "relay-runtime";

export function DashboardPage() {
  const ITEMS_PER_PAGE = 5;

  const { toast } = useToast();

  const [transactions, setTransactions] = useState<
    transactionQuery["response"]["transactions"]["transactions"]
  >([]);
  const [pending, setPending] = useState(true);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchQuery<transactionQuery>(environment, Transactions, {
      page: currentPage,
      pageSize: ITEMS_PER_PAGE,
    }).subscribe({
      start: () => {
        setPending(true);
      },
      error: (error: Error) => {
        toast({
          title: "Oops, an error occurred",
          description: error.message,
          variant: "destructive",
        });
      },
      next: (data) => {
        setPending(false);
        setTransactions(data.transactions.transactions);
        setTotalTransactions(data.transactions.total);
      },
    });
  }, [currentPage]);

  const maxPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);

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
              <DropdownMenuItem>Logout</DropdownMenuItem>
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
                <div className="text-2xl font-bold">2350</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Balance
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-4 md:gap-8">
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Transactions</CardTitle>
                  <CardDescription>
                    Recent transactions from your store.
                  </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                  <a href="#">
                    New
                    <Plus className="h-4 w-4 text-primary-foreground" />
                  </a>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending &&
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
                    {!pending &&
                      transactions.map((t) => {
                        // const otherPerson =
                        //   t?.receiver?.id !== t?.sender?.id
                        //     ? t?.receiver
                        //     : t?.sender;
                        return (
                          <TableRow>
                            <TableCell>
                              <Badge className="text-xs border-green-500 size-8 flex items-center justify-center p-0">
                                <ArrowUpRight className="size-5" />
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {t?.receiver?.name}
                              </div>
                              <div className="hidden text-sm text-muted-foreground md:inline">
                                {t?.receiver?.id}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {format(t?.createdAt ?? 0, "dd/MM/yyyy HH:mm:ss")}
                            </TableCell>
                            <TableCell className="text-right">{`${(t?.amount ?? 0) < 0 ? "-" : ""}$${t?.amount ?? 0}`}</TableCell>
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
