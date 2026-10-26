import { Link, useParams } from "react-router-dom";
import { BookOpen, Package } from "lucide-react";
import { routes } from "@/app/router/paths";
import { storeContact } from "@/shared/config/store-contact";
import { ContactPage } from "./ContactPage";
import styles from "./InstitutionalPage.module.css";

const pages: Record<string, { title: string; subtitle: string; paragraphs: string[] }> = {
  privacidade: {
    title: "Privacidade", subtitle: "Informações sobre os dados usados na sua compra.",
    paragraphs: ["A loja usa os dados da sua conta, endereço e destinatário para processar pedidos e entregas. O pagamento acontece em uma página protegida do provedor de pagamento.",
      "Preferências, favoritos, carrinho e progresso das missões são salvos neste navegador. Você pode limpar esses dados nas configurações do navegador.",
      "Para solicitar informações sobre seus dados, fale com a equipe pelo formulário de contato."],
  },
  termos: {
    title: "Compras e pagamento", subtitle: "Confira os valores antes de concluir sua compra.",
    paragraphs: ["Para comprar, entre na sua conta, escolha um endereço e calcule a entrega pelo CEP. A disponibilidade e os preços são conferidos ao iniciar o pagamento.",
      "As formas de pagamento e suas condições são exibidas na página de pagamento. O pedido é confirmado somente após a confirmação do pagamento.",
      "O valor e o prazo de entrega dependem dos produtos, do CEP e da opção selecionada. A entrega gratuita só está confirmada quando a cotação escolhida indicar valor zero."],
  },
  trocas: {
    title: "Trocas e devoluções", subtitle: "Fale com a equipe sobre seu pedido.",
    paragraphs: ["Envie o número do pedido e descreva sua solicitação pelo formulário de contato. A equipe orientará os próximos passos."],
  },
  rastreamento: {
    title: "Rastreamento de Pedido", subtitle: "Acompanhe seu pedido pela sua conta.",
    paragraphs: ["Na seção Meus Pedidos você pode consultar o pagamento e as informações de envio disponíveis para sua compra. O rastreamento aparece quando for disponibilizado pela transportadora."],
  },
  "trabalhe-conosco": { title: "Trabalhe Conosco", subtitle: "Oportunidades na Toque de Mulher.", paragraphs: ["Não há vagas publicadas no momento."] },
  blog: { title: "Blog de Beleza", subtitle: "Nosso espaço de conteúdo.", paragraphs: ["Ainda não há artigos publicados."] },
};

export function InstitutionalPage() {
  const { slug = "" } = useParams();
  if (slug === "contato") return <ContactPage />;
  const page = pages[slug] ?? { title: "Conteúdo", subtitle: "Toque de Mulher", paragraphs: ["Esta seção ainda não possui conteúdo publicado."] };
  return <div className={styles.page}>
    <header className={styles.hero}><div className={styles.container}><div className={styles.heroInner}>
      <span className={styles.heroIconWrap}><BookOpen className={styles.heroIcon} /></span>
      <div className={styles.heroMeta}><p className={styles.heroEyebrow}>Institucional</p><h1 className={styles.heroTitle}>{page.title}</h1><p className={styles.heroSubtitle}>{page.subtitle}</p></div>
    </div></div></header>
    <main className={styles.section}><div className={styles.container}>
      <div className={styles.articleList}>{page.paragraphs.map(text => <p className={styles.articleText} key={text}>{text}</p>)}</div>
      <div className={styles.ctaBanner}><h2 className={styles.ctaBannerTitle}>Conte com a gente.</h2><div className={styles.ctaBannerActions}>
        {slug === "rastreamento" && <Link to={`${routes.profile}?tab=orders`} className={styles.ctaBannerPrimary}><Package size={18} /> Meus Pedidos</Link>}
        <Link to={storeContact.path} className={styles.ctaBannerPrimary}>Falar com atendimento</Link><Link to={routes.home} className={styles.ctaBannerSecondary}>Voltar à loja</Link>
      </div></div>
    </div></main>
  </div>;
}
