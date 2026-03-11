import { Link } from "react-router-dom";
import {
  Bell,
  Boxes,
  DollarSign,
  Search,
  Settings2,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useAuth } from "@/shared/contexts/auth-context";
import { routes } from "@/shared/lib/routes";
import styles from "./AdminDashboardPage.module.css";

const kpis = [
  { title: "Total clientes", value: "2000+", detail: "base ativa", icon: Users },
  { title: "Total produtos", value: "140+", detail: "catálogo vivo", icon: Boxes },
  { title: "Total pedidos", value: "1600+", detail: "este ano", icon: ShoppingBag },
  { title: "Total vendas", value: "R$ 320K", detail: "faturamento", icon: DollarSign },
] as const;

const orders = [
  {
    product: "Serum Glow",
    id: "#202394",
    customer: "Ripan Ahmad",
    date: "1 Jan 24",
    price: "R$ 120",
    status: "Completo",
  },
  {
    product: "Body Oil",
    id: "#202395",
    customer: "Darene Robertson",
    date: "2 Jan 24",
    price: "R$ 190",
    status: "A caminho",
  },
  {
    product: "Lip Tint",
    id: "#202396",
    customer: "Leslie Alexander",
    date: "3 Jan 24",
    price: "R$ 60",
    status: "Completo",
  },
  {
    product: "Face Wash",
    id: "#202397",
    customer: "Ralph Edwards",
    date: "4 Jan 24",
    price: "R$ 80",
    status: "Pendente",
  },
  {
    product: "Hair Mask",
    id: "#202398",
    customer: "Ronald Richards",
    date: "6 Jan 24",
    price: "R$ 150",
    status: "Pendente",
  },
] as const;

const topItems = [
  { name: "Serum", value: 79 },
  { name: "Jacket", value: 90 },
  { name: "Sweater", value: 60 },
  { name: "T-Shirt", value: 80 },
  { name: "Cap", value: 50 },
] as const;

const productViews = [
  { day: "Mon", current: 4.2, last: 6.2 },
  { day: "Tue", current: 5.5, last: 4.5 },
  { day: "Wed", current: 6.4, last: 5.8 },
  { day: "Thu", current: 8.4, last: 6.1 },
  { day: "Fri", current: 7.1, last: 7.4 },
  { day: "Sat", current: 8.9, last: 6.8 },
] as const;

const salesLine = {
  current: [20, 28, 17, 26, 31, 45, 48, 43, 52, 49, 41, 44],
  previous: [15, 21, 19, 23, 27, 32, 37, 29, 35, 30, 18, 22],
};

function pointsToPath(values: number[], width: number, height: number) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const padding = 8;
  const chartHeight = height - padding * 2;
  const step = width / (values.length - 1);

  return values
    .map((value, index) => {
      const normalized = max === min ? 0.5 : (value - min) / (max - min);
      const x = index * step;
      const y = height - padding - normalized * chartHeight;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function statusClass(status: string) {
  if (status === "Completo") return styles.statusComplete;
  if (status === "A caminho") return styles.statusShipping;
  return styles.statusPending;
}

export function AdminDashboardPage() {
  const { user } = useAuth();
  const currentPath = pointsToPath(salesLine.current, 620, 220);
  const previousPath = pointsToPath(salesLine.previous, 620, 220);

  return (
    <section className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topTitleBlock}>
          <p className={styles.topEyebrow}>Painel</p>
          <h1 className={styles.topTitle}>Dashboard E-commerce</h1>
        </div>

        <div className={styles.topSearch}>
          <Search className={styles.searchIcon} />
          <Input
            className={styles.searchInput}
            placeholder="Buscar produtos, clientes ou pedidos"
          />
        </div>

        <div className={styles.topActions}>
          <button type="button" className={styles.iconButton} aria-label="Notificações">
            <Bell className={styles.iconAction} />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Configurações">
            <Settings2 className={styles.iconAction} />
          </button>
          <div className={styles.profileCard}>
            <div className={styles.profileAvatar}>{(user?.name ?? "A").charAt(0)}</div>
            <div>
              <p className={styles.profileName}>{user?.name ?? "Robert Fox"}</p>
              <p className={styles.profileRole}>Admin</p>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.kpiGrid}>
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className={styles.kpiCard}>
              <div className={styles.kpiIconWrap}>
                <Icon className={styles.kpiIcon} />
              </div>
              <div>
                <p className={styles.kpiValue}>{item.value}</p>
                <p className={styles.kpiTitle}>{item.title}</p>
                <p className={styles.kpiDetail}>{item.detail}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className={styles.chartGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Sales Trend</h2>
            <div className={styles.legendRow}>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendCurrent}`} />
                Current year
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendPrevious}`} />
                Last year
              </span>
            </div>
          </div>

          <div className={styles.lineChartWrap}>
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
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Product Views</h2>
            <div className={styles.legendRow}>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendCurrent}`} />
                This week
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendPrevious}`} />
                Last week
              </span>
            </div>
          </div>

          <div className={styles.barChart}>
            {productViews.map((item) => (
              <div key={item.day} className={styles.barGroup}>
                <div className={styles.barPair}>
                  <span
                    className={`${styles.bar} ${styles.barCurrent}`}
                    style={{ height: `${item.current * 11}px` }}
                  />
                  <span
                    className={`${styles.bar} ${styles.barPrevious}`}
                    style={{ height: `${item.last * 11}px` }}
                  />
                </div>
                <span className={styles.barLabel}>{item.day}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.bottomGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>All Orders</h2>
            <Button asChild size="sm" variant="ghost" className={styles.linkButton}>
              <Link to={routes.productCreate}>Cadastrar produto</Link>
            </Button>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.product}</td>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.date}</td>
                    <td>{order.price}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Top Sold Items</h2>
            <Button asChild size="sm" variant="ghost" className={styles.linkButton}>
              <Link to={routes.home}>
                <Store className={styles.storeIcon} />
                Ver loja
              </Link>
            </Button>
          </div>

          <div className={styles.topList}>
            {topItems.map((item) => (
              <div key={item.name} className={styles.topItem}>
                <div className={styles.topItemMeta}>
                  <span>{item.name}</span>
                  <strong>{item.value}%</strong>
                </div>
                <div className={styles.topTrack}>
                  <span className={styles.topFill} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.footerHint}>
            <TrendingUp className={styles.footerHintIcon} />
            Desempenho mensal com aumento de 12%
          </div>
        </article>
      </section>
    </section>
  );
}
