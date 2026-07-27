import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Smartphone,
  Sparkles,
  Twitter,
  Youtube,
} from "lucide-react";
import { routes } from "@/app/router/paths";
import styles from "./Footer.module.css";

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/", icon: Facebook },
  { label: "Instagram", href: "https://www.instagram.com/", icon: Instagram },
  { label: "Twitter", href: "https://x.com/", icon: Twitter },
  { label: "YouTube", href: "https://www.youtube.com/", icon: Youtube },
] as const;

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

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
              <Smartphone className={styles.appIcon} aria-hidden="true" />
              <span className={styles.appText}>Baixe o App</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.newsletterSection}>
        <div className={styles.topContainer}>
          <div className={styles.newsletterInner}>
            <div className={styles.newsletterCopy}>
              <p className={styles.newsletterEyebrow}>Beauty Club</p>
              <h2 className={styles.newsletterTitle}>Receba dicas e ofertas exclusivas</h2>
              <p className={styles.newsletterSubtitle}>
                Assine a newsletter e seja a primeira a saber sobre lançamentos,
                promoções e tendências de beleza.
              </p>
            </div>

            {subscribed ? (
              <div className={styles.newsletterSuccess} role="status">
                <span className={styles.newsletterSuccessIcon} aria-hidden="true">
                  ✓
                </span>
                <div>
                  <p className={styles.newsletterSuccessTitle}>Inscrição confirmada!</p>
                  <p className={styles.newsletterSuccessText}>
                    Obrigada! Em breve você receberá novidades no seu e-mail.
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className={styles.newsletterForm}
                aria-label="Formulário de inscrição na newsletter"
              >
                <label htmlFor="footer-newsletter-email" className="sr-only">
                  Seu endereço de e-mail
                </label>
                <input
                  id="footer-newsletter-email"
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className={styles.newsletterInput}
                  autoComplete="email"
                />
                <button type="submit" className={styles.newsletterButton}>
                  Assinar grátis
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className={styles.mainSection}>
        <div className={styles.mainContainer}>
          <div className={styles.footerIntro}>
            <div className={styles.brandColumn}>
              <div className={styles.brandBadge}>
                <Sparkles className={styles.brandBadgeIcon} aria-hidden="true" />
                Curadoria autoral
              </div>

              <div className={styles.logoRow}>
                <span className={styles.logoText}>toque de mulher</span>
              </div>

              <p className={styles.brandText}>
                Beleza com personalidade, seleção cuidadosa e uma experiência pensada
                para deixar a compra mais leve, elegante e inspiradora.
              </p>

              <div className={styles.brandMeta}>
                <span className={styles.metaPill}>Beauty Club</span>
                <span className={styles.metaPill}>Lançamentos semanais</span>
              </div>
            </div>

            <div className={styles.supportCard}>
              <p className={styles.supportEyebrow}>Atendimento</p>
              <h3 className={styles.supportTitle}>
                Estamos por perto quando você precisar.
              </h3>

              <p className={styles.supportText}>
                Central de ajuda, trocas, rastreamento e contato em um único lugar.
              </p>

              <Link to={routes.help} className={styles.supportButton}>
                Falar com atendimento
              </Link>
            </div>
          </div>

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
                  <Link to={routes.institutional("blog")} className={styles.linkButton}>
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
                  <Link to={routes.institutional("contato")} className={styles.linkButton}>
                    Fale Conosco
                  </Link>
                </li>
                <li>
                  <Link to={routes.institutional("trocas")} className={styles.linkButton}>
                    Trocas e Devoluções
                  </Link>
                </li>
                <li>
                  <Link to={routes.institutional("rastreamento")} className={styles.linkButton}>
                    Rastreamento
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className={styles.columnTitle}>Categorias</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link to={routes.category("maquiagem")} className={styles.linkButton}>
                    Maquiagem
                  </Link>
                </li>
                <li>
                  <Link to={routes.category("skincare")} className={styles.linkButton}>
                    Skincare
                  </Link>
                </li>
                <li>
                  <Link to={routes.category("cabelos")} className={styles.linkButton}>
                    Cabelos
                  </Link>
                </li>
                <li>
                  <Link to={routes.category("corpo")} className={styles.linkButton}>
                    Corpo
                  </Link>
                </li>
                <li>
                  <Link to={routes.category("perfumes")} className={styles.linkButton}>
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
                  <Link to={routes.institutional("pedidos")} className={styles.linkButton}>
                    Meus Pedidos
                  </Link>
                </li>
                <li>
                  <Link to={routes.institutional("desejos")} className={styles.linkButton}>
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
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <div className={styles.bottomRow}>
            <p className={styles.bottomCopy}>
              © 2024-2026 Toque de Mulher. Todos os direitos reservados. CNPJ
              00.000.000/0001-00
            </p>

            <div className={styles.bottomLinks}>
              <Link to={routes.institutional("privacidade")} className={styles.bottomLink}>
                Privacidade
              </Link>
              <Link to={routes.institutional("termos")} className={styles.bottomLink}>
                Termos
              </Link>
              <Link to={routes.institutional("trocas")} className={styles.bottomLink}>
                Trocas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
