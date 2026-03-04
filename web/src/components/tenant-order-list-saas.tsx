"use client";

import { useState } from "react";

export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: "WAITING_PAYMENT" | "REJECTED" | "EXPIRED" | "PAID" | "CANCELLED";
  createdAt: string;
}

interface Props {
  orders: Order[];
}

export default function OrderListSaaS({ orders }: Props) {
  const [orderList, setOrderList] = useState<Order[]>(orders);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orderList.filter((order) => {
    const matchSearch =
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase());

    const matchStatus = filterStatus === "ALL" || order.status === filterStatus;

    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";

      case "WAITING_PAYMENT":
        return "bg-yellow-100 text-yellow-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      case "REJECTED":
        return "bg-purple-100 text-purple-700";

      case "EXPIRED":
        return "bg-gray-200 text-gray-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const updateStatus = (
    id: string,
    newStatus: "PAID" | "CANCELLED" | "REJECTED",
  ) => {
    setOrderList((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order,
      ),
    );

    setSelectedOrder(null);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-black">Order List</h2>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500 focus:ring-2 focus:ring-sky-500 outline-none"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-500 focus:ring-2 focus:ring-sky-500 outline-none"
            >
              <option value="ALL">All</option>
              <option value="PAID">Paid</option>
              <option value="WAITING_PAYMENT">Waiting</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-3">Nomor</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Date</th>
                <th className="py-3">Total</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order, index) => (
                <tr key={order.id} className="hover:bg-gray-50 text-gray-600">
                  <td className="py-4 font-medium">{index + 1}</td>
                  <td className="py-4">{order.customerName}</td>
                  <td className="py-4">
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="py-4 font-medium">
                    Rp {order.total.toLocaleString("id-ID")}
                  </td>
                  <td className="py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-800 hover:cursor-pointer text-sm font-medium"
                    >
                      View Detail →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden space-y-4">
          {filteredOrders.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              No orders found
            </div>
          )}

          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-100 rounded-xl p-4 shadow-sm bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {order.customerName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                    order.status,
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <p>
                  <span className="text-gray-400">Order ID:</span> {order.id}
                </p>
                <p className="font-medium">
                  Rp {order.total.toLocaleString("id-ID")}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(order)}
                className="w-full text-center bg-gray-50 hover:bg-gray-100 text-sm py-2 rounded-lg font-medium text-blue-600"
              >
                View Detail
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fadeIn">
            <h3 className="text-lg font-semibold mb-4">Order Detail</h3>

            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>ID:</strong> {selectedOrder.id}
              </p>
              <p>
                <strong>Customer:</strong> {selectedOrder.customerName}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selectedOrder.createdAt).toLocaleDateString("id-ID")}
              </p>
              <p>
                <strong>Total:</strong> Rp{" "}
                {selectedOrder.total.toLocaleString("id-ID")}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(
                    selectedOrder.status,
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200"
              >
                Close
              </button>

              {selectedOrder.status === "WAITING_PAYMENT" && (
                <>
                  <button
                    onClick={() => updateStatus(selectedOrder.id, "REJECTED")}
                    className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => updateStatus(selectedOrder.id, "CANCELLED")}
                    className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => updateStatus(selectedOrder.id, "PAID")}
                    className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    Acc
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
