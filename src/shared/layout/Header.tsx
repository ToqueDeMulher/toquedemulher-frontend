import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Heart, LayoutDashboard, Tag } from "lucide-react";
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
import styles from "./Header.module.css";

const ALL_CATEGORIES = [
  { slug: "maquiagem", label: "Maquiagem" },
  { slug: "skincare", label: "Skin Care" },
  { slug: "corpo", label: "Corpo" },
  { slug: "cabelos", label: "Cabelos" },
  { slug: "perfumes", label: "Perfumes" },
];

const MAX_PRODUCT_SUGGESTIONS = 4;
const MAX_CATEGORY_SUGGESTIONS = 3;

export function Header() {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const accountRoute = isLoggedIn && isAdmin ? routes.adminDashboard : routes.profile;
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sugestões calculadas em tempo real
  const normalized = searchTerm.toLowerCase().trim();
  const suggestedProducts = normalized.length >= 1
    ? trendingProducts
        .filter((p) => p.name.toLowerCase().includes(normalized))
        .slice(0, MAX_PRODUCT_SUGGESTIONS)
    : [];
  const suggestedCategories = normalized.length >= 1
    ? ALL_CATEGORIES.filter(
        (c) => c.label.toLowerCase().includes(normalized) || c.slug.includes(normalized)
      ).slice(0, MAX_CATEGORY_SUGGESTIONS)
    : [];
  const hasResults = suggestedProducts.length > 0 || suggestedCategories.length > 0;

  // Lista flat para navegação por teclado
  type SuggestionItem =
    | { kind: "product"; id: string; name: string }
    | { kind: "category"; slug: string; label: string }
    | { kind: "search"; term: string };

  const flatItems: SuggestionItem[] = [
    ...suggestedCategories.map((c) => ({ kind: "category" as const, ...c })),
    ...suggestedProducts.map((p) => ({ kind: "product" as const, id: p.id, name: p.name })),
    ...(normalized.length >= 1 ? [{ kind: "search" as const, term: searchTerm }] : []),
  ];

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };

  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
    setActiveIndex(-1);
  }, []);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  const navigateToItem = (item: SuggestionItem) => {
    closeDropdown();
    setSearchTerm("");
    if (item.kind === "product") navigate(routes.product(item.id));
    else if (item.kind === "category") navigate(routes.category(item.slug));
    else navigate(routes.search(item.term));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      closeDropdown();
      navigate(routes.search(searchTerm));
      setSearchTerm("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || flatItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      navigateToItem(flatItems[activeIndex]);
    } else if (e.key === "Escape") {
      closeDropdown();
      inputRef.current?.blur();
    }
  };

  return (
    <>
      <div className={styles.promoBar} role="region" aria-label="Avisos promocionais">
        <div className={styles.promoRow}>
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className={styles.promoText}>
              Frete Grátis acima de R$ 150,00 • Até 50% OFF em selecionados
            </span>
          ))}
        </div>
        <div className={styles.promoRow} aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <span key={`clone-${i}`} className={styles.promoText}>
              Frete Grátis acima de R$ 150,00 • Até 50% OFF em selecionados
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
                  <NavigationMenuLink asChild className={styles.navLinkSimple}>
                    <Link to={routes.home}>Marcas</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </nav>

              <div ref={searchRef} className={styles.searchWrapper}>
                <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                  <Search className={styles.searchIcon} />
                  <Input
                    ref={inputRef}
                    className={styles.searchInput}
                    placeholder="Buscar produtos..."
                    aria-label="Buscar produtos"
                    aria-autocomplete="list"
                    aria-expanded={showDropdown}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                      setActiveIndex(-1);
                    }}
                    onFocus={() => searchTerm.trim() && setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                  />
                </form>

                {/* Dropdown de sugestões */}
                {showDropdown && normalized.length >= 1 && (
                  <div className={styles.dropdown} role="listbox">
                    {!hasResults && (
                      <div className={styles.dropdownEmpty}>
                        Nenhum resultado para &ldquo;{searchTerm}&rdquo;
                      </div>
                    )}

                    {suggestedCategories.length > 0 && (
                      <div className={styles.dropdownGroup}>
                        <span className={styles.dropdownGroupLabel}>Categorias</span>
                        {suggestedCategories.map((cat) => {
                          const idx = flatItems.findIndex(
                            (it) => it.kind === "category" && it.slug === cat.slug
                          );
                          return (
                            <button
                              key={cat.slug}
                              role="option"
                              aria-selected={activeIndex === idx}
                              className={`${styles.dropdownItem} ${
                                activeIndex === idx ? styles.dropdownItemActive : ""
                              }`}
                              onMouseDown={() => navigateToItem({ kind: "category", ...cat })}
                              onMouseEnter={() => setActiveIndex(idx)}
                            >
                              <Tag className={styles.dropdownItemIcon} />
                              <span>{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {suggestedProducts.length > 0 && (
                      <div className={styles.dropdownGroup}>
                        <span className={styles.dropdownGroupLabel}>Produtos</span>
                        {suggestedProducts.map((product) => {
                          const idx = flatItems.findIndex(
                            (it) => it.kind === "product" && it.id === product.id
                          );
                          return (
                            <button
                              key={product.id}
                              role="option"
                              aria-selected={activeIndex === idx}
                              className={`${styles.dropdownItem} ${
                                activeIndex === idx ? styles.dropdownItemActive : ""
                              }`}
                              onMouseDown={() =>
                                navigateToItem({ kind: "product", id: product.id, name: product.name })
                              }
                              onMouseEnter={() => setActiveIndex(idx)}
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                className={styles.dropdownItemThumb}
                              />
                              <span className={styles.dropdownItemName}>{product.name}</span>
                              <span className={styles.dropdownItemPrice}>
                                R$ {product.price.toFixed(2).replace(".", ",")}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {normalized.length >= 1 && (
                      <button
                        className={`${styles.dropdownSearchAll} ${
                          activeIndex === flatItems.length - 1 ? styles.dropdownItemActive : ""
                        }`}
                        onMouseDown={handleSearchSubmit as unknown as React.MouseEventHandler}
                        onMouseEnter={() => setActiveIndex(flatItems.length - 1)}
                      >
                        <Search className={styles.dropdownItemIcon} />
                        Ver todos os resultados para &ldquo;{searchTerm}&rdquo;
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.actionRow}>
                <Button asChild variant="ghost" size="icon" className={styles.cartButton}>
                  <Link to={routes.cart} aria-label="Carrinho">
                    <ShoppingCart className={styles.iconLarge} />
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
