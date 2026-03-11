import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  PackagePlus,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Toaster } from "@/shared/ui/sonner";
import { useAuth } from "@/shared/contexts/auth-context";
import { routes } from "@/shared/lib/routes";
import { useIsMobile } from "@/shared/ui/use-mobile";
import styles from "./AdminLayout.module.css";

const adminNavItems = [
  {
    to: routes.adminDashboard,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: routes.productCreate,
    label: "Cadastrar Produto",
    icon: PackagePlus,
  },
] as const;

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate(routes.home);
  };

  return (
    <div
      className={`${styles.shell} ${
        isSidebarOpen ? styles.shellSidebarOpen : styles.shellSidebarClosed
      }`}
    >
      {isMobile && isSidebarOpen && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Fechar menu lateral"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        <div className={styles.sidebarTopRow}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={styles.sidebarToggle}
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            aria-label={isSidebarOpen ? "Fechar sidebar" : "Abrir sidebar"}
          >
            {isSidebarOpen ? (
              isMobile ? (
                <X className={styles.toggleIcon} />
              ) : (
                <PanelLeftClose className={styles.toggleIcon} />
              )
            ) : (
              <PanelLeftOpen className={styles.toggleIcon} />
            )}
          </Button>
        </div>

        <div className={styles.brandBlock}>
          <Badge className={styles.brandBadge}>Admin</Badge>
          <h1
            className={`${styles.brandTitle} ${
              !isSidebarOpen ? styles.contentHidden : ""
            }`}
          >
            toque de mulher
          </h1>
          <p
            className={`${styles.brandText} ${
              !isSidebarOpen ? styles.contentHidden : ""
            }`}
          >
            Painel administrativo com atalhos para operação da loja.
          </p>
        </div>

        <div className={styles.accountCard}>
          <span
            className={`${styles.accountLabel} ${
              !isSidebarOpen ? styles.contentHidden : ""
            }`}
          >
            Sessão ativa
          </span>
          <strong
            className={`${styles.accountName} ${
              !isSidebarOpen ? styles.contentHidden : ""
            }`}
          >
            {user?.name ?? "Equipe Toque de Mulher"}
          </strong>
          <p
            className={`${styles.accountEmail} ${
              !isSidebarOpen ? styles.contentHidden : ""
            }`}
          >
            {user?.email ?? "admin@toquedemulher.com"}
          </p>
        </div>

        <nav className={styles.nav}>
          {adminNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === routes.adminDashboard}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ""} ${
                    !isSidebarOpen ? styles.navLinkCollapsed : ""
                  }`
                }
              >
                <Icon className={styles.navIcon} />
                <span
                  className={!isSidebarOpen ? styles.contentHidden : undefined}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.sidebarActions}>
          <Button
            asChild
            variant="outline"
            size="lg"
            className={`${styles.storeButton} ${
              !isSidebarOpen ? styles.actionButtonCollapsed : ""
            }`}
          >
            <NavLink to={routes.home}>
              <Store className={styles.actionIcon} />
              <span
                className={!isSidebarOpen ? styles.contentHidden : undefined}
              >
                Ver loja
              </span>
            </NavLink>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className={`${styles.logoutButton} ${
              !isSidebarOpen ? styles.actionButtonCollapsed : ""
            }`}
            onClick={handleLogout}
          >
            <LogOut className={styles.actionIcon} />
            <span className={!isSidebarOpen ? styles.contentHidden : undefined}>
              Sair
            </span>
          </Button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.mainInner}>
          <div className={styles.statusBar}>
            <div className={styles.statusTextWrap}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={styles.mainToggle}
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                aria-label={isSidebarOpen ? "Fechar sidebar" : "Abrir sidebar"}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className={styles.toggleIcon} />
                ) : (
                  <PanelLeftOpen className={styles.toggleIcon} />
                )}
              </Button>
              <ShieldCheck className={styles.statusIcon} />
              <span className={styles.statusText}>
                Área administrativa protegida
              </span>
            </div>
          </div>

          <Outlet />
        </div>
      </main>

      <Toaster position="top-right" richColors />
    </div>
  );
}
