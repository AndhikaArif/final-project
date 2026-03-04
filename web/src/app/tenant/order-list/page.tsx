import OrderListSaaS, { type Order } from "@/components/tenant-order-list-saas";

export default function OrderPage() {
  const orders: Order[] = [
    {
      id: "ORD-001",
      customerName: "Akmal",
      total: 1200000,
      status: "PAID",
      createdAt: "2026-02-25",
    },
    {
      id: "ORD-002",
      customerName: "Budi",
      total: 850000,
      status: "WAITING_PAYMENT",
      createdAt: "2026-02-26",
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <OrderListSaaS orders={orders} />
    </div>
  );
}
