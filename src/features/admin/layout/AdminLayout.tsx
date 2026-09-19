import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  PackagePlus,
  Store,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Toaster } from "@/shared/ui/sonner";
import { routes } from "@/app/router/paths";
import { useAuth } from "@/features/auth/context/auth-context";
import { useIsMobile } from "@/shared/ui/use-mobile";
import styles from "./AdminLayout.module.css";

const adminNavItems = [
  {
    to: routes.adminDashboard,
    label: "Visão geral",
    icon: LayoutDashboard,
  },
  {
    to: routes.productCreate,
    label: "Novo produto",
    icon: PackagePlus,
  },
  { to: routes.adminShipping, label: "Envios e etiquetas", icon: Truck },
] as const;

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentPage = adminNavItems.find((item) => item.to === location.pathname)?.label ?? "Gestão";
  const userInitial = (user?.name ?? user?.email ?? "A").charAt(0).toUpperCase();

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    document.body.classList.add("dark", "admin-theme-dark");
    return () => document.body.classList.remove("dark", "admin-theme-dark");
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile, location.pathname]);

  useEffect(() => {
    if (!isMobile || !isSidebarOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMobile, isSidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate(routes.home);
  };

  return (
    <div
      className={`dark ${styles.shell} ${
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
        aria-label="Navegação administrativa"
        inert={isMobile && !isSidebarOpen}
      >
        <div className={styles.sidebarTopRow}>
          <div className={styles.brandSymbol} aria-hidden="true">t<span>.</span></div>
          <span className={`${styles.brandWordmark} ${!isSidebarOpen ? styles.contentHidden : ""}`}>
            toque de mulher<span>.</span>
          </span>
          {isMobile && (
            <Button type="button" variant="ghost" size="icon" className={styles.sidebarToggle}
              onClick={() => setIsSidebarOpen(false)} aria-label="Fechar menu administrativo">
              <X className={styles.toggleIcon} />
            </Button>
          )}
        </div>

        <div className={styles.brandBlock}>
          <span className={`${styles.brandEyebrow} ${!isSidebarOpen ? styles.contentHidden : ""}`}>
            PAINEL DE GESTÃO
          </span>
          <p className={`${styles.brandText} ${!isSidebarOpen ? styles.contentHidden : ""}`}>
            Sua loja, em um só lugar.
          </p>
        </div>

        <nav className={styles.nav} aria-label="Seções do painel">
          <span className={`${styles.navHeading} ${!isSidebarOpen ? styles.contentHidden : ""}`}>
            OPERAÇÃO
          </span>
          {adminNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === routes.adminDashboard}
                title={!isSidebarOpen && !isMobile ? item.label : undefined}
                aria-label={item.label}
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
          <span className={`${styles.navHeading} ${styles.accountNavHeading} ${!isSidebarOpen ? styles.contentHidden : ""}`}>
            CONTA E LOJA
          </span>
          <NavLink
            to={routes.profile}
            title={!isSidebarOpen && !isMobile ? "Minha conta" : undefined}
            aria-label="Minha conta de cliente"
            className={`${styles.navLink} ${!isSidebarOpen ? styles.navLinkCollapsed : ""}`}
          >
            <UserRound className={styles.navIcon} />
            <span className={!isSidebarOpen ? styles.contentHidden : undefined}>Minha conta</span>
          </NavLink>
        </nav>

        <div className={styles.sidebarActions}>
          <div className={styles.accountCard}>
            <span className={styles.accountAvatar} aria-hidden="true">{userInitial}</span>
            <div className={`${styles.accountInfo} ${!isSidebarOpen ? styles.contentHidden : ""}`}>
              <strong className={styles.accountName}>{user?.name ?? "Administrador"}</strong>
              <span className={styles.accountEmail}>{user?.email ?? "Conta administradora"}</span>
            </div>
          </div>
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
              <span className={styles.breadcrumbRoot}>Admin</span>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.statusText}>{currentPage}</span>
            </div>
            <span className={styles.statusContext}>ÁREA ADMINISTRATIVA</span>
          </div>

          <Outlet />
        </div>
      </main>

      <Toaster position="top-right" richColors theme="dark" />
    </div>
  );
}
