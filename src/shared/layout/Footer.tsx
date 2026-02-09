import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Smartphone } from "lucide-react";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { routes } from "@/shared/lib/routes";
import logoImage from "@/shared/assets/nome_tdm.png";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.topBar}>
        <div className={styles.topContainer}>
          <div className={styles.topRow}>
            <div className={styles.socialRow}>
              <span className={styles.socialLabel}>Siga-nos:</span>
              <div className={styles.socialButtons}>
                <button className={styles.socialButton} aria-label="Facebook">
                  <Facebook className={styles.socialIcon} />
                </button>
                <button className={styles.socialButton} aria-label="Instagram">
                  <Instagram className={styles.socialIcon} />
                </button>
                <button className={styles.socialButton} aria-label="Twitter">
                  <Twitter className={styles.socialIcon} />
                </button>
                <button className={styles.socialButton} aria-label="Youtube">
                  <Youtube className={styles.socialIcon} />
                </button>
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
              <h4 className={styles.columnTitle}>Informacoes</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link to={routes.about} className={styles.linkButton}>
                    Sobre Nos
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
                    Trocas e Devolucoes
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
                    to={routes.category("feminino")}
                    className={styles.linkButton}
                  >
                    Maquiagem
                  </Link>
                </li>
                <li>
                  <Link
                    to={routes.category("feminino")}
                    className={styles.linkButton}
                  >
                    Skincare
                  </Link>
                </li>
                <li>
                  <Link
                    to={routes.category("acessorios")}
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
              <h4 className={styles.columnTitle}>Seguranca</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link
                    to={routes.institutional("privacidade")}
                    className={styles.linkButton}
                  >
                    Politica de Privacidade
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
              <ImageWithFallback
                src={logoImage}
                alt="Toque de Mulher"
                className={styles.logoImage}
              />
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
