"use client";

import Container from "@/components/Container";
import OrdersComponent from "@/components/OrdersComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileX } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import ReportModal from "@/components/ReportModal";

const OrdersPage = () => {
  const [hasOrders, setHasOrders] = useState<boolean | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [onReportSuccess, setOnReportSuccess] = useState<(() => void) | undefined>(undefined);

  const handleReportClick = (orderId: string, onSuccess: () => void) => {
    setSelectedOrder(orderId);
    setOnReportSuccess(() => onSuccess);
    setReportOpen(true);
  };

  return (
    <div>
      <Container className="py-10">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Order List</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] md:w-auto">Order Number</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reports </TableHead>
                    <TableHead>Rates</TableHead>
                      
                  </TableRow>
                </TableHeader>
                <OrdersComponent
                  onOrdersLoaded={setHasOrders}
                  onReportClick={handleReportClick}
                />
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>

        {hasOrders === false && (
          <div className="flex flex-col items-center justify-center py-12">
            <FileX className="h-24 w-24 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold">No orders found</h2>
            <p className="mt-2 text-sm text-gray-600 text-center max-w-md">
              It looks like you haven&apos;t placed any orders yet.
            </p>
            <Button asChild className="mt-6">
              <Link href="/">Browse Products</Link>
            </Button>
          </div>
        )}
      </Container>

      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        orderId={selectedOrder}
        onSuccess={onReportSuccess}
      />
    </div>
  );
};

export default OrdersPage;
