import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Heart, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/shared/ui/navigation-menu";
import { trendingProducts } from "@/shared/data/catalog-products";
import { routes } from "@/shared/lib/routes";
import { useAuth } from "@/shared/contexts/auth-context";
import { useCart } from "@/shared/contexts/cart-context";
import { ThemeSwitcher } from "@/shared/layout/ThemeSwitcher";
import styles from "./Header.module.css";

export function Header() {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const accountRoute = isLoggedIn && isAdmin ? routes.adminDashboard : routes.profile;

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      toast.error("Digite o nome de um produto para buscar.");
      return;
    }

    const product = trendingProducts.find((item) =>
      item.name.toLowerCase().includes(query),
    );

    if (!product) {
      toast.error("Nenhum produto local corresponde a essa busca.");
      return;
    }

    navigate(routes.product(product.id));
    setSearchQuery("");
  };

  return (
    <>
      <div className={styles.promoBar} role="region" aria-label="Avisos promocionais">
        <div className={styles.promoRow}>
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className={styles.promoText}>
              Frete Gratis acima de R$ 150,00 • Ate 50% OFF em selecionados
            </span>
          ))}
        </div>
        <div className={styles.promoRow} aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <span key={`clone-${i}`} className={styles.promoText}>
              Frete Gratis acima de R$ 150,00 • Ate 50% OFF em selecionados
            </span>
          ))}
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.mainHeader}>
          <div className={styles.mainContainer}>
            <div className={styles.mainRow}>
              <div className={styles.logoWrapper}>
                <Link
                  to={routes.home}
                  className={styles.logoButton}
                  aria-label="Ir para a página inicial da Toque de Mulher"
                >
                  <span className={styles.logoText}>toque de mulher</span>
                </Link>
              </div>

              <nav className={styles.navWrapper} aria-label="Navegação principal">
                <NavigationMenu className={styles.navMenu} viewport={false}>
                  <NavigationMenuList className={styles.navList}>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    onClick={() => handleCategoryClick("comprar")}
                    className={`${styles.navTrigger} ${
                      activeCategory === "comprar"
                        ? styles.navTriggerActive
                        : styles.navTriggerInactive
                    }`}
                  >
                    Comprar
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className={styles.navContent}>
                        <div className={styles.navPanel}>
                          <div className={`${styles.navColumn} ${styles.navColumnFeatured}`}>
                            <div className={styles.navSection}>
                              <NavigationMenuLink asChild className={styles.navSectionTitleLink}>
                                <Link to={routes.home}>Destaques</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.home}>Novidades</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.home}>Mais Vendidos</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.home}>K-Beauty</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.home}>Volta às Aulas</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.home}>Presentes</Link>
                              </NavigationMenuLink>
                            </div>
                            <div className={styles.navSection}>
                              <NavigationMenuLink asChild className={styles.navSectionTitleLink}>
                                <Link to={routes.home}>Outlet</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.home}>Até 50% OFF</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.home}>Kits Promo</Link>
                              </NavigationMenuLink>
                            </div>
                          </div>

                          <div className={styles.navColumn}>
                            <div className={styles.navSection}>
                              <NavigationMenuLink asChild className={styles.navSectionTitleLink}>
                                <Link to={routes.category("maquiagem")}>Maquiagem</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("maquiagem")}>Rosto</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("maquiagem")}>Olhos</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("maquiagem")}>Lábios</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("maquiagem")}>Paletas</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("maquiagem")}>Acessórios</Link>
                              </NavigationMenuLink>
                            </div>
                            <div className={styles.navSection}>
                              <NavigationMenuLink asChild className={styles.navSectionTitleLink}>
                                <Link to={routes.category("corpo")}>Corpo</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("corpo")}>Hidratantes</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("corpo")}>Banho</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("corpo")}>Desodorantes</Link>
                              </NavigationMenuLink>
                            </div>
                          </div>

                          <div className={styles.navColumn}>
                            <div className={styles.navSection}>
                              <NavigationMenuLink asChild className={styles.navSectionTitleLink}>
                                <Link to={routes.category("skincare")}>Skin Care</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("skincare")}>Limpeza</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("skincare")}>Séruns</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("skincare")}>Hidratantes</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("skincare")}>Tônicos</Link>
                              </NavigationMenuLink>
                            </div>
                            <div className={styles.navSection}>
                              <NavigationMenuLink asChild className={styles.navSectionTitleLink}>
                                <Link to={routes.category("cabelos")}>Cabelos</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("cabelos")}>Shampoos</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("cabelos")}>Máscaras</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("cabelos")}>Finalizadores</Link>
                              </NavigationMenuLink>
                            </div>
                          </div>

                          <div className={styles.navColumn}>
                            <div className={styles.navSection}>
                              <NavigationMenuLink asChild className={styles.navSectionTitleLink}>
                                <Link to={routes.category("perfumes")}>Perfumes</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("perfumes")}>Femininos</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("perfumes")}>Masculinos</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.category("perfumes")}>Body Splash</Link>
                              </NavigationMenuLink>
                            </div>
                            <div className={styles.navSection}>
                              <NavigationMenuLink asChild className={styles.navSectionTitleLink}>
                                <Link to={routes.home}>Marcas</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.home}>Bruna Tavares</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.home}>Niina Secrets</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.home}>Eudora</Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild className={styles.navSectionLink}>
                                <Link to={routes.home}>Vult</Link>
                              </NavigationMenuLink>
                            </div>
                          </div>

                          <div className={styles.navColumn}>
                            <div className={styles.navSection}>
                              <NavigationMenuLink asChild className={styles.navSectionTitleLink}>
                                <Link to={routes.home}>Regiões</Link>
                              </NavigationMenuLink>
                              <div className={styles.navCards}>
                                <NavigationMenuLink asChild className={styles.navCard}>
                                  <Link to={routes.home}>
                                    <span className={styles.navCardTitle}>Brasil</span>
                                    <span className={styles.navCardSub}>Beauty</span>
                                  </Link>
                                </NavigationMenuLink>
                                <NavigationMenuLink asChild className={styles.navCard}>
                                  <Link to={routes.home}>
                                    <span className={styles.navCardTitle}>Internacional</span>
                                    <span className={styles.navCardSub}>Beauty</span>
                                  </Link>
                                </NavigationMenuLink>
                              </div>
                            </div>
                          </div>
                        </div>
                      </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={`${styles.navLinkSimple} ${styles.navLinkPromo}`}
                  >
                    <Link to={routes.home}>Promoções</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={styles.navLinkSimple}>
                    <Link to={routes.home}>Novos</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className={styles.navLinkSimple}
                  >
                    <Link to={routes.home}>Marcas</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </nav>

              <form
                className={styles.searchWrapper}
                role="search"
                aria-label="Buscar produtos"
                onSubmit={handleSearchSubmit}
              >
                <label htmlFor="header-search" className="sr-only">
                  Buscar produtos por nome
                </label>
                <Search className={styles.searchIcon} aria-hidden="true" />
                <Input
                  id="header-search"
                  type="search"
                  className={styles.searchInput}
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  autoComplete="off"
                />
                <button type="submit" className="sr-only">
                  Buscar
                </button>
              </form>

              <div className={styles.actionRow}>
                <ThemeSwitcher />

                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className={styles.cartButton}
                >
                  <Link
                    to={routes.cart}
                    aria-label={
                      itemCount > 0
                        ? `Carrinho com ${itemCount} ${itemCount === 1 ? "item" : "itens"}`
                        : "Carrinho"
                    }
                  >
                    <ShoppingCart className={styles.iconLarge} aria-hidden="true" />
                    {itemCount > 0 && (
                      <span className="sr-only">
                        {itemCount} {itemCount === 1 ? "item no carrinho" : "itens no carrinho"}
                      </span>
                    )}
                    {itemCount > 0 && (
                      <Badge className={styles.cartBadge} aria-hidden="true">
                        {itemCount}
                      </Badge>
                    )}
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className={styles.iconButton}
                >
                  <Link
                    to={accountRoute}
                    aria-label="Perfil"
                  >
                    <User className={styles.iconLarge} aria-hidden="true" />
                  </Link>
                </Button>

                {isLoggedIn && (
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className={`${styles.iconButton} ${styles.iconButtonHidden}`}
                  >
                    <Link
                      to={isAdmin ? routes.productCreate : routes.profile}
                      aria-label={isAdmin ? "Painel administrativo" : "Favoritos"}
                    >
                      {isAdmin ? (
                        <LayoutDashboard className={styles.iconLarge} aria-hidden="true" />
                      ) : (
                        <Heart className={styles.iconLarge} aria-hidden="true" />
                      )}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
