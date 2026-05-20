import { Heart, Shield, Truck, Award, Sparkles, Users, Package, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { routes } from "@/shared/lib/routes";
import styles from "./AboutPage.module.css";

const values = [
  {
    icon: Heart,
    title: "Autenticidade",
    text: "Todos os produtos são 100% originais, adquiridos diretamente das marcas ou distribuidores autorizados.",
  },
  {
    icon: Shield,
    title: "Segurança",
    text: "Compra protegida por criptografia SSL, gateway certificado e política de reembolso garantida.",
  },
  {
    icon: Truck,
    title: "Entrega Rápida",
    text: "Frete grátis acima de R$ 150 e rastreamento em tempo real para você acompanhar cada etapa.",
  },
  {
    icon: Award,
    title: "Qualidade",
    text: "Curadoria rigorosa das melhores marcas nacionais e internacionais de beleza e skincare.",
  },
];

const stats = [
  { icon: Users, value: "50 mil+", label: "Clientes satisfeitas" },
  { icon: Package, value: "5 mil+", label: "Produtos disponíveis" },
  { icon: Star, value: "4,9/5", label: "Avaliação média" },
  { icon: Sparkles, value: "200+", label: "Marcas parceiras" },
];

const timeline = [
  {
    year: "2024",
    title: "Fundação",
    text: "Nascemos com a missão de democratizar o acesso à beleza de qualidade para todas as mulheres do Brasil.",
  },
  {
    year: "2024",
    title: "Primeiro milhar",
    text: "Chegamos a 1.000 clientes em menos de 3 meses, com 98% de satisfação nas avaliações pós-compra.",
  },
  {
    year: "2025",
    title: "Beauty Club",
    text: "Lançamos o programa de fidelidade Beauty Club, com missões, pontos e ranking de clientes.",
  },
  {
    year: "2025",
    title: "Expansão",
    text: "Ampliamos o catálogo para mais de 5.000 produtos e fechamos parcerias com marcas internacionais.",
  },
];

export function AboutPage() {
  return (
    <div className={styles.page}>

      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>Nossa história</p>
            <h1 className={styles.heroTitle}>Sobre Toque de Mulher</h1>
            <p className={styles.textBody}>
              Nascemos da paixão pela beleza e do desejo de proporcionar a todas as mulheres acesso
              aos melhores produtos de cuidado pessoal — com qualidade, segurança e preços justos.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Stats ───────────────────────────────────────────────── */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className={styles.statCard}>
                <span className={styles.statIconWrap} aria-hidden="true">
                  <Icon className={styles.statIcon} />
                </span>
                <strong className={styles.statValue}>{value}</strong>
                <p className={styles.statLabel}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Nossa História ──────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.storyWrapper}>
            <div className={styles.storyGrid}>
              <div>
                <h2 className={styles.sectionTitle}>Nossa História</h2>
                <p className={styles.textSpacing}>
                  Fundada em 2024, a Toque de Mulher surgiu com a missão de democratizar o acesso
                  à beleza de qualidade. Acreditamos que toda mulher merece se sentir especial e
                  confiante em sua própria pele — independente do orçamento.
                </p>
                <p className={styles.textBody}>
                  Começamos com uma pequena seleção de produtos cuidadosamente escolhidos e, hoje,
                  oferecemos milhares de opções das melhores marcas nacionais e internacionais,
                  com entrega para todo o Brasil.
                </p>
              </div>
              <div className={styles.imageFrame}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1690087938677-a2b27fe32270?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwbG90dXMlMjBmbG93ZXJ8ZW58MXx8fHwxNzYxNTI5NTEyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Flor de lotus rosa, símbolo de beleza e renovação"
                  className={styles.imageCover}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Missão e Visão ──────────────────────────────────────── */}
      <section className={styles.missionSection}>
        <div className={styles.container}>
          <div className={styles.missionGrid}>
            <div className={styles.missionCard}>
              <span className={styles.missionIconWrap} aria-hidden="true">
                <Heart className={styles.missionIcon} />
              </span>
              <h3 className={styles.missionTitle}>Missão</h3>
              <p className={styles.missionText}>
                Democratizar o acesso à beleza de qualidade, oferecendo produtos originais com
                atendimento humano, preços transparentes e entrega confiável para toda mulher
                brasileira.
              </p>
            </div>
            <div className={styles.missionCard}>
              <span className={styles.missionIconWrap} aria-hidden="true">
                <Sparkles className={styles.missionIcon} />
              </span>
              <h3 className={styles.missionTitle}>Visão</h3>
              <p className={styles.missionText}>
                Ser a plataforma de beleza mais querida do Brasil — onde cada cliente se sente
                vista, valorizada e inspirada a expressar sua identidade com autenticidade.
              </p>
            </div>
            <div className={styles.missionCard}>
              <span className={styles.missionIconWrap} aria-hidden="true">
                <Award className={styles.missionIcon} />
              </span>
              <h3 className={styles.missionTitle}>Valores</h3>
              <p className={styles.missionText}>
                Autenticidade, cuidado com a cliente, transparência nos negócios, diversidade
                e inclusão, e comprometimento com a qualidade em cada detalhe da experiência.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Timeline ────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.storyWrapper}>
            <h2 className={styles.centerTitle}>Nossa jornada</h2>
            <div className={styles.timeline}>
              {timeline.map((item, index) => (
                <div key={index} className={styles.timelineItem}>
                  <div className={styles.timelineMarker}>
                    <span className={styles.timelineYear}>{item.year}</span>
                    <div className={styles.timelineDot} aria-hidden="true" />
                  </div>
                  <div className={styles.timelineContent}>
                    <h3 className={styles.timelineTitle}>{item.title}</h3>
                    <p className={styles.timelineText}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Valores ─────────────────────────────────────────────── */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <h2 className={styles.centerTitle}>Por que escolher a Toque de Mulher?</h2>
          <div className={styles.valuesGrid}>
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className={styles.valueCard}>
                <div className={styles.valueIconWrap}>
                  <Icon className={styles.valueIcon} aria-hidden="true" />
                </div>
                <h3 className={styles.valueTitle}>{title}</h3>
                <p className={styles.valueText}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Políticas ───────────────────────────────────────────── */}
      <section className={styles.policiesSection}>
        <div className={styles.container}>
          <div className={styles.storyWrapper}>
            <h2 className={styles.policiesTitle}>Nossas Políticas</h2>
            <div className={styles.policiesStack}>
              <div className={styles.policyCard}>
                <h3 className={styles.policyTitle}>Política de Envio</h3>
                <div className={styles.policyList}>
                  <p>• Frete grátis para compras acima de R$ 150,00</p>
                  <p>• 5 a 10 dias úteis (Sul/Sudeste) · 10 a 15 dias úteis (demais regiões)</p>
                  <p>• Enviamos para todo o Brasil via transportadoras parceiras</p>
                  <p>• Código de rastreamento enviado por e-mail após despacho</p>
                </div>
              </div>

              <div className={styles.policyCard}>
                <h3 className={styles.policyTitle}>Política de Devolução</h3>
                <div className={styles.policyList}>
                  <p>• 30 dias para troca ou devolução após o recebimento</p>
                  <p>• Produtos devem estar sem uso e na embalagem original</p>
                  <p>• Reembolso processado em até 7 dias úteis após aprovação</p>
                  <p>• Defeitos de fabricação: frete de devolução por nossa conta</p>
                </div>
              </div>

              <div className={styles.policyCard}>
                <h3 className={styles.policyTitle}>Política de Privacidade</h3>
                <div className={styles.policyList}>
                  <p>• Seus dados pessoais são protegidos com criptografia SSL</p>
                  <p>• Não compartilhamos informações com terceiros sem consentimento</p>
                  <p>• Utilizamos cookies para melhorar sua experiência de navegação</p>
                  <p>• Em conformidade total com a LGPD (Lei nº 13.709/2018)</p>
                </div>
              </div>

              <div className={styles.policyCard}>
                <h3 className={styles.policyTitle}>Termos de Uso</h3>
                <div className={styles.policyList}>
                  <p>• Ao usar nosso site, você concorda com nossos termos</p>
                  <p>• Produtos sujeitos à disponibilidade de estoque</p>
                  <p>• Preços e promoções podem ser alterados sem aviso prévio</p>
                  <p>• Reservamo-nos o direito de cancelar pedidos suspeitos de fraude</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <p className={styles.ctaEyebrow}>Fale com a gente</p>
            <h2 className={styles.ctaTitle}>Ficou com alguma dúvida?</h2>
            <p className={styles.ctaText}>Nossa equipe está pronta para te ajudar!</p>
            <div className={styles.ctaActions}>
              <Link to={routes.help} className={styles.ctaPrimary}>
                Central de ajuda
              </Link>
              <a href="mailto:contato@toquedemulher.com" className={styles.ctaSecondary}>
                contato@toquedemulher.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
