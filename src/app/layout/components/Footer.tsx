import { Link } from "react-router-dom";
import { ArrowUpRight, Heart, ShieldCheck, ShoppingBag } from "lucide-react";
import { routes } from "@/app/router/paths";
import styles from "./Footer.module.css";
const groups = [
 { title:"Encontre seu toque", links:[["Maquiagem",routes.category("maquiagem")],["Skincare",routes.category("skincare")],["Corpo & banho",routes.category("corpo")],["Cabelos",routes.category("cabelos")],["Perfumes",routes.category("perfumes")]] },
 { title:"Seu espaço", links:[["Minha conta",routes.profile],["Meus favoritos",routes.favorites],["Minha sacola",routes.cart],["Preferências",routes.settings]] },
 { title:"Estamos por aqui", links:[["Central de ajuda",routes.help],["Sobre a Toque",routes.about],["Trocas e devoluções",routes.institutional("trocas")],["Privacidade",routes.institutional("privacidade")]] },
];
export function Footer() {
 return <footer className={styles.footer}>
  <div className={styles.intro}><div><span>BELEZA É SE SENTIR EM CASA.</span><h2>Seu próximo toque<br/>começa <em>aqui.</em></h2></div><Link to={routes.search()}>Explore a coleção <ArrowUpRight size={22}/></Link></div>
  <div className={styles.grid}>
   <div className={styles.brand}><Link to={routes.home}>toque de mulher</Link><p>Um universo de possibilidades para a sua beleza. Com personalidade, cuidado e espaço para ser você.</p><div className={styles.brandIcons}><Heart/><ShoppingBag/><ShieldCheck/></div></div>
   {groups.map(group => <div className={styles.column} key={group.title}><h3>{group.title}</h3>{group.links.map(([label,path]) => <Link key={label} to={path}>{label}</Link>)}</div>)}
  </div>
  <div className={styles.bottom}><span>© {new Date().getFullYear()} Toque de Mulher.</span><span>Beleza no seu ritmo. Feito com cuidado.</span><Link to={routes.help}>Podemos ajudar? <ArrowUpRight size={13}/></Link></div>
 </footer>;
}