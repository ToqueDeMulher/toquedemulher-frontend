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
};

export type AdminStatusDistribution = {
  status: string;
  label: string;
  count: number;
  percent: number;
};

export type AdminRecentOrder = {
  id: string;
  order_id: string;
  customer: string;
  date: string;
  total: number;
  status: string;
  status_label: string;
  items_count: number;
  summary: string;
};

export type AdminTopProduct = {
  product_id?: string | null;
  name: string;
  quantity: number;
  revenue: number;
  percent: number;
};

export type AdminDashboard = {
  kpis: AdminKpi[];
  monthly_revenue: AdminMonthlyRevenue[];
  status_distribution: AdminStatusDistribution[];
  recent_orders: AdminRecentOrder[];
  top_products: AdminTopProduct[];
};

export function getAdminDashboard() {
  return apiRequest<AdminDashboard>("/admin/dashboard");
}
