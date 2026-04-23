import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Smartphone } from "lucide-react";
import { routes } from "@/shared/lib/routes";
import styles from "./Footer.module.css";

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: Instagram,
  },
  {
    label: "Twitter",
    href: "https://x.com/",
    icon: Twitter,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/",
    icon: Youtube,
  },
] as const;

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.topBar}>
        <div className={styles.topContainer}>
          <div className={styles.topRow}>
            <div className={styles.socialRow}>
              <span className={styles.socialLabel}>Siga-nos:</span>
              <div className={styles.socialButtons}>
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    className={styles.socialButton}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Abrir ${label} em nova aba`}
                  >
                    <Icon className={styles.socialIcon} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            <div className={styles.appLink}>
              <Smartphone className={styles.appIcon} />
              <span className={styles.appText}>Baixe o App</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainSection}>
        <div className={styles.mainContainer}>
          <div className={styles.linksGrid}>
            <div>
              <h4 className={styles.columnTitle}>Informações</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link to={routes.about} className={styles.linkButton}>
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link to={routes.about} className={styles.linkButton}>
                    Quem Somos
                  </Link>
                </li>
                <li>
                  <Link
                    to={routes.institutional("trabalhe-conosco")}
                    className={styles.linkButton}
                  >
                    Trabalhe Conosco
                  </Link>
                </li>
                <li>
                  <Link
                    to={routes.institutional("blog")}
                    className={styles.linkButton}
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className={styles.columnTitle}>Atendimento</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link to={routes.help} className={styles.linkButton}>
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link
                    to={routes.institutional("contato")}
                    className={styles.linkButton}
                  >
                    Fale Conosco
                  </Link>
                </li>
                <li>
                  <Link
                    to={routes.institutional("trocas")}
                    className={styles.linkButton}
                  >
                    Trocas e Devoluções
                  </Link>
                </li>
                <li>
                  <Link
                    to={routes.institutional("rastreamento")}
                    className={styles.linkButton}
                  >
                    Rastreamento
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className={styles.columnTitle}>Categorias</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link
                    to={routes.category("maquiagem")}
                    className={styles.linkButton}
                  >
                    Maquiagem
                  </Link>
                </li>
                <li>
                  <Link
                    to={routes.category("skincare")}
                    className={styles.linkButton}
                  >
                    Skincare
                  </Link>
                </li>
                <li>
                  <Link
                    to={routes.category("cabelos")}
                    className={styles.linkButton}
                  >
                    Cabelos
                  </Link>
                </li>
                <li>
                  <Link
                    to={routes.category("perfumes")}
                    className={styles.linkButton}
                  >
                    Perfumaria
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className={styles.columnTitle}>Minha Conta</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link to={routes.profile} className={styles.linkButton}>
                    Meu Perfil
                  </Link>
                </li>
                <li>
                  <Link
                    to={routes.institutional("pedidos")}
                    className={styles.linkButton}
                  >
                    Meus Pedidos
                  </Link>
                </li>
                <li>
                  <Link
                    to={routes.institutional("desejos")}
                    className={styles.linkButton}
                  >
                    Lista de Desejos
                  </Link>
                </li>
                <li>
                  <Link to={routes.login} className={styles.linkButton}>
                    Entrar / Cadastrar
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className={styles.columnTitle}>Segurança</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link
                    to={routes.institutional("privacidade")}
                    className={styles.linkButton}
                  >
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    to={routes.institutional("termos")}
                    className={styles.linkButton}
                  >
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <span className={styles.linkButton}>Site Seguro (SSL)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.logoSection}>
            <div className={styles.logoRow}>
              <span className={styles.logoText}>toque de mulher</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <div className={styles.bottomText}>
            <p className={styles.bottomCopy}>
              © 2025 Toque de Mulher. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
