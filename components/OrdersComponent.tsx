"use client";

import React, { useCallback, useEffect, useState } from "react";
import { TableBody, TableCell, TableRow } from "./ui/table";
import PriceFormatter from "./PriceFormatter";
import OrderDetailsDialog from "./OrderDetailsDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import RateOrderModal from "./RateOrderModal";

const OrdersComponent = ({
  onOrdersLoaded,
  onReportClick,
}: {
  onOrdersLoaded?: (hasOrders: boolean) => void;
  onReportClick?: (orderId: string, onReportSuccess: () => void) => void;
}) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [reportedOrders, setReportedOrders] = useState<string[]>([]);
const [ratedOrders, setRatedOrders] = useState<string[]>([]);

useEffect(() => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("ratedOrders");
    if (stored) {
      setRatedOrders(JSON.parse(stored));
    }
  }
}, []);

  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const router = useRouter();

  const userEmail =
    typeof window !== "undefined" ? localStorage.getItem("email") : "";

  const refreshOrders = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    const localReported = JSON.parse(
      localStorage.getItem("reportedOrders") || "[]"
    );
    setReportedOrders(localReported);

    const fetchOrders = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/order/api/orders/");
        const data = await res.json();
        const filtered = data.orders.filter(
          (order: any) => order.customer_email === userEmail
        );
        setOrders(filtered);
        onOrdersLoaded?.(filtered.length > 0);
      } catch (error) {
        console.error("❌ Error fetching orders:", error);
        onOrdersLoaded?.(false);
      }
    };

    if (userEmail) fetchOrders();
  }, [userEmail]);

  const handleDeleteOrder = async (
    orderId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    if (!confirm("Are you sure you want to delete this order?")) return;

    setIsDeleting(orderId);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/order/api/orders/delete/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete order");
      }

      toast.success("Order deleted successfully");
      const updated = orders.filter(
        (order) => order.order_number !== orderId
      );
      setOrders(updated);
      onOrdersLoaded?.(updated.length > 0);
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRateClick = (order: any) => {
    setSelectedOrder(order);
    setIsRatingModalOpen(true);
  };

  const handleRatingSuccess = (orderId: string) => {
    const updatedRated = [...ratedOrders, orderId];
    setRatedOrders(updatedRated);
    localStorage.setItem("ratedOrders", JSON.stringify(updatedRated));
  };
const handleOrderRated = (orderNumber: string) => {
  const updatedRated = [...new Set([...ratedOrders, orderNumber])];
  setRatedOrders(updatedRated);
  localStorage.setItem("ratedOrders", JSON.stringify(updatedRated));
};


  return (
    <>
      <TableBody>
        <TooltipProvider>
          {orders.map((order, index) => {
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <TableRow
                    className="cursor-pointer hover:bg-gray-100 h-12"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest("button")) return;
                      setSelectedOrder(order);
                    }}
                  >
                    <TableCell className="font-medium">
                      {order.order_number}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(new Date(order.order_date), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {order.customer_email}
                    </TableCell>
                    <TableCell>
                      <PriceFormatter
                        amount={parseFloat(order.total_price)}
                        className="text-black font-medium"
                      />
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>

                    <TableCell className="flex gap-1 items-center">
                      {!reportedOrders.includes(order.order_number) ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReportClick?.(order.order_number, () => {
                              const updated = [
                                ...reportedOrders,
                                order.order_number,
                              ];
                              setReportedOrders(updated);
                              localStorage.setItem(
                                "reportedOrders",
                                JSON.stringify(updated)
                              );
                            });
                          }}
                        >
                          Report
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-500 italic">
                          تم الإبلاغ
                        </span>
                      )}

                      
                    </TableCell>
                    <TableCell>
                      {order.can_rate &&
                        (!ratedOrders.includes(order.order_number) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRateClick(order);
                            }}
                          >
                            Rate Order
                          </Button>
                        ) : (
                          <span className="text-sm text-green-600 italic">
                            تم التقييم
                          </span>
                        ))}
                    </TableCell>
                  </TableRow>
                </TooltipTrigger>
                <TooltipContent className="text-white font-medium">
                  <p>Click to see order details</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </TableBody>

      <OrderDetailsDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <RateOrderModal
        open={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        order={selectedOrder}
        onRated={handleOrderRated}
        onSuccess={() => {
          if (selectedOrder) {
            handleRatingSuccess(selectedOrder.order_number);
          }
          setIsRatingModalOpen(false);
        }}
      />
    </>
  );
};

export default OrdersComponent;
