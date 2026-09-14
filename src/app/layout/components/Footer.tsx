import { ArrowRight, ArrowUpRight, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { routes } from "@/app/router/paths";
import { useAuth } from "@/features/auth/context/auth-context";
import { Reveal } from "@/shared/animation/Reveal";
import { BeautyFlower } from "@/shared/ui/BeautyFlower";
import styles from "./Footer.module.css";

const groups = [
  {
    title: "Explore",
    links: [
      ["Maquiagem", routes.category("maquiagem")],
      ["Skincare", routes.category("skincare")],
      ["Perfumes", routes.category("perfumes")],
      ["Cabelos", routes.category("cabelos")],
      ["Corpo", routes.category("corpo")],
    ],
  },
  {
    title: "Podemos ajudar?",
    links: [
      ["Central de ajuda", routes.help],
      ["Fale com a gente", routes.institutional("contato")],
      ["Trocas e devoluções", routes.institutional("trocas")],
      ["Acompanhar pedidos", `${routes.profile}?tab=orders`],
    ],
  },
  {
    title: "Universo Toque",
    links: [
      ["Sobre a loja", routes.about],
      ["Beauty Club", routes.missions],
      ["Meus favoritos", routes.favorites],
      ["Minha conta", routes.profile],
    ],
  },
];

export function Footer() {
  const { isLoggedIn } = useAuth();
  return (
    <footer className={styles.footer}>
      <Reveal className={styles.invitation}>
        <BeautyFlower className={styles.footerFlower} />
        <div>
          <span className={styles.eyebrow}>
            <Sparkles size={15} /> MAIS DO QUE BELEZA
          </span>
          <h2>Um toque que é só seu.</h2>
          <p>
            Descubra, escolha, experimente. A sua próxima história de beleza
            começa aqui.
          </p>
        </div>
        <Link
          className={styles.clubLink}
          to={isLoggedIn ? routes.missions : routes.login}
        >
          {isLoggedIn ? "Meu Beauty Club" : "Faça parte do Beauty Club"}
          <ArrowUpRight size={20} />
        </Link>
      </Reveal>
      <div className={styles.main}>
        <div className={styles.brand}>
          <Link to={routes.home} className={styles.logo}>
            toque de mulher<span>.</span>
          </Link>
          <p>
            Beleza com personalidade.
            <br />
            Cuidado em cada escolha.
          </p>
          <Link to={routes.about} className={styles.storyLink}>
            Conheça a nossa essência <ArrowRight size={15} />
          </Link>
          <span className={styles.signature}>
            <Heart size={13} /> Feito para o seu momento.
          </span>
        </div>
        {groups.map((group) => (
          <div className={styles.linkGroup} key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={styles.bottom}>
        <p>
          © {new Date().getFullYear()} Toque de Mulher. Todos os direitos
          reservados.
        </p>
        <div>
          <Link to={routes.institutional("privacidade")}>Privacidade</Link>
          <Link to={routes.institutional("termos")}>Termos de uso</Link>
        </div>
        <span>BELEZA. CUIDADO. VOCÊ.</span>
      </div>
    </footer>
  );
}
