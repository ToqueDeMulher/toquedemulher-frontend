import { useState } from "react";
import { Search, Mail, Phone, MessageCircle } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import styles from "./HelpPage.module.css";

const faqs = {
  payments: [
    {
      question: "Quais formas de pagamento sao aceitas?",
      answer:
        "Aceitamos cartoes de credito (Visa, Mastercard, Elo, American Express), PIX e PayPal. Para cartao de credito, oferecemos parcelamento em ate 6x sem juros para compras acima de R$ 100.",
    },
    {
      question: "E seguro comprar no site?",
      answer:
        "Sim! Nosso site utiliza certificado SSL e todas as transacoes sao processadas por meio de gateways de pagamento seguros e certificados.",
    },
    {
      question: "O desconto do PIX e automatico?",
      answer:
        "Sim! Ao selecionar PIX como forma de pagamento, o desconto de 5% e aplicado automaticamente no valor total.",
    },
    {
      question: "Posso parcelar no PIX?",
      answer:
        "Nao. O PIX e uma forma de pagamento a vista. Para parcelamento, utilize cartao de credito.",
    },
  ],
  shipping: [
    {
      question: "Qual o prazo de entrega?",
      answer:
        "O prazo de entrega varia de acordo com sua regiao e e calculado no checkout. Geralmente, entregamos em 5-10 dias uteis para as regioes Sul e Sudeste, e 10-15 dias uteis para as demais regioes.",
    },
    {
      question: "Como funciona o frete gratis?",
      answer:
        "Oferecemos frete gratis para todo o Brasil em compras acima de R$ 150,00. O desconto e aplicado automaticamente no carrinho quando o valor minimo e atingido.",
    },
    {
      question: "Posso rastrear meu pedido?",
      answer:
        "Sim! Assim que seu pedido for enviado, voce recebera um codigo de rastreamento por e-mail. Voce tambem pode acompanhar o status na secao 'Meus Pedidos' do seu perfil.",
    },
    {
      question: "O que fazer se o produto nao chegar?",
      answer:
        "Se o prazo de entrega expirar, entre em contato com nossa central de atendimento. Verificaremos a situacao com a transportadora e tomaremos as medidas necessarias.",
    },
  ],
  returns: [
    {
      question: "Qual o prazo para trocas e devolucoes?",
      answer:
        "Voce tem ate 30 dias apos o recebimento do produto para solicitar troca ou devolucao. O produto deve estar sem uso, na embalagem original e com a nota fiscal.",
    },
    {
      question: "Como solicitar uma troca ou devolucao?",
      answer:
        "Acesse 'Minha Conta' > 'Pedidos' > Selecione o pedido > Clique em 'Solicitar Devolucao'. Nossa equipe analisara o pedido e enviara instrucoes por e-mail.",
    },
    {
      question: "Quem paga o frete da devolucao?",
      answer:
        "Em caso de defeito ou erro no pedido, nos arcamos com o frete. Para trocas por motivo pessoal, o frete e de responsabilidade do cliente.",
    },
  ],
  support: [
    {
      question: "Como entrar em contato com o suporte?",
      answer:
        "Voce pode entrar em contato via chat, e-mail ou telefone. Nosso atendimento funciona de segunda a sexta, das 9h as 18h.",
    },
    {
      question: "Quanto tempo leva para responder?",
      answer:
        "Nosso tempo medio de resposta e de ate 24 horas uteis.",
    },
    {
      question: "Posso alterar meu pedido apos confirmar?",
      answer:
        "Depende do status do pedido. Se ele ainda nao foi enviado, entre em contato rapidamente com nossa central para tentarmos ajustar.",
    },
  ],
};

export function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const faqEntries = Object.entries(faqs).map(([key, questions]) => ({
    key,
    questions: normalizedSearch
      ? questions.filter(
          (faq) =>
            faq.question.toLowerCase().includes(normalizedSearch) ||
            faq.answer.toLowerCase().includes(normalizedSearch),
        )
      : questions,
  }));
  const totalResults = faqEntries.reduce(
    (total, group) => total + group.questions.length,
    0,
  );

  return (
    <div className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <div className={styles.heroBadge}>Ajuda</div>
              <h1 className={styles.heroTitle}>Como podemos ajudar?</h1>
              <p className={styles.heroText}>
                Encontre respostas rapidas para suas duvidas sobre compras,
                pagamentos, entregas e muito mais.
              </p>
              <div className={styles.searchBox} role="search">
                <label htmlFor="help-search" className="sr-only">
                  Buscar dúvidas frequentes por palavra-chave
                </label>
                <Search className={styles.searchIcon} aria-hidden="true" />
                <Input
                  id="help-search"
                  placeholder="Busque por palavras-chave..."
                  className={styles.searchInput}
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-describedby="help-search-results"
                />
              </div>
              <p id="help-search-results" className="sr-only" aria-live="polite">
                {normalizedSearch
                  ? `${totalResults} resultado${totalResults === 1 ? "" : "s"} encontrado${
                      totalResults === 1 ? "" : "s"
                    } para a busca atual`
                  : "Digite uma palavra-chave para filtrar as perguntas frequentes"}
              </p>
            </div>
            <div className={styles.heroCard}>
              <div className={styles.heroCardTitle}>Atendimento rapido</div>
              <p className={styles.heroCardText}>
                Estamos sempre prontos para ajudar voce a ter a melhor
                experiencia.
              </p>
              <div className={styles.heroStats}>
                <div>
                  <p className={styles.heroStatValue}>24h</p>
                  <p className={styles.heroStatLabel}>Tempo medio de resposta</p>
                </div>
                <div>
                  <p className={styles.heroStatValue}>4.9/5</p>
                  <p className={styles.heroStatLabel}>Satisfacao das clientes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <Mail className={styles.contactIcon} aria-hidden="true" />
              <h3 className={styles.contactTitle}>E-mail</h3>
              <p className={styles.contactText}>
                <a href="mailto:contato@toquedemulher.com">
                  contato@toquedemulher.com
                </a>
              </p>
              <Badge className={styles.contactBadge}>Resposta em 24h</Badge>
            </div>
            <div className={styles.contactCard}>
              <Phone className={styles.contactIcon} aria-hidden="true" />
              <h3 className={styles.contactTitle}>Telefone</h3>
              <p className={styles.contactText}>
                <a href="tel:1133333333">(11) 3333-3333</a>
              </p>
              <Badge className={styles.contactBadge}>Seg a Sex 9h-18h</Badge>
            </div>
            <div className={styles.contactCard}>
              <MessageCircle className={styles.contactIcon} aria-hidden="true" />
              <h3 className={styles.contactTitle}>Chat ao vivo</h3>
              <p className={styles.contactText}>Inicie uma conversa agora</p>
              <Button size="lg" variant="default" className={styles.contactButton} asChild>
                <a href="mailto:contato@toquedemulher.com?subject=Atendimento%20via%20chat">
                  Iniciar chat
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.faqCard}>
            <h2 className={styles.faqTitle}>Perguntas Frequentes</h2>
            <Tabs defaultValue="payments" className={styles.tabsRoot}>
              <TabsList className={styles.tabsList}>
                <TabsTrigger value="payments">Pagamentos</TabsTrigger>
                <TabsTrigger value="shipping">Entrega</TabsTrigger>
                <TabsTrigger value="returns">Trocas</TabsTrigger>
                <TabsTrigger value="support">Suporte</TabsTrigger>
              </TabsList>

              {faqEntries.map(({ key, questions }) => (
                <TabsContent key={key} value={key}>
                  <Accordion type="single" collapsible className={styles.accordion}>
                    {questions.length > 0 ? (
                      questions.map((faq, index) => (
                        <AccordionItem key={index} value={`${key}-${index}`}>
                          <AccordionTrigger className={styles.accordionTrigger}>
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className={styles.accordionContent}>
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))
                    ) : (
                      <p className={styles.emptyState}>
                        Nenhum resultado encontrado nesta categoria.
                      </p>
                    )}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      <section className={styles.helpCta}>
        <div className={styles.container}>
          <h2 className={styles.helpCtaTitle}>Ainda com duvidas?</h2>
          <p className={styles.helpCtaText}>
            Nossa equipe esta pronta para te ajudar a qualquer momento.
          </p>
          <Button size="lg" variant="outline" className={styles.helpCtaButton} asChild>
            <a href="mailto:contato@toquedemulher.com?subject=Preciso%20de%20ajuda">
              Falar com atendimento
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
