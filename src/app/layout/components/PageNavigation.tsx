import { Link, matchPath, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import {
  catalogCategories,
  getProductById,
  isCatalogCategorySlug,
} from "@/features/catalog/data/catalog-products";
import { routes } from "@/app/router/paths";
import styles from "./PageNavigation.module.css";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

const institutionalLabels: Record<string, string> = {
  privacidade: "Política de Privacidade",
  termos: "Termos de Uso",
  "trabalhe-conosco": "Trabalhe Conosco",
  blog: "Blog",
  contato: "Fale Conosco",
  trocas: "Trocas e Devoluções",
  rastreamento: "Rastreamento",
  pedidos: "Meus Pedidos",
  desejos: "Lista de Desejos",
};

const checkoutLabels: Record<string, string> = {
  address: "Endereço",
  payment: "Pagamento",
  confirmation: "Confirmação",
};

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getBreadcrumbItems(pathname: string, search: string): BreadcrumbItem[] {
  if (pathname === routes.home) return [];

  const base: BreadcrumbItem[] = [{ label: "Home", to: routes.home }];

  const productMatch = matchPath(routes.product(), pathname);
  if (productMatch?.params.productId) {
    const product = getProductById(productMatch.params.productId);
    if (product && isCatalogCategorySlug(product.category)) {
      return [
        ...base,
        { label: catalogCategories[product.category].title, to: routes.category(product.category) },
        { label: product.name },
      ];
    }
    return [...base, { label: "Produto" }];
  }

  const categoryMatch = matchPath(routes.category(), pathname);
  if (categoryMatch?.params.category) {
    const category = categoryMatch.params.category;
    return [
      ...base,
      {
        label: isCatalogCategorySlug(category)
          ? catalogCategories[category].title
          : titleFromSlug(category),
      },
    ];
  }

  const checkoutMatch = matchPath(routes.checkoutStep(), pathname);
  if (checkoutMatch?.params.step) {
    const step = checkoutMatch.params.step;
    return [
      ...base,
      { label: "Carrinho", to: routes.cart },
      { label: checkoutLabels[step] ?? titleFromSlug(step) },
    ];
  }

  const institutionalMatch = matchPath(routes.institutional(), pathname);
  if (institutionalMatch?.params.slug) {
    const slug = institutionalMatch.params.slug;
    return [...base, { label: institutionalLabels[slug] ?? titleFromSlug(slug) }];
  }

  if (pathname === routes.cart) return [...base, { label: "Carrinho" }];
  if (pathname === routes.login) return [...base, { label: "Entrar" }];
  if (pathname === routes.profile) return [...base, { label: "Meu Perfil" }];
  if (pathname === routes.addressCreate) return [...base, { label: "Novo Endereço" }];
  if (pathname === routes.help) return [...base, { label: "Central de Ajuda" }];
  if (pathname === routes.about) return [...base, { label: "Sobre Nós" }];
  if (pathname === routes.missions) return [...base, { label: "Missões" }];
  if (pathname === routes.ranking) return [...base, { label: "Ranking" }];

  if (pathname === "/busca") {
    const query = new URLSearchParams(search).get("q");
    return [...base, { label: query ? `Busca: "${query}"` : "Busca" }];
  }

  return [...base, { label: titleFromSlug(pathname.replace(/^\/+/, "")) || "Página" }];
}

export function PageNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const items = getBreadcrumbItems(location.pathname, location.search);

  if (items.length === 0) return null;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(routes.home);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <button type="button" className={styles.backButton} onClick={handleBack}>
          <ArrowLeft className={styles.backIcon} aria-hidden="true" />
          <span>Voltar</span>
        </button>

        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol className={styles.list}>
            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <li key={`${item.label}-${index}`} className={styles.item}>
                  {index > 0 && <ChevronRight className={styles.separator} aria-hidden="true" />}
                  {item.to && !isLast ? (
                    <Link to={item.to} className={styles.link}>
                      {item.label}
                    </Link>
                  ) : (
                    <span className={styles.current} aria-current={isLast ? "page" : undefined}>
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
