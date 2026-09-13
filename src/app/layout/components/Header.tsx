import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Heart, Menu, Moon, Search, ShoppingBag, Sun, UserRound } from "lucide-react";
import { routes } from "@/app/router/paths";
import { useAuth } from "@/features/auth/context/auth-context";
import { useCart } from "@/features/cart/context/cart-context";
import { useTheme } from "@/app/providers/theme/theme-context";
import { catalogCategories, trendingProducts } from "@/features/catalog/data/catalog-products";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import styles from "./Header.module.css";

export function Header() {
 const { user, isAdmin } = useAuth();
 const { itemCount, openCart } = useCart();
 const { theme, toggleTheme } = useTheme();
 const [menuOpen, setMenuOpen] = useState(false);
 const [query, setQuery] = useState("");
 const [searchOpen, setSearchOpen] = useState(false);
 const searchRef = useRef<HTMLDivElement>(null);
 const navigate = useNavigate();
 const location = useLocation();
 const suggestions = query.trim() ? trendingProducts.filter(p => p.name.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR"))).slice(0, 4) : [];
 useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location.pathname, location.search]);
 useEffect(() => {
  const close = (event: PointerEvent) => { if (!searchRef.current?.contains(event.target as Node)) setSearchOpen(false); };
  document.addEventListener("pointerdown", close);
  return () => document.removeEventListener("pointerdown", close);
 }, []);
 return <>
  <div className={styles.announcement}><span>Um toque de beleza. Um momento só seu.</span><Link to={routes.category("skincare")}>Encontre seu ritual <ArrowUpRight size={12}/></Link></div>
  <header className={styles.header}>
   <div className={styles.main}>
    <button className={styles.menuButton} onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu/></button>
    <Link to={routes.home} className={styles.logo} aria-label="Toque de Mulher, início"><span>toque de mulher</span></Link>
    <div className={styles.search} ref={searchRef}>
     <form role="search" onSubmit={e => { e.preventDefault(); navigate(routes.search(query.trim())); setSearchOpen(false); }}>
      <Search size={18}/><input aria-label="Buscar produtos" placeholder="Qual o seu desejo de hoje?" value={query} onChange={e => { setQuery(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} onKeyDown={e => { if (e.key === "Escape") setSearchOpen(false); }}/>
      <button type="submit" aria-label="Pesquisar"><ArrowUpRight size={18}/></button>
     </form>
     {searchOpen && query.trim() && <div className={styles.suggestions}>
      <span className="store-eyebrow">Encontre seu próximo favorito</span>
      {suggestions.map(product => <Link key={product.id} to={routes.product(product.id)}>{product.name}<ArrowUpRight size={15}/></Link>)}
      <Link to={routes.search(query)}>Ver resultados para “{query}” <Search size={15}/></Link>
     </div>}
    </div>
    <div className={styles.actions}>
     <button className={styles.iconButton} onClick={toggleTheme} aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}>{theme === "dark" ? <Sun/> : <Moon/>}</button>
     <Link className={styles.favorite} to={routes.favorites} aria-label="Meus favoritos"><Heart/></Link>
     <Link className={styles.account} to={user ? routes.profile : routes.login}><UserRound/><span>{user ? "Olá, " + user.name.split(" ")[0] : "Seu espaço"}<small>{user ? "Minha conta" : "Entre ou cadastre-se"}</small></span></Link>
     <button className={styles.bag} onClick={openCart} aria-label={"Abrir sacola com " + itemCount + " itens"}><ShoppingBag/><span>{itemCount}</span></button>
    </div>
   </div>
   <nav className={styles.nav} aria-label="Categorias da loja">
    <NavLink to={routes.search()}>Explorar tudo</NavLink>
    {Object.values(catalogCategories).map(category => <NavLink key={category.slug} to={routes.category(category.slug)}>{category.title}</NavLink>)}
    <span className={styles.navDivider}/><NavLink to={routes.about}>Nosso universo <ArrowUpRight size={13}/></NavLink>
   </nav>
  </header>
  <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
   <SheetContent side="left" className={styles.mobileMenu}>
    <SheetHeader><SheetTitle className={styles.mobileTitle}>Seu universo de beleza.</SheetTitle><SheetDescription>Explore, descubra e escolha o seu toque.</SheetDescription></SheetHeader>
    <nav aria-label="Menu móvel" className={styles.mobileLinks}>
     <Link to={routes.home}>Início <ArrowUpRight/></Link>
     {Object.values(catalogCategories).map(c => <Link to={routes.category(c.slug)} key={c.slug}>{c.title}<ArrowUpRight/></Link>)}
     <Link to={routes.favorites}>Favoritos <Heart/></Link><Link to={routes.profile}>Minha conta <UserRound/></Link>
     <Link to={routes.settings}>Preferências</Link><Link to={routes.help}>Precisa de ajuda?</Link>
     {isAdmin && <Link to={routes.adminDashboard}>Administrar loja</Link>}
    </nav>
   </SheetContent>
  </Sheet>
 </>;
}