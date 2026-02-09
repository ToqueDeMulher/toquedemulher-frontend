import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, User, Heart } from "lucide-react";
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
import { routes } from "@/shared/lib/routes";
import { useAuth } from "@/shared/contexts/auth-context";
import { useCart } from "@/shared/contexts/cart-context";
import logoImage from "@/shared/assets/logo_tm.png";
import styles from "./Header.module.css";

export function Header() {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const { isLoggedIn } = useAuth();
  const { itemCount } = useCart();

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <>
      <div className={styles.promoBar}>
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
                <Link to={routes.home} className={styles.logoButton}>
                  <span className={styles.logoText}>toque de mulher</span>
                </Link>
              </div>

              <div className={styles.navWrapper}>
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
              </div>

              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} />
                <Input
                  className={styles.searchInput}
                  placeholder="Buscar produtos..."
                  aria-label="Buscar produtos"
                />
              </div>

              <div className={styles.actionRow}>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className={styles.cartButton}
                >
                  <Link to={routes.cart} aria-label="Carrinho">
                    <ShoppingCart className={styles.iconLarge} />
                    {itemCount > 0 && (
                      <Badge className={styles.cartBadge}>{itemCount}</Badge>
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
                    to={isLoggedIn ? routes.profile : routes.login}
                    aria-label="Perfil"
                  >
                    <User className={styles.iconLarge} />
                  </Link>
                </Button>

                {isLoggedIn && (
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className={`${styles.iconButton} ${styles.iconButtonHidden}`}
                  >
                    <Link to={routes.profile} aria-label="Favoritos">
                      <Heart className={styles.iconLarge} />
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
