import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Boxes,
  LogOut,
  PackagePlus,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useAuth } from "@/shared/contexts/auth-context";
import { routes } from "@/shared/lib/routes";
import styles from "./AdminDashboardPage.module.css";

const metrics = [
  {
    title: "Pedidos hoje",
    value: "128",
    detail: "+14% vs ontem",
    icon: ShoppingBag,
  },
  {
    title: "Clientes ativos",
    value: "1.842",
    detail: "241 navegando agora",
    icon: Users,
  },
  {
    title: "Produtos publicados",
    value: "326",
    detail: "18 aguardando revisao",
    icon: Boxes,
  },
  {
    title: "Receita do dia",
    value: "R$ 18.450",
    detail: "Meta em 82%",
    icon: TrendingUp,
  },
] as const;

const recentOperations = [
  {
    id: "PED-1042",
    customer: "Marina Souza",
    status: "Pagamento aprovado",
    total: "R$ 249,90",
  },
  {
    id: "PED-1041",
    customer: "Juliana Costa",
    status: "Separando pedido",
    total: "R$ 118,00",
  },
  {
    id: "PED-1040",
    customer: "Aline Ribeiro",
    status: "Aguardando envio",
    total: "R$ 359,20",
  },
] as const;

const adminChecklist = [
  "Revisar 18 produtos com imagem pendente",
  "Confirmar estoque de itens com alta rotacao",
  "Acompanhar pedidos com atraso acima de 24h",
] as const;

export function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(routes.home);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <Badge className={styles.heroBadge}>Admin</Badge>
            <h1 className={styles.heroTitle}>Painel administrativo</h1>
            <p className={styles.heroText}>
              Uma visao operacional da loja para cadastrar produtos, acompanhar
              pedidos e agir rapido no que precisa de atencao.
            </p>

            <div className={styles.identityRow}>
              <div className={styles.identityCard}>
                <span className={styles.identityLabel}>Responsavel</span>
                <strong className={styles.identityValue}>
                  {user?.name ?? "Equipe Toque de Mulher"}
                </strong>
              </div>
              <div className={styles.identityCard}>
                <span className={styles.identityLabel}>Conta</span>
                <strong className={styles.identityValue}>
                  {user?.email ?? "admin@toquedemulher.com"}
                </strong>
              </div>
            </div>
          </div>

          <div className={styles.heroActions}>
            <Button asChild size="lg" className={styles.primaryAction}>
              <Link to={routes.productCreate}>
                <PackagePlus className={styles.actionIcon} />
                Novo produto
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className={styles.secondaryAction}
            >
              <Link to={routes.home}>
                <ShieldCheck className={styles.actionIcon} />
                Ver loja
              </Link>
            </Button>

            <Button
              size="lg"
              variant="ghost"
              className={styles.logoutAction}
              onClick={handleLogout}
            >
              <LogOut className={styles.actionIcon} />
              Sair
            </Button>
          </div>
        </section>

        <section className={styles.metricsGrid}>
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article key={metric.title} className={styles.metricCard}>
                <div className={styles.metricIconWrap}>
                  <Icon className={styles.metricIcon} />
                </div>
                <div>
                  <p className={styles.metricLabel}>{metric.title}</p>
                  <strong className={styles.metricValue}>{metric.value}</strong>
                  <p className={styles.metricDetail}>{metric.detail}</p>
                </div>
              </article>
            );
          })}
        </section>

        <div className={styles.contentGrid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelEyebrow}>Operacao</p>
                <h2 className={styles.panelTitle}>Pedidos recentes</h2>
              </div>
              <Badge className={styles.panelBadge}>Tempo real</Badge>
            </div>

            <div className={styles.operationList}>
              {recentOperations.map((order) => (
                <article key={order.id} className={styles.operationCard}>
                  <div>
                    <p className={styles.operationId}>{order.id}</p>
                    <p className={styles.operationCustomer}>{order.customer}</p>
                    <p className={styles.operationStatus}>{order.status}</p>
                  </div>
                  <div className={styles.operationMeta}>
                    <strong className={styles.operationTotal}>{order.total}</strong>
                    <span className={styles.operationLink}>
                      Ver detalhes
                      <ArrowRight className={styles.operationLinkIcon} />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelEyebrow}>Prioridades</p>
                <h2 className={styles.panelTitle}>Fila de acoes</h2>
              </div>
            </div>

            <div className={styles.checklist}>
              {adminChecklist.map((item) => (
                <div key={item} className={styles.checkItem}>
                  <span className={styles.checkBullet} />
                  <p className={styles.checkText}>{item}</p>
                </div>
              ))}
            </div>

            <div className={styles.quickLinks}>
              <Link to={routes.productCreate} className={styles.quickLink}>
                Cadastrar produto
                <ArrowRight className={styles.quickLinkIcon} />
              </Link>
              <Link to={routes.home} className={styles.quickLink}>
                Revisar vitrine publica
                <ArrowRight className={styles.quickLinkIcon} />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
