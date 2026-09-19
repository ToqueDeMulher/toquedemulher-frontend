import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Menu,
  Pause,
  Play,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { routes } from "@/app/router/paths";
import { useAuth } from "@/features/auth/context/auth-context";
import { useCart } from "@/features/cart/context/cart-context";
import {
  catalogCategories,
  trendingProducts,
} from "@/features/catalog/data/catalog-products";
import styles from "./Header.module.css";

const marqueeRepeats = Array.from({ length: 8 }, (_, i) => i);

export function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [marqueePaused, setMarqueePaused] = useState(false);
  const { isLoggedIn } = useAuth();
  const { itemCount, openCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const accountRoute = isLoggedIn ? routes.profile : routes.login;
  const query = searchTerm.trim().toLocaleLowerCase("pt-BR");
  const categories = Object.values(catalogCategories);
  const results = query
    ? [
        ...categories
          .filter((item) =>
            item.title.toLocaleLowerCase("pt-BR").includes(query),
          )
          .slice(0, 2)
          .map((item) => ({
            label: item.title,
            to: routes.category(item.slug),
            detail: "Coleção",
          })),
        ...trendingProducts
          .filter((item) =>
            item.name.toLocaleLowerCase("pt-BR").includes(query),
          )
          .slice(0, 4)
          .map((item) => ({
            label: item.name,
            to: routes.product(item.id),
            detail: item.price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            }),
          })),
      ]
    : [];

  useEffect(() => {
    setMenuOpen(false);
    setShowDropdown(false);
    setActiveIndex(-1);
  }, [location.key]);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node))
        setShowDropdown(false);
    };
    const scroll = () => setScrolled(window.scrollY > 40);
    scroll();
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", scroll);
    };
  }, []);

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    if (!query) return;
    navigate(
      activeIndex >= 0 && results[activeIndex]
        ? results[activeIndex].to
        : routes.search(searchTerm.trim()),
    );
    setSearchTerm("");
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  return (
    <>
      <div className={styles.promoBar}>
        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeViewport}>
            <div
              className={styles.marqueeTrack}
              data-paused={marqueePaused}
              aria-live="off"
            >
              <div className={styles.marqueeChunk}>
                {marqueeRepeats.map((i) => (
                  <Link
                    key={i}
                    to={routes.category("maquiagem")}
                    className={styles.marqueeItem}
                    aria-hidden={i === 0 ? undefined : true}
                    tabIndex={i === 0 ? undefined : -1}
                  >
                    Frete grátis acima de R$ 150
                  </Link>
                ))}
              </div>
              <div className={styles.marqueeChunk} aria-hidden="true">
                {marqueeRepeats.map((i) => (
                  <Link
                    key={i}
                    to={routes.category("maquiagem")}
                    className={styles.marqueeItem}
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    Frete grátis acima de R$ 150
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            className={styles.marqueeToggle}
            onClick={() => setMarqueePaused((paused) => !paused)}
            aria-label={
              marqueePaused ? "Retomar animação" : "Pausar animação"
            }
            aria-pressed={marqueePaused}
          >
            {marqueePaused ? <Play size={11} /> : <Pause size={11} />}
          </button>
        </div>
      </div>
      <header className={styles.header} data-scrolled={scrolled}>
        <div className={styles.mainRow}>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger className={styles.menuButton} aria-label="Abrir menu">
              <Menu size={22} />
            </SheetTrigger>
            <SheetContent side="left" className={styles.mobileMenu}>
              <SheetHeader>
                <SheetTitle className={styles.mobileLogo}>
                  toque de mulher<span>.</span>
                </SheetTitle>
                <SheetDescription>
                  Seu próximo favorito está aqui.
                </SheetDescription>
              </SheetHeader>
              <nav aria-label="Menu do celular" className={styles.mobileLinks}>
                <span className={styles.menuEyebrow}>EXPLORE A LOJA</span>
                {categories.map((item) => (
                  <SheetClose asChild key={item.slug}>
                    <Link to={routes.category(item.slug)}>
                      {item.title}
                      <ArrowRight size={17} />
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link to={routes.about}>
                    Sobre a loja
                    <ArrowRight size={17} />
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to={routes.missions}>
                    Beauty Club
                    <Sparkles size={17} />
                  </Link>
                </SheetClose>
              </nav>
              <div className={styles.mobileBottom}>
                <Link to={accountRoute}>
                  <User size={17} />
                  {isLoggedIn ? "Minha conta" : "Entrar ou criar conta"}
                </Link>
                <Link to={routes.help}>
                  Falar com atendimento <ArrowRight size={16} />
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          <Link
            to={routes.home}
            className={styles.logo}
            aria-label="Toque de Mulher — página inicial"
          >
            toque de mulher<span>.</span>
          </Link>
          <div
            ref={searchRef}
            className={styles.searchWrapper}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setShowDropdown(false);
            }}
          >
            <form onSubmit={search} className={styles.searchForm} role="search">
              <button
                type="submit"
                className={styles.searchSubmit}
                aria-label="Buscar"
              >
                <Search size={18} />
              </button>
              <input
                ref={inputRef}
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setActiveIndex(-1);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Qual vai ser o seu próximo favorito?"
                aria-label="Buscar produtos"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={showDropdown && Boolean(query)}
                aria-controls="header-search-results"
                aria-activedescendant={
                  showDropdown && activeIndex >= 0
                    ? `search-result-${activeIndex}`
                    : undefined
                }
                autoComplete="off"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setShowDropdown(false);
                    setActiveIndex(-1);
                  }
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setShowDropdown(true);
                    setActiveIndex((index) =>
                      Math.min(index + 1, results.length - 1),
                    );
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveIndex((index) => Math.max(index - 1, -1));
                  }
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  className={styles.clearSearch}
                  onClick={() => {
                    setSearchTerm("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Limpar busca"
                >
                  <X size={16} />
                </button>
              )}
            </form>
            {showDropdown && query && (
              <div className={styles.dropdown}>
                <div className={styles.menuEyebrow}>ENCONTRE SEU TOQUE</div>
                <div
                  id="header-search-results"
                  role="listbox"
                  aria-label="Sugestões de produtos e categorias"
                >
                  {results.map((item, index) => (
                    <Link
                      id={`search-result-${index}`}
                      role="option"
                      aria-selected={activeIndex === index}
                      key={item.to}
                      to={item.to}
                      onClick={() => setSearchTerm("")}
                      className={styles.searchResult}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <span>{item.label}</span>
                      <small>{item.detail}</small>
                    </Link>
                  ))}
                </div>
                {!results.length && (
                  <p className={styles.noResults}>
                    Não encontramos esse nome. Tente um produto ou categoria.
                  </p>
                )}
                <Link
                  className={styles.allResults}
                  to={routes.search(searchTerm)}
                  onClick={() => setSearchTerm("")}
                >
                  Ver todos os resultados <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
          <div className={styles.actions}>
            <Link className={styles.accountLink} to={accountRoute}>
              <User size={21} />
              <span>{isLoggedIn ? "Minha conta" : "Entrar"}</span>
            </Link>
            <Link
              to={routes.favorites}
              className={styles.favoriteLink}
              aria-label="Meus favoritos"
            >
              <Heart size={21} />
            </Link>
            <button
              type="button"
              className={styles.cartButton}
              onClick={openCart}
              aria-label={`Abrir carrinho, ${itemCount} ${itemCount === 1 ? "item" : "itens"}`}
            >
              <ShoppingBag size={21} />
              <span key={itemCount} className={styles.cartCount}>
                {itemCount}
              </span>
            </button>
          </div>
        </div>
        <nav className={styles.desktopNav} aria-label="Navegação principal">
          <div className={styles.categoryLinks}>
            {categories.map((item) => (
              <NavLink key={item.slug} to={routes.category(item.slug)}>
                {item.title}
              </NavLink>
            ))}
          </div>
          <div className={styles.discoverLinks}>
            <NavLink to={routes.about}>Sobre a loja</NavLink>
            <NavLink to={routes.missions}>
              <Sparkles size={14} /> Beauty Club
            </NavLink>
          </div>
        </nav>
      </header>
    </>
  );
}
