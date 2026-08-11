import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  BadgeDollarSign,
  Boxes,
  CreditCard,
  Loader2,
  PackageCheck,
  PackagePlus,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { routes } from "@/app/router/paths";
import { useAuth } from "@/features/auth/context/auth-context";
import {
  getAdminDashboard,
  type AdminDashboard,
  type AdminKpi,
  type AdminRecentOrder,
  type AdminTopProduct,
} from "@/features/admin/api/dashboard-service";
import styles from "./AdminDashboardPage.module.css";

const KPI_ICONS: Record<string, LucideIcon> = {
  net_sales: BadgeDollarSign,
  orders: ReceiptText,
  average_order_value: WalletCards,
  items_sold: PackageCheck,
  products: Boxes,
  customers: Users,
};

const PRIMARY_KPI_KEYS = ["net_sales", "orders", "average_order_value"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatOrderId(value: string) {
  return `#${value.slice(0, 8).toUpperCase()}`;
}

function formatProvider(value: string) {
  if (!value) return "Checkout";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function statusClass(status: string) {
  if (status === "approved") return styles.statusApproved;
  if (status === "pending") return styles.statusPending;
  if (status === "rejected") return styles.statusRejected;
  if (status === "cancelled") return styles.statusCancelled;
  if (status === "refunded") return styles.statusRefunded;
  return styles.statusOther;
}

function orderMatchesSearch(order: AdminRecentOrder, search: string) {
  const value = search.toLowerCase();
  return (
    order.order_id.toLowerCase().includes(value) ||
    order.customer.toLowerCase().includes(value) ||
    order.customer_email.toLowerCase().includes(value) ||
    order.summary.toLowerCase().includes(value) ||
    order.status_label.toLowerCase().includes(value) ||
    order.provider.toLowerCase().includes(value)
  );
}

function productMatchesSearch(product: AdminTopProduct, search: string) {
  const value = search.toLowerCase();
  return (
    product.name.toLowerCase().includes(value) ||
    (product.slug ?? "").toLowerCase().includes(value)
  );
}

function KpiCard({ item }: { item: AdminKpi }) {
  const Icon = KPI_ICONS[item.key] ?? TrendingUp;

  return (
    <article className={styles.kpiCard}>
      <div className={styles.kpiIconWrap}>
        <Icon className={styles.kpiIcon} />
      </div>
      <div className={styles.kpiContent}>
        <p className={styles.kpiValue}>{item.value}</p>
        <p className={styles.kpiTitle}>{item.title}</p>
        <p className={styles.kpiDetail}>{item.detail}</p>
      </div>
    </article>
  );
}

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadDashboard = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      setDashboard(await getAdminDashboard());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível carregar o dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const normalizedSearch = searchTerm.trim();
  const overview = dashboard?.sales_overview;
  const chartData = dashboard?.monthly_revenue ?? [];
  const maxMonthlyValue = useMemo(
    () =>
      Math.max(
        0,
        ...chartData.flatMap((item) => [
          item.current_year,
          item.previous_year,
          item.refunded_total,
        ])
      ),
    [chartData]
  );
  const hasMonthlyData = maxMonthlyValue > 0;
  const filteredOrders = (dashboard?.recent_orders ?? []).filter((order) =>
    normalizedSearch ? orderMatchesSearch(order, normalizedSearch) : true
  );
  const filteredTopProducts = (dashboard?.top_products ?? []).filter((product) =>
    normalizedSearch ? productMatchesSearch(product, normalizedSearch) : true
  );
  const allKpis = dashboard?.kpis ?? [];
  const prioritizedKpis = PRIMARY_KPI_KEYS.flatMap((key) => {
    const item = allKpis.find((kpi) => kpi.key === key);
    return item ? [item] : [];
  });
  const fallbackKpis = allKpis.filter((item) => !PRIMARY_KPI_KEYS.includes(item.key));
  const primaryKpis = [...prioritizedKpis, ...fallbackKpis].slice(0, 3);
  const primaryKpiKeys = new Set(primaryKpis.map((item) => item.key));
  const secondaryKpis = allKpis.filter((item) => !primaryKpiKeys.has(item.key));
  const userInitial = (user?.name ?? user?.email ?? "A").charAt(0).toUpperCase();

  const getBarHeight = (value: number) => {
    if (!hasMonthlyData || value <= 0) return "0%";
    return `${Math.max((value / maxMonthlyValue) * 100, 6)}%`;
  };

  return (
    <section className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topTitleBlock}>
          <p className={styles.topEyebrow}>Ecommerce</p>
          <h1 className={styles.topTitle}>Vendas e pedidos</h1>
          <p className={styles.topSubtitle}>
            Painel conectado ao checkout, pagamentos, itens vendidos e catálogo.
          </p>
          {dashboard?.generated_at && (
            <p className={styles.updatedAt}>
              Atualizado em {formatDateTime(dashboard.generated_at)}
            </p>
          )}
        </div>

        <div className={styles.topSearch}>
          <Search className={styles.searchIcon} />
          <Input
            className={styles.searchInput}
            placeholder="Filtrar por pedido, cliente, status ou produto"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className={styles.topActions}>
          <Button asChild size="sm" className={styles.primaryAction}>
            <Link to={routes.productCreate}>
              <PackagePlus className={styles.actionIcon} />
              Cadastrar produto
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className={styles.secondaryAction}>
            <Link to={routes.home}>
              <Store className={styles.actionIcon} />
              Ver loja
            </Link>
          </Button>
          <div className={styles.profileCard}>
            <div className={styles.profileAvatar}>{userInitial}</div>
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{user?.name ?? "Administrador"}</p>
              <p className={styles.profileRole}>Admin</p>
            </div>
          </div>
        </div>
      </header>

      {errorMessage && (
        <div className={styles.errorState}>
          <AlertCircle className={styles.stateIcon} />
          <span>{errorMessage}</span>
          <Button type="button" size="sm" variant="outline" onClick={loadDashboard}>
            <RefreshCw className={styles.actionIcon} />
            Tentar novamente
          </Button>
        </div>
      )}

      {isLoading && !dashboard ? (
        <div className={styles.loadingState}>
          <Loader2 className={styles.spinnerIcon} />
          Carregando dashboard de ecommerce...
        </div>
      ) : (
        <>
          <section className={styles.kpiGrid}>
            {primaryKpis.map((item) => (
              <KpiCard key={item.key} item={item} />
            ))}
          </section>

          {secondaryKpis.length > 0 && (
            <section className={styles.secondaryKpiPanel} aria-label="Métricas secundárias">
              <span className={styles.secondaryKpiLabel}>Menos prioritárias</span>
              <div className={styles.secondaryKpiList}>
                {secondaryKpis.map((item) => (
                  <div key={item.key} className={styles.secondaryKpiItem}>
                    <span>{item.title}</span>
                    <strong>{item.value}</strong>
                    <small>{item.detail}</small>
                  </div>
                ))}
              </div>
            </section>
          )}

          {overview && (
            <section className={styles.overviewGrid}>
              <article className={`${styles.panel} ${styles.salesPanel}`}>
                <div className={styles.panelHeader}>
                  <div>
                    <h2 className={styles.panelTitle}>Resumo financeiro</h2>
                    <p className={styles.panelSubtitle}>
                      Receita paga, reembolsos e ticket médio dos pedidos.
                    </p>
                  </div>
                  <div className={styles.panelIconWrap}>
                    <CreditCard className={styles.panelIcon} />
                  </div>
                </div>

                <div className={styles.netSalesBlock}>
                  <span>Vendas líquidas</span>
                  <strong>{formatCurrency(overview.net_sales)}</strong>
                </div>

                <div className={styles.moneyGrid}>
                  <div className={styles.moneyMetric}>
                    <span>Pagas</span>
                    <strong>{formatCurrency(overview.gross_sales)}</strong>
                    <small>{overview.paid_orders} pedidos</small>
                  </div>
                  <div className={styles.moneyMetric}>
                    <span>Reembolsadas</span>
                    <strong>{formatCurrency(overview.refunded_sales)}</strong>
                    <small>{overview.refunded_orders} pedidos</small>
                  </div>
                  <div className={styles.moneyMetric}>
                    <span>Pendentes</span>
                    <strong>{formatCurrency(overview.pending_sales)}</strong>
                    <small>{overview.pending_orders} pedidos</small>
                  </div>
                  <div className={styles.moneyMetric}>
                    <span>Ticket médio</span>
                    <strong>{formatCurrency(overview.average_order_value)}</strong>
                    <small>somente pagos</small>
                  </div>
                </div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <h2 className={styles.panelTitle}>Status dos pedidos</h2>
                    <p className={styles.panelSubtitle}>
                      Separação de pagos, pendentes, recusados e reembolsados.
                    </p>
                  </div>
                  <div className={styles.panelIconWrap}>
                    <RotateCcw className={styles.panelIcon} />
                  </div>
                </div>

                {(dashboard?.status_distribution ?? []).length === 0 ? (
                  <div className={styles.emptyState}>Nenhum pagamento registrado.</div>
                ) : (
                  <div className={styles.statusList}>
                    {(dashboard?.status_distribution ?? []).map((item) => (
                      <div key={item.status} className={styles.statusItem}>
                        <div className={styles.statusMeta}>
                          <span>{item.label}</span>
                          <strong>{item.count}</strong>
                        </div>
                        <div className={styles.statusDetail}>
                          <span>{formatCurrency(item.amount)}</span>
                          <span>{item.percent}%</span>
                        </div>
                        <div className={styles.statusTrack}>
                          <span
                            className={`${styles.statusFill} ${statusClass(item.status)}`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </section>
          )}

          <section className={styles.chartGrid}>
            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Vendas por mês</h2>
                  <p className={styles.panelSubtitle}>
                    Receita paga, comparação com ano anterior e reembolsos.
                  </p>
                </div>
                <div className={styles.legendRow}>
                  <span className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.legendCurrent}`} />
                    Ano atual
                  </span>
                  <span className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.legendPrevious}`} />
                    Ano anterior
                  </span>
                  <span className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.legendRefunded}`} />
                    Reembolso
                  </span>
                </div>
              </div>

              <div className={styles.monthlyChart}>
                {hasMonthlyData ? (
                  chartData.map((month) => (
                    <div key={month.label} className={styles.monthColumn}>
                      <div className={styles.monthBars}>
                        <span
                          className={`${styles.monthBar} ${styles.currentBar}`}
                          style={{ height: getBarHeight(month.current_year) }}
                          title={`${month.label}: ${formatCurrency(month.current_year)}`}
                        />
                        <span
                          className={`${styles.monthBar} ${styles.previousBar}`}
                          style={{ height: getBarHeight(month.previous_year) }}
                          title={`${month.label} anterior: ${formatCurrency(month.previous_year)}`}
                        />
                        <span
                          className={`${styles.monthBar} ${styles.refundBar}`}
                          style={{ height: getBarHeight(month.refunded_total) }}
                          title={`${month.label} reembolsado: ${formatCurrency(month.refunded_total)}`}
                        />
                      </div>
                      <span className={styles.monthLabel}>{month.label}</span>
                      <span className={styles.monthOrders}>{month.current_orders} pedidos</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyChart}>Sem vendas pagas ainda.</div>
                )}
              </div>
            </article>
          </section>

          <section className={styles.bottomGrid}>
            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Pedidos</h2>
                  <p className={styles.panelSubtitle}>
                    Últimos checkouts registrados, com status e composição do pedido.
                  </p>
                </div>
                <div className={styles.tableCount}>{filteredOrders.length}</div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className={styles.emptyState}>Nenhum pedido encontrado.</div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Itens</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <strong>{formatOrderId(order.order_id)}</strong>
                            <span>{formatProvider(order.provider)}</span>
                          </td>
                          <td>
                            <strong>{order.customer}</strong>
                            <span>{order.customer_email}</span>
                          </td>
                          <td>
                            <strong>{order.summary}</strong>
                            <span>{order.items_count} itens</span>
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${statusClass(order.status)}`}>
                              {order.status_label}
                            </span>
                          </td>
                          <td className={styles.amountCell}>{formatCurrency(order.total)}</td>
                          <td>{formatDate(order.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Produtos mais vendidos</h2>
                  <p className={styles.panelSubtitle}>
                    Ranking por unidades em pedidos pagos.
                  </p>
                </div>
                <div className={styles.panelIconWrap}>
                  <ShoppingBag className={styles.panelIcon} />
                </div>
              </div>

              {filteredTopProducts.length === 0 ? (
                <div className={styles.emptyState}>Nenhum produto vendido ainda.</div>
              ) : (
                <div className={styles.topList}>
                  {filteredTopProducts.map((item, index) => (
                    <div key={item.product_id ?? item.name} className={styles.topItem}>
                      <div className={styles.rankBadge}>{index + 1}</div>
                      <div className={styles.topContent}>
                        <div className={styles.topItemMeta}>
                          <div>
                            <strong>{item.name}</strong>
                            {item.slug && <span>/produto/{item.slug}</span>}
                          </div>
                          <strong>{item.quantity} un.</strong>
                        </div>
                        <div className={styles.topTrack}>
                          <span
                            className={styles.topFill}
                            style={{ width: `${Math.max(item.percent, 6)}%` }}
                          />
                        </div>
                        <div className={styles.productMetrics}>
                          <span>{formatCurrency(item.revenue)}</span>
                          <span>{item.orders_count} pedidos</span>
                          <span>{formatCurrency(item.average_unit_price)} médio</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </section>
  );
}
