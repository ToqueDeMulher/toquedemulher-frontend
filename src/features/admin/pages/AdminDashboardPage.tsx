import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Boxes,
  DollarSign,
  Loader2,
  PackagePlus,
  RefreshCw,
  Search,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
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

const KPI_ICONS: Record<string, typeof Users> = {
  customers: Users,
  products: Boxes,
  orders: ShoppingBag,
  revenue: DollarSign,
};

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

function pointsToPath(values: number[], maxValue: number, width: number, height: number) {
  const padding = 12;
  const chartHeight = height - padding * 2;
  const step = width / Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      const normalized = maxValue > 0 ? value / maxValue : 0;
      const x = index * step;
      const y = height - padding - normalized * chartHeight;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
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
    order.summary.toLowerCase().includes(value) ||
    order.status_label.toLowerCase().includes(value)
  );
}

function productMatchesSearch(product: AdminTopProduct, search: string) {
  const value = search.toLowerCase();
  return product.name.toLowerCase().includes(value);
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

  const chartData = dashboard?.monthly_revenue ?? [];
  const maxRevenue = useMemo(
    () =>
      Math.max(
        0,
        ...chartData.flatMap((item) => [item.current_year, item.previous_year])
      ),
    [chartData]
  );
  const currentPath = pointsToPath(
    chartData.map((item) => item.current_year),
    maxRevenue,
    620,
    220
  );
  const previousPath = pointsToPath(
    chartData.map((item) => item.previous_year),
    maxRevenue,
    620,
    220
  );
  const hasRevenueData = maxRevenue > 0;
  const normalizedSearch = searchTerm.trim();
  const filteredOrders = (dashboard?.recent_orders ?? []).filter((order) =>
    normalizedSearch ? orderMatchesSearch(order, normalizedSearch) : true
  );
  const filteredTopProducts = (dashboard?.top_products ?? []).filter((product) =>
    normalizedSearch ? productMatchesSearch(product, normalizedSearch) : true
  );
  const userInitial = (user?.name ?? user?.email ?? "A").charAt(0).toUpperCase();

  return (
    <section className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topTitleBlock}>
          <p className={styles.topEyebrow}>Administração</p>
          <h1 className={styles.topTitle}>Dashboard</h1>
          <p className={styles.topSubtitle}>
            Operação da loja com dados reais de clientes, produtos e pedidos.
          </p>
        </div>

        <div className={styles.topSearch}>
          <Search className={styles.searchIcon} />
          <Input
            className={styles.searchInput}
            placeholder="Filtrar pedidos e produtos"
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
          Carregando dashboard...
        </div>
      ) : (
        <>
          <section className={styles.kpiGrid}>
            {(dashboard?.kpis ?? []).map((item) => (
              <KpiCard key={item.key} item={item} />
            ))}
          </section>

          <section className={styles.chartGrid}>
            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Receita mensal</h2>
                  <p className={styles.panelSubtitle}>
                    Pagamentos aprovados por mês.
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
                </div>
              </div>

              <div className={styles.lineChartWrap}>
                {hasRevenueData ? (
                  <svg viewBox="0 0 620 220" className={styles.lineChart} aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((row) => (
                      <line
                        key={row}
                        x1="0"
                        y1={20 + row * 45}
                        x2="620"
                        y2={20 + row * 45}
                        className={styles.gridLine}
                      />
                    ))}
                    <path d={previousPath} className={styles.prevLine} />
                    <path d={currentPath} className={styles.currentLine} />
                  </svg>
                ) : (
                  <div className={styles.emptyChart}>Sem receita aprovada ainda.</div>
                )}
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Status dos pedidos</h2>
                  <p className={styles.panelSubtitle}>
                    Distribuição dos pagamentos registrados.
                  </p>
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

          <section className={styles.bottomGrid}>
            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>Pedidos recentes</h2>
                  <p className={styles.panelSubtitle}>
                    Últimos pagamentos registrados no checkout.
                  </p>
                </div>
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
                        <th>Data</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.order_id.slice(0, 8).toUpperCase()}</td>
                          <td>{order.customer}</td>
                          <td>{order.summary}</td>
                          <td>{formatDate(order.date)}</td>
                          <td>{formatCurrency(order.total)}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${statusClass(order.status)}`}>
                              {order.status_label}
                            </span>
                          </td>
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
                    Ranking por quantidade aprovada.
                  </p>
                </div>
              </div>

              {filteredTopProducts.length === 0 ? (
                <div className={styles.emptyState}>Nenhum produto vendido ainda.</div>
              ) : (
                <div className={styles.topList}>
                  {filteredTopProducts.map((item) => (
                    <div key={item.product_id ?? item.name} className={styles.topItem}>
                      <div className={styles.topItemMeta}>
                        <span>{item.name}</span>
                        <strong>{item.quantity} un.</strong>
                      </div>
                      <div className={styles.topTrack}>
                        <span className={styles.topFill} style={{ width: `${item.percent}%` }} />
                      </div>
                      <p className={styles.topRevenue}>{formatCurrency(item.revenue)}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.footerHint}>
                <TrendingUp className={styles.footerHintIcon} />
                Atualizado a partir dos pagamentos aprovados.
              </div>
            </article>
          </section>
        </>
      )}
    </section>
  );
}
