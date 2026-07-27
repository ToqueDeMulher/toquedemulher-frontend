import { Link, useParams } from "react-router-dom";
import {
  BookOpen,
  Briefcase,
  Heart,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  RefreshCcw,
  Search,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { routes } from "@/app/router/paths";
import styles from "./InstitutionalPage.module.css";

/* ─── Página: Política de Privacidade ────────────────────────────────────────── */
function PrivacyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroInner}>
            <span className={styles.heroIconWrap} aria-hidden="true">
              <Shield className={styles.heroIcon} />
            </span>
            <div className={styles.heroMeta}>
              <p className={styles.heroEyebrow}>Institucional</p>
              <h1 className={styles.heroTitle}>Política de Privacidade</h1>
              <p className={styles.heroSubtitle}>
                Saiba como coletamos, usamos e protegemos suas informações pessoais.
                Em conformidade com a LGPD (Lei nº 13.709/2018).
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.section}>
        <div className={styles.container}>
          <div className={styles.highlight}>
            <p className={styles.highlightText}>
              <strong>Última atualização: Janeiro de 2025.</strong> Esta política se aplica a todos os
              usuários da plataforma Toque de Mulher. Ao utilizar nosso site, você concorda com os
              termos aqui descritos.
            </p>
          </div>

          <div className={styles.articleList}>
            <article className={styles.articleSection}>
              <h2 className={styles.articleTitle}>
                <span className={styles.articleNumber}>1</span>
                Dados coletados
              </h2>
              <p className={styles.articleText}>
                Coletamos dados que você nos fornece diretamente ao criar sua conta, realizar uma
                compra ou entrar em contato com o suporte: nome completo, e-mail, CPF (para emissão
                de nota fiscal), endereço de entrega, telefone e dados de pagamento (processados de
                forma segura por nosso gateway certificado — nunca armazenamos o número completo do
                cartão). Também coletamos dados de navegação (cookies, endereço IP, páginas
                visitadas) para melhorar a experiência e exibir ofertas relevantes.
              </p>
            </article>

            <article className={styles.articleSection}>
              <h2 className={styles.articleTitle}>
                <span className={styles.articleNumber}>2</span>
                Finalidade do tratamento
              </h2>
              <p className={styles.articleText}>
                Utilizamos seus dados para: (i) processar e entregar seus pedidos; (ii) enviar
                confirmações, atualizações de rastreamento e comunicações relacionadas à compra;
                (iii) personalizar sua experiência de navegação e recomendações de produtos;
                (iv) enviar newsletters e ofertas (apenas se você consentiu); (v) cumprir
                obrigações legais e fiscais; (vi) prevenir fraudes e garantir a segurança da
                plataforma.
              </p>
            </article>

            <article className={styles.articleSection}>
              <h2 className={styles.articleTitle}>
                <span className={styles.articleNumber}>3</span>
                Compartilhamento de dados
              </h2>
              <p className={styles.articleText}>
                Seus dados podem ser compartilhados com: transportadoras (para entrega dos pedidos),
                gateways de pagamento (para processamento seguro das transações), plataformas de
                análise (Google Analytics, de forma anonimizada) e autoridades públicas quando
                exigido por lei. <strong>Não vendemos seus dados a terceiros.</strong>
              </p>
            </article>

            <article className={styles.articleSection}>
              <h2 className={styles.articleTitle}>
                <span className={styles.articleNumber}>4</span>
                Seus direitos (LGPD)
              </h2>
              <p className={styles.articleText}>
                Conforme a Lei Geral de Proteção de Dados, você tem direito a: confirmar a
                existência de tratamento; acessar seus dados; corrigir dados incompletos ou
                desatualizados; solicitar a anonimização, bloqueio ou eliminação de dados
                desnecessários; revogar consentimento; e se opor ao tratamento. Para exercer seus
                direitos, entre em contato com nosso DPO em{" "}
                <a
                  href="mailto:privacidade@toquedemulher.com"
                  className={styles.contactInfoLink}
                >
                  privacidade@toquedemulher.com
                </a>
                .
              </p>
            </article>

            <article className={styles.articleSection}>
              <h2 className={styles.articleTitle}>
                <span className={styles.articleNumber}>5</span>
                Cookies e rastreamento
              </h2>
              <p className={styles.articleText}>
                Utilizamos cookies essenciais (necessários para o funcionamento do site), cookies de
                desempenho (análise de tráfego) e cookies de personalização (preferências do
                usuário). Você pode gerenciar ou recusar cookies não essenciais nas configurações do
                seu navegador. A recusa de cookies essenciais pode afetar a funcionalidade do site.
              </p>
            </article>

            <article className={styles.articleSection}>
              <h2 className={styles.articleTitle}>
                <span className={styles.articleNumber}>6</span>
                Segurança e retenção
              </h2>
              <p className={styles.articleText}>
                Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso
                não autorizado, perda ou destruição (criptografia TLS, controle de acesso baseado em
                papéis, auditorias periódicas). Seus dados são retidos pelo período necessário para
                cumprir as finalidades descritas ou conforme exigido pela legislação fiscal e
                contábil (geralmente 5 anos após a última transação).
              </p>
            </article>

            <article className={styles.articleSection}>
              <h2 className={styles.articleTitle}>
                <span className={styles.articleNumber}>7</span>
                Contato e alterações
              </h2>
              <p className={styles.articleText}>
                Esta política pode ser atualizada periodicamente. Notificaremos mudanças
                significativas por e-mail ou banner no site. Em caso de dúvidas, entre em contato
                com nosso Encarregado de Proteção de Dados:{" "}
                <a
                  href="mailto:privacidade@toquedemulher.com"
                  className={styles.contactInfoLink}
                >
                  privacidade@toquedemulher.com
                </a>
                .
              </p>
            </article>
          </div>

          <div className={styles.ctaBanner}>
            <h2 className={styles.ctaBannerTitle}>Tem dúvidas sobre seus dados?</h2>
            <p className={styles.ctaBannerText}>
              Nossa equipe de privacidade responde em até 15 dias úteis.
            </p>
            <div className={styles.ctaBannerActions}>
              <a href="mailto:privacidade@toquedemulher.com" className={styles.ctaBannerPrimary}>
                Falar com o DPO
              </a>
              <Link to={routes.home} className={styles.ctaBannerSecondary}>
                Voltar à loja
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Página: Termos de Uso ─────────────────────────────────────────────────── */
function TermsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroInner}>
            <span className={styles.heroIconWrap} aria-hidden="true">
              <BookOpen className={styles.heroIcon} />
            </span>
            <div className={styles.heroMeta}>
              <p className={styles.heroEyebrow}>Institucional</p>
              <h1 className={styles.heroTitle}>Termos de Uso</h1>
              <p className={styles.heroSubtitle}>
                Ao utilizar a plataforma Toque de Mulher, você concorda com estes termos.
                Leia com atenção antes de realizar compras.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.section}>
        <div className={styles.container}>
          <div className={styles.highlight}>
            <p className={styles.highlightText}>
              <strong>Versão vigente: Janeiro de 2025.</strong> Estes termos regulam o uso do site,
              aplicativo e demais serviços da Toque de Mulher. O uso implica aceitação integral.
            </p>
          </div>

          <div className={styles.articleList}>
            <article className={styles.articleSection}>
              <h2 className={styles.articleTitle}>
                <span className={styles.articleNumber}>1</span>
                Aceitação dos termos
              </h2>
              <p className={styles.articleText}>
                Ao acessar ou utilizar a plataforma Toque de Mulher, você declara ter lido,
                compreendido e concordado com estes Termos de Uso. Se não concordar com qualquer
                disposição, não utilize os serviços. Você deve ter pelo menos 18 anos ou contar com
                autorização de um responsável legal para realizar compras.
              </p>
            </article>

            <article className={styles.articleSection}>
              <h2 className={styles.articleTitle}>
                <span className={styles.articleNumber}>2</span>
                Cadastro e conta
              </h2>
              <p className={styles.articleText}>
                Para realizar compras, você precisa criar uma conta com informações verdadeiras,
                precisas e atualizadas. Você é responsável pela confidencialidade de suas
                credenciais de acesso e por todas as atividades realizadas em sua conta.
                Notifique-nos imediatamente em caso de uso não autorizado em{" "}
                <a href="mailto:suporte@toquedemulher.com" className={styles.contactInfoLink}>
                  suporte@toquedemulher.com
                </a>
                .
              </p>
            </article>

            <article className={styles.articleSection}>
              <h2 className={styles.articleTitle}>
                <span className={styles.articleNumber}>3</span>
                Produtos e preços
              </h2>
              <p className={styles.articleText}>
                Nos esforçamos para manter as informações de produtos e preços atualizadas.
                Reservamo-nos o direito de corrigir erros, cancelar pedidos com preços incorretos
                (com reembolso integral) e descontinuar produtos sem aviso prévio. Promoções e
                descontos têm validade e condições específicas exibidas em cada oferta. Preços em
                reais (BRL) e válidos apenas para o território nacional.
              </p>
            </article>

            <article className={styles.articleSection}>
              <h2 className={styles.articleTitle}>
                <span className={styles.articleNumber}>4</span>
                Pedidos e pagamento
              </h2>
              <p className={styles.articleText}>
                Um pedido é considerado confirmado após a aprovação do pagamento. Aceitamos cartões
                de crédito, débito, PIX e PayPal. O desconto de 5% para pagamento via PIX é
                aplicado automaticamente. Parcelamento em até 6x sem juros para compras acima de
                R$ 100 no cartão de crédito. Em caso de suspeita de fraude, podemos solicitar
                documentação adicional ou cancelar o pedido.
              </p>
            </article>

            <article className={styles.articleSection}>
              <h2 className={styles.articleTitle}>
                <span className={styles.articleNumber}>5</span>
                Entrega e responsabilidade
              </h2>
              <p className={styles.articleText}>
                Entregamos para todo o Brasil. Os prazos são estimados e podem sofrer variações por
                fatores externos (greves, desastres naturais, falhas de transportadoras). Não nos
                responsabilizamos por atrasos causados por informações de endereço incorretas
                fornecidas pelo usuário. Após a entrega, o risco de perda ou dano passa ao
                comprador.
              </p>
            </article>

            <article className={styles.articleSection}>
              <h2 className={styles.articleTitle}>
                <span className={styles.articleNumber}>6</span>
                Propriedade intelectual
              </h2>
              <p className={styles.articleText}>
                Todo o conteúdo da plataforma (textos, imagens, logos, design, código) é de
                propriedade da Toque de Mulher ou licenciado por terceiros. É proibida a reprodução,
                distribuição ou criação de obras derivadas sem autorização expressa por escrito.
              </p>
            </article>

            <article className={styles.articleSection}>
              <h2 className={styles.articleTitle}>
                <span className={styles.articleNumber}>7</span>
                Limitação de responsabilidade
              </h2>
              <p className={styles.articleText}>
                Na extensão permitida pela lei, a Toque de Mulher não será responsável por danos
                indiretos, incidentais ou consequentes decorrentes do uso da plataforma. Nossa
                responsabilidade total é limitada ao valor do pedido que deu origem à reclamação.
              </p>
            </article>

            <article className={styles.articleSection}>
              <h2 className={styles.articleTitle}>
                <span className={styles.articleNumber}>8</span>
                Foro e lei aplicável
              </h2>
              <p className={styles.articleText}>
                Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de
                São Paulo/SP para dirimir eventuais conflitos, com renúncia de qualquer outro, por
                mais privilegiado que seja.
              </p>
            </article>
          </div>

          <div className={styles.ctaBanner}>
            <h2 className={styles.ctaBannerTitle}>Alguma dúvida sobre os termos?</h2>
            <p className={styles.ctaBannerText}>Nossa central de ajuda esclarece tudo.</p>
            <div className={styles.ctaBannerActions}>
              <Link to={routes.help} className={styles.ctaBannerPrimary}>
                Central de ajuda
              </Link>
              <Link to={routes.home} className={styles.ctaBannerSecondary}>
                Voltar à loja
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Página: Trocas e Devoluções ───────────────────────────────────────────── */
function ReturnsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroInner}>
            <span className={styles.heroIconWrap} aria-hidden="true">
              <RefreshCcw className={styles.heroIcon} />
            </span>
            <div className={styles.heroMeta}>
              <p className={styles.heroEyebrow}>Atendimento</p>
              <h1 className={styles.heroTitle}>Trocas e Devoluções</h1>
              <p className={styles.heroSubtitle}>
                Sua satisfação é nossa prioridade. Entenda como funciona nossa política
                de trocas e devoluções de forma simples e rápida.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Como funciona o processo</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <p className={styles.stepTitle}>Solicite online</p>
              <p className={styles.stepText}>
                Acesse Minha Conta → Pedidos → selecione o item e clique em
                "Solicitar devolução". Descreva o motivo.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <p className={styles.stepTitle}>Envie o produto</p>
              <p className={styles.stepText}>
                Você receberá as instruções de envio por e-mail em até 1 dia
                útil. Embale o produto na embalagem original.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <p className={styles.stepTitle}>Reembolso ou troca</p>
              <p className={styles.stepText}>
                Após recebermos e avaliarmos o produto, reembolsamos em até
                7 dias úteis ou enviamos o novo item.
              </p>
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.policyGrid}>
            <div className={styles.policyCard}>
              <h3 className={styles.policyCardTitle}>
                <RefreshCcw className={styles.policyCardIcon} aria-hidden="true" />
                Quando posso trocar ou devolver?
              </h3>
              <ul className={styles.policyList}>
                {[
                  "Produto com defeito de fabricação",
                  "Item diferente do pedido (erro no envio)",
                  "Produto danificado na entrega",
                  "Desistência em até 7 dias (CDC) — produto sem uso",
                  "Insatisfação — até 30 dias, produto intacto",
                ].map((item) => (
                  <li key={item} className={styles.policyListItem}>
                    <span className={styles.policyListDot} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.policyCard}>
              <h3 className={styles.policyCardTitle}>
                <HelpCircle className={styles.policyCardIcon} aria-hidden="true" />
                Não é elegível para devolução
              </h3>
              <ul className={styles.policyList}>
                {[
                  "Produtos abertos ou com lacre violado (exceto defeito)",
                  "Itens de higiene íntima já utilizados",
                  "Produtos personalizados ou sob encomenda",
                  "Prazo de 30 dias já expirado",
                  "Itens com evidência de mau uso",
                ].map((item) => (
                  <li key={item} className={styles.policyListItem}>
                    <span className={styles.policyListDot} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.policyCard}>
              <h3 className={styles.policyCardTitle}>
                <Package className={styles.policyCardIcon} aria-hidden="true" />
                Frete da devolução
              </h3>
              <ul className={styles.policyList}>
                {[
                  "Defeito ou erro nosso: frete por nossa conta",
                  "Desistência ou insatisfação: frete do cliente",
                  "Etiqueta pré-paga enviada por e-mail (quando aplicável)",
                  "Não aceite devoluções sem autorização prévia",
                ].map((item) => (
                  <li key={item} className={styles.policyListItem}>
                    <span className={styles.policyListDot} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.policyCard}>
              <h3 className={styles.policyCardTitle}>
                <Zap className={styles.policyCardIcon} aria-hidden="true" />
                Prazos e reembolso
              </h3>
              <ul className={styles.policyList}>
                {[
                  "Prazo para solicitar: até 30 dias após o recebimento",
                  "Análise do produto: até 3 dias úteis após chegada",
                  "Reembolso no cartão: até 2 faturas subsequentes",
                  "Reembolso via PIX: até 7 dias úteis após aprovação",
                  "Troca: novo envio em até 5 dias úteis",
                ].map((item) => (
                  <li key={item} className={styles.policyListItem}>
                    <span className={styles.policyListDot} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.ctaBanner}>
            <h2 className={styles.ctaBannerTitle}>Precisa abrir uma solicitação?</h2>
            <p className={styles.ctaBannerText}>
              Acesse sua conta ou fale com nosso suporte agora.
            </p>
            <div className={styles.ctaBannerActions}>
              <Link to={routes.profile} className={styles.ctaBannerPrimary}>
                Minha conta
              </Link>
              <Link to={routes.help} className={styles.ctaBannerSecondary}>
                Central de ajuda
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Página: Trabalhe Conosco ──────────────────────────────────────────────── */
function CareersPage() {
  const jobs = [
    {
      title: "Analista de Marketing Digital",
      type: "CLT",
      location: "Remoto",
      area: "Marketing",
    },
    {
      title: "Desenvolvedora Frontend (React)",
      type: "PJ",
      location: "Híbrido · São Paulo",
      area: "Tech",
    },
    {
      title: "Compradora de Beleza",
      type: "CLT",
      location: "São Paulo",
      area: "Comercial",
    },
    {
      title: "Especialista em CX (Customer Experience)",
      type: "CLT",
      location: "Remoto",
      area: "Atendimento",
    },
    {
      title: "Fotógrafa de Produtos",
      type: "PJ / Freelance",
      location: "São Paulo",
      area: "Criação",
    },
  ];

  const perks = [
    { icon: Heart, title: "Plano de saúde", text: "Sulamerica com coparticipação" },
    { icon: Sparkles, title: "Day off de aniversário", text: "Seu dia, sua folga" },
    { icon: Star, title: "Desconto de 30%", text: "Em toda a loja para funcionárias" },
    { icon: Zap, title: "Bônus por metas", text: "Programa semestral de resultados" },
    { icon: BookOpen, title: "Aprendizado contínuo", text: "Budget anual para cursos" },
    { icon: Users, title: "Ambiente inclusivo", text: "Diversidade e equidade real" },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroInner}>
            <span className={styles.heroIconWrap} aria-hidden="true">
              <Briefcase className={styles.heroIcon} />
            </span>
            <div className={styles.heroMeta}>
              <p className={styles.heroEyebrow}>Carreiras</p>
              <h1 className={styles.heroTitle}>Trabalhe Conosco</h1>
              <p className={styles.heroSubtitle}>
                Faça parte de um time apaixonado por beleza, tecnologia e experiências
                incríveis para as clientes. Aqui seu trabalho importa de verdade.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Por que trabalhar com a gente?</h2>
          <p className={styles.sectionText}>
            Somos uma startup de beleza que mistura paixão por produtos com tecnologia de ponta.
            Aqui você tem autonomia, propósito e oportunidade de crescer junto com a empresa.
          </p>

          <div className={styles.cultureGrid} style={{ marginTop: "1.5rem" }}>
            {perks.map(({ icon: Icon, title, text }) => (
              <div key={title} className={styles.cultureCard}>
                <div className={styles.cultureIconWrap}>
                  <Icon className={styles.cultureIcon} aria-hidden="true" />
                </div>
                <p className={styles.cultureTitle}>{title}</p>
                <p className={styles.cultureText}>{text}</p>
              </div>
            ))}
          </div>

          <hr className={styles.divider} />

          <h2 className={styles.sectionTitle}>Vagas abertas</h2>
          <p className={styles.sectionText}>
            {jobs.length} posições disponíveis — candidatura 100% online.
          </p>

          <div className={styles.jobList}>
            {jobs.map((job) => (
              <div key={job.title} className={styles.jobCard}>
                <div className={styles.jobInfo}>
                  <p className={styles.jobTitle}>{job.title}</p>
                  <div className={styles.jobMeta}>
                    <span className={styles.jobTag}>{job.area}</span>
                    <span className={styles.jobTagSecondary}>{job.type}</span>
                    <span className={styles.jobTagSecondary}>
                      <MapPin
                        style={{ display: "inline", width: 12, height: 12, marginRight: 3 }}
                        aria-hidden="true"
                      />
                      {job.location}
                    </span>
                  </div>
                </div>
                <a
                  href={`mailto:rh@toquedemulher.com?subject=Candidatura: ${encodeURIComponent(job.title)}`}
                  className={styles.jobApply}
                >
                  Candidatar-se
                </a>
              </div>
            ))}
          </div>

          <div className={styles.ctaBanner} style={{ marginTop: "2.5rem" }}>
            <h2 className={styles.ctaBannerTitle}>Não encontrou sua área?</h2>
            <p className={styles.ctaBannerText}>
              Envie seu currículo para o banco de talentos — entramos em contato quando
              surgir uma vaga alinhada ao seu perfil.
            </p>
            <div className={styles.ctaBannerActions}>
              <a
                href="mailto:rh@toquedemulher.com?subject=Banco de Talentos"
                className={styles.ctaBannerPrimary}
              >
                Enviar currículo
              </a>
              <Link to={routes.about} className={styles.ctaBannerSecondary}>
                Sobre a empresa
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Página: Fale Conosco ──────────────────────────────────────────────────── */
function ContactPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroInner}>
            <span className={styles.heroIconWrap} aria-hidden="true">
              <MessageCircle className={styles.heroIcon} />
            </span>
            <div className={styles.heroMeta}>
              <p className={styles.heroEyebrow}>Atendimento</p>
              <h1 className={styles.heroTitle}>Fale Conosco</h1>
              <p className={styles.heroSubtitle}>
                Precisa de ajuda com seu pedido, tem uma sugestão ou simplesmente
                quer falar com a gente? Estamos aqui!
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.section}>
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            <div className={styles.contactForm}>
              <h2 className={styles.contactFormTitle}>Envie uma mensagem</h2>

              <div className={styles.formGroup}>
                <label htmlFor="contact-name" className={styles.formLabel}>Nome completo</label>
                <input
                  id="contact-name"
                  type="text"
                  className={styles.formInput}
                  placeholder="Seu nome"
                  autoComplete="name"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact-email" className={styles.formLabel}>E-mail</label>
                <input
                  id="contact-email"
                  type="email"
                  className={styles.formInput}
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact-subject" className={styles.formLabel}>Assunto</label>
                <select id="contact-subject" className={styles.formSelect}>
                  <option value="">Selecione o assunto</option>
                  <option value="pedido">Problema com pedido</option>
                  <option value="troca">Troca ou devolução</option>
                  <option value="pagamento">Pagamento</option>
                  <option value="produto">Dúvida sobre produto</option>
                  <option value="elogio">Elogio</option>
                  <option value="sugestao">Sugestão</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact-message" className={styles.formLabel}>Mensagem</label>
                <textarea
                  id="contact-message"
                  className={styles.formTextarea}
                  placeholder="Descreva sua dúvida ou comentário em detalhes..."
                />
              </div>

              <button
                type="button"
                className={styles.formSubmit}
                onClick={() => {
                  const el = document.getElementById("contact-name") as HTMLInputElement | null;
                  if (!el?.value) return;
                  alert("Mensagem enviada com sucesso! Retornaremos em até 24h úteis.");
                }}
              >
                Enviar mensagem
              </button>
            </div>

            <aside className={styles.contactInfo}>
              <div className={styles.contactInfoCard}>
                <Mail className={styles.contactInfoIcon} aria-hidden="true" />
                <p className={styles.contactInfoTitle}>E-mail</p>
                <p className={styles.contactInfoText}>
                  <a href="mailto:contato@toquedemulher.com" className={styles.contactInfoLink}>
                    contato@toquedemulher.com
                  </a>
                </p>
                <p className={styles.contactInfoText} style={{ marginTop: "0.25rem" }}>
                  Resposta em até 24h úteis
                </p>
              </div>

              <div className={styles.contactInfoCard}>
                <Phone className={styles.contactInfoIcon} aria-hidden="true" />
                <p className={styles.contactInfoTitle}>Telefone / WhatsApp</p>
                <p className={styles.contactInfoText}>
                  <a href="tel:11933333333" className={styles.contactInfoLink}>
                    (11) 93333-3333
                  </a>
                </p>
                <p className={styles.contactInfoText} style={{ marginTop: "0.25rem" }}>
                  Seg a Sex, das 9h às 18h
                </p>
              </div>

              <div className={styles.contactInfoCard}>
                <MapPin className={styles.contactInfoIcon} aria-hidden="true" />
                <p className={styles.contactInfoTitle}>Endereço</p>
                <p className={styles.contactInfoText}>
                  Av. Paulista, 1374 — 14º andar
                  <br />
                  Bela Vista, São Paulo/SP
                  <br />
                  CEP 01310-100
                </p>
              </div>

              <div className={styles.contactInfoCard}>
                <HelpCircle className={styles.contactInfoIcon} aria-hidden="true" />
                <p className={styles.contactInfoTitle}>Dúvidas frequentes</p>
                <p className={styles.contactInfoText}>
                  Antes de enviar uma mensagem, confira nossa{" "}
                  <Link to={routes.help} className={styles.contactInfoLink}>
                    Central de Ajuda
                  </Link>
                  . A maioria das dúvidas é respondida lá.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Página: Blog ──────────────────────────────────────────────────────────── */
function BlogPage() {
  const articles = [
    {
      id: "1",
      image:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=350&fit=crop",
      category: "Skincare",
      title: "Rotina de skincare para iniciantes: por onde começar?",
      excerpt:
        "Entenda os passos essenciais — limpeza, hidratação e proteção solar — para uma pele mais saudável em apenas semanas.",
      date: "12 mai 2025",
      readTime: "5 min",
    },
    {
      id: "2",
      image:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=350&fit=crop",
      category: "Maquiagem",
      title: "Tendências de maquiagem para 2025: cores que dominam",
      excerpt:
        "Do rosa maçã ao terracota, descubra as paletas mais pedidas das passarelas e como adaptá-las ao seu dia a dia.",
      date: "5 mai 2025",
      readTime: "4 min",
    },
    {
      id: "3",
      image:
        "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=600&h=350&fit=crop",
      category: "Cabelos",
      title: "Como revitalizar cabelos danificados com tratamentos caseiros",
      excerpt:
        "Máscara de abacate, óleo de argan, leave-in: aprenda receitas simples e compre os produtos certos para repor a nutrição.",
      date: "28 abr 2025",
      readTime: "6 min",
    },
    {
      id: "4",
      image:
        "https://images.unsplash.com/photo-1561462125-de5ae0a8c6e2?w=600&h=350&fit=crop",
      category: "Corpo",
      title: "Ritual de autocuidado: transforme seu banho em experiência spa",
      excerpt:
        "Esfoliação, óleos corporais e hidratação profunda — um guia completo para uma rotina corporal que cuida de dentro para fora.",
      date: "20 abr 2025",
      readTime: "5 min",
    },
    {
      id: "5",
      image:
        "https://images.unsplash.com/photo-1600857062241-98e5dba7f025?w=600&h=350&fit=crop",
      category: "Perfumes",
      title: "Como escolher o perfume certo para cada ocasião",
      excerpt:
        "Florais, amadeirados, cítricos ou orientais? Entenda as famílias olfativas e monte uma coleção de fragrâncias para cada momento.",
      date: "15 abr 2025",
      readTime: "7 min",
    },
    {
      id: "6",
      image:
        "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&h=350&fit=crop",
      category: "Dicas",
      title: "Os 10 produtos de beleza que valem cada centavo em 2025",
      excerpt:
        "Nossa curadoria dos itens com melhor custo-benefício — testados e aprovados pelas nossas clientes com avaliação 5 estrelas.",
      date: "8 abr 2025",
      readTime: "8 min",
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroInner}>
            <span className={styles.heroIconWrap} aria-hidden="true">
              <BookOpen className={styles.heroIcon} />
            </span>
            <div className={styles.heroMeta}>
              <p className={styles.heroEyebrow}>Conteúdo</p>
              <h1 className={styles.heroTitle}>Blog de Beleza</h1>
              <p className={styles.heroSubtitle}>
                Dicas, tendências, tutoriais e tudo o que você precisa para elevar
                sua rotina de beleza ao próximo nível.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Artigos recentes</h2>
          <div className={styles.blogGrid}>
            {articles.map((article) => (
              <article key={article.id} className={styles.blogCard}>
                <img
                  src={article.image}
                  alt={article.title}
                  className={styles.blogImage}
                  loading="lazy"
                />
                <div className={styles.blogBody}>
                  <span className={styles.blogCategory}>{article.category}</span>
                  <h3 className={styles.blogTitle}>{article.title}</h3>
                  <p className={styles.blogExcerpt}>{article.excerpt}</p>
                  <div className={styles.blogMeta}>
                    <span>{article.date} · {article.readTime} de leitura</span>
                    <Link to={routes.home} className={styles.blogReadMore}>
                      Ler mais →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.ctaBanner} style={{ marginTop: "3rem" }}>
            <h2 className={styles.ctaBannerTitle}>Receba dicas toda semana</h2>
            <p className={styles.ctaBannerText}>
              Inscreva-se na newsletter e receba as melhores novidades de beleza direto
              no seu e-mail.
            </p>
            <div className={styles.ctaBannerActions}>
              <Link to={routes.home} className={styles.ctaBannerPrimary}>
                Explorar a loja
              </Link>
              <Link to={routes.help} className={styles.ctaBannerSecondary}>
                Central de ajuda
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Página: Rastreamento ──────────────────────────────────────────────────── */
function TrackingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroInner}>
            <span className={styles.heroIconWrap} aria-hidden="true">
              <Search className={styles.heroIcon} />
            </span>
            <div className={styles.heroMeta}>
              <p className={styles.heroEyebrow}>Pedidos</p>
              <h1 className={styles.heroTitle}>Rastreamento de Pedido</h1>
              <p className={styles.heroSubtitle}>
                Acompanhe o status do seu pedido em tempo real e saiba exatamente
                onde seu pacote está.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.section}>
        <div className={styles.container}>
          <div className={styles.comingSoonCard}>
            <Package className={styles.comingSoonIcon} aria-hidden="true" />
            <h2 className={styles.comingSoonTitle}>Acompanhe pelo seu perfil</h2>
            <p className={styles.comingSoonText}>
              O painel de rastreamento completo fica na seção <strong>Meus Pedidos</strong> da sua conta.
              Lá você vê o status atualizado, código de rastreio e histórico de todos os seus pedidos.
            </p>
            <div className={styles.comingSoonActions}>
              <Link to={routes.profile} className={styles.comingSoonPrimary}>
                Acessar Minha Conta
              </Link>
              <Link to={routes.help} className={styles.comingSoonSecondary}>
                Preciso de ajuda
              </Link>
            </div>
          </div>

          <div className={styles.stepsGrid} style={{ marginTop: "2rem" }}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <p className={styles.stepTitle}>Pedido confirmado</p>
              <p className={styles.stepText}>
                Você recebe e-mail com número do pedido e resumo da compra após aprovação do pagamento.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <p className={styles.stepTitle}>Em separação</p>
              <p className={styles.stepText}>
                Nossa equipe separa, embala e despacha seu pedido. Prazo médio: 1–2 dias úteis.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <p className={styles.stepTitle}>A caminho!</p>
              <p className={styles.stepText}>
                E-mail com código de rastreio é enviado. Acompanhe diretamente no site da transportadora.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Página genérica (pedidos, desejos e slugs desconhecidos) ─────────────── */
function GenericComingSoonPage({ title, description, icon: Icon }: {
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroInner}>
            <span className={styles.heroIconWrap} aria-hidden="true">
              <Icon className={styles.heroIcon} />
            </span>
            <div className={styles.heroMeta}>
              <p className={styles.heroEyebrow}>Institucional</p>
              <h1 className={styles.heroTitle}>{title}</h1>
              <p className={styles.heroSubtitle}>{description}</p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.section}>
        <div className={styles.container}>
          <div className={styles.comingSoonCard}>
            <Icon className={styles.comingSoonIcon} aria-hidden="true" />
            <h2 className={styles.comingSoonTitle}>Em breve</h2>
            <p className={styles.comingSoonText}>
              Estamos preparando esta seção com muito cuidado para oferecer a melhor experiência possível.
              Enquanto isso, navegue pela loja ou entre em contato com nossa equipe.
            </p>
            <div className={styles.comingSoonActions}>
              <Link to={routes.home} className={styles.comingSoonPrimary}>
                Voltar para a loja
              </Link>
              <Link to={routes.help} className={styles.comingSoonSecondary}>
                Central de ajuda
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Mapa de páginas ──────────────────────────────────────────────────────── */
function formatFallbackTitle(slug?: string) {
  if (!slug) return "Conteúdo";
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function InstitutionalPage() {
  const { slug } = useParams();

  switch (slug) {
    case "privacidade":
      return <PrivacyPage />;
    case "termos":
      return <TermsPage />;
    case "trocas":
      return <ReturnsPage />;
    case "trabalhe-conosco":
      return <CareersPage />;
    case "contato":
      return <ContactPage />;
    case "blog":
      return <BlogPage />;
    case "rastreamento":
      return <TrackingPage />;
    case "pedidos":
      return (
        <GenericComingSoonPage
          title="Meus Pedidos"
          description="Acompanhe o histórico completo de todas as suas compras, notas fiscais e rastreamentos."
          icon={Package}
        />
      );
    case "desejos":
      return (
        <GenericComingSoonPage
          title="Lista de Desejos"
          description="Salve seus produtos favoritos para comprar depois e receba alertas de promoção."
          icon={Heart}
        />
      );
    default:
      return (
        <GenericComingSoonPage
          title={formatFallbackTitle(slug)}
          description="Essa seção ainda está sendo preparada. Volte em breve."
          icon={Sparkles}
        />
      );
  }
}
