import { apiRequest } from "@/shared/api/api-client";

export type AdminKpi = {
  key: string;
  title: string;
  value: string;
  detail: string;
};

export type AdminMonthlyRevenue = {
  label: string;
  current_year: number;
  previous_year: number;
  current_orders: number;
  refunded_total: number;
};

export type AdminStatusDistribution = {
  status: string;
  label: string;
  count: number;
  amount: number;
  percent: number;
};

export type AdminRecentOrder = {
  id: string;
  order_id: string;
  customer: string;
  customer_email: string;
  date: string;
  total: number;
  status: string;
  status_label: string;
  provider: string;
  items_count: number;
  summary: string;
};

export type AdminTopProduct = {
  product_id?: string | null;
  name: string;
  slug?: string | null;
  quantity: number;
  orders_count: number;
  revenue: number;
  average_unit_price: number;
  percent: number;
  last_sale_at?: string | null;
};

export type AdminSalesOverview = {
  gross_sales: number;
  net_sales: number;
  refunded_sales: number;
  pending_sales: number;
  average_order_value: number;
  total_orders: number;
  paid_orders: number;
  refunded_orders: number;
  pending_orders: number;
  rejected_orders: number;
  cancelled_orders: number;
  items_sold: number;
};

export type AdminDashboard = {
  generated_at: string;
  kpis: AdminKpi[];
  sales_overview: AdminSalesOverview;
  monthly_revenue: AdminMonthlyRevenue[];
  status_distribution: AdminStatusDistribution[];
  recent_orders: AdminRecentOrder[];
  top_products: AdminTopProduct[];
};

export function getAdminDashboard() {
  return apiRequest<AdminDashboard>("/admin/dashboard");
}
