"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import PriceFormatter from "./PriceFormatter";
import { Button } from "./ui/button";
import Link from "next/link";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
  table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableCol: { width: "33.33%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableCell: { margin: 5, fontSize: 10 },
});

const MyDocument = ({ order }: { order: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Order Details - {order?.order_number}</Text>
        <Text>Customer: {order?.customer_name}</Text>
        <Text>Email: {order?.customer_email}</Text>
        <Text>Date: {new Date(order?.order_date).toLocaleDateString()}</Text>
        <Text>Status: {order?.status}</Text>
        <Text>Invoice Number: {order?.invoice_number}</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Product</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Quantity</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Price</Text></View>
        </View>
        {order?.items?.map((item: any, index: number) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.product_name}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.quantity}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.unit_price}</Text></View>
          </View>
        ))}
      </View>
      <View style={styles.section}>
        <Text>Subtotal: {order?.subtotal}</Text>
        <Text>Discount: {order?.discount}</Text>
        <Text>Total: {order?.total_price}</Text>
      </View>
    </Page>
  </Document>
);

const OrderDetailsDialog = ({
  order,
  open,
  onClose,
}: {
  order: any;
  open: boolean;
  onClose: () => void;
}) => {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  console.log(order)
  if (!order) return null;

  const handleRateSubmit = async () => {
    try {
      await fetch(`http://127.0.0.1:8000/api/ratings/`, {
        method: "POST",
        body: JSON.stringify({
          productId: order?.product_id,
          orderItemId: order?.order_item_id,  // تأكد من أن الـ order_item_id يتم إرساله هنا
          rating,
          review,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Thank you for your rating!");
      onClose();  // إغلاق النافذة بعد تقديم التقييم
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-scroll bg-white">
        <DialogHeader>
          <DialogTitle>Order Details - {order?.order_number}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-1 text-sm">
          <p><strong>Customer:</strong> {order?.customer_name}</p>
          <p><strong>Email:</strong> {order?.customer_email}</p>
          <p><strong>Date:</strong> {new Date(order?.order_date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span className="capitalize text-green-600 font-medium">{order?.status}</span></p>
          <p><strong>Invoice Number:</strong> {order?.invoice_number}</p>
        </div>

        {order?.invoice?.hosted_invoice_url && (
          <Button className="mt-4" variant="outline">
            <Link href={order.invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
              Download Invoice
            </Link>
          </Button>
        )}

        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order?.items?.map((item: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{item.product_name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <PriceFormatter amount={item.unit_price} className="text-black font-medium" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {order?.status === "delivered" && (
          <div className="mt-4">
            <h4 className="font-semibold">Rate Your Order</h4>
            <div>
              <label>Rating (1-5):</label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                min="1"
                max="5"
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label>Review:</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <button onClick={handleRateSubmit} className="mt-2 bg-blue-500 text-white p-2 rounded">
              Submit Rating
            </button>
          </div>
        )}

        <div className="mt-6">
          <PDFDownloadLink
            document={<MyDocument order={order} />}
            fileName={`order_${order?.order_number}.pdf`}
          >
            {({ loading }) =>
              loading ? (
                <Button disabled>Generating PDF...</Button>
              ) : (
                <Button variant="default">Download PDF</Button>
              )
            }
          </PDFDownloadLink>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
