import { Link } from "react-router-dom";
import { storeContact } from "@/shared/config/store-contact";
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
    { question: "Quais formas de pagamento são aceitas?", answer: "As formas disponíveis e suas condições são exibidas na página de pagamento, antes de concluir a compra." },
    { question: "Como sei que meu pagamento foi confirmado?", answer: "Ao voltar para a loja, consultamos o status do pagamento. Se ainda estiver em processamento, você poderá verificar novamente ou acompanhar em Meus Pedidos." },
  ],
  shipping: [
    { question: "Qual o prazo de entrega?", answer: "Calcule o frete pelo CEP e escolha uma entrega. Cada opção mostra seu valor e prazo estimado em dias úteis após a postagem." },
    { question: "Como funciona o frete grátis?", answer: "Quando disponível, a opção gratuita aparece na cotação. Atingir o valor mínimo não confirma a entrega gratuita: consulte o CEP e escolha a opção indicada como Grátis." },
    { question: "Posso rastrear meu pedido?", answer: "Consulte Meus Pedidos no perfil. As informações de rastreamento aparecem quando disponibilizadas pela transportadora." },
  ],
  returns: [
    { question: "Como solicitar uma troca ou devolução?", answer: "Use o formulário de contato e informe o número do pedido e o motivo da solicitação. A equipe orientará os próximos passos." },
  ],
  support: [
    { question: "Como entrar em contato com o suporte?", answer: "Acesse Fale Conosco e envie sua mensagem pelo formulário. Aguarde a confirmação de envio na própria página." },
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
                Encontre respostas rápidas para suas dúvidas sobre compras,
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
              <div className={styles.heroCardTitle}>Atendimento rápido</div>
              <p className={styles.heroCardText}>
                Estamos sempre prontos para ajudar você a ter a melhor
                experiência.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <MessageCircle className={styles.contactIcon} aria-hidden="true" />
              <h3 className={styles.contactTitle}>Fale Conosco</h3>
              <p className={styles.contactText}>Envie sua dúvida ou solicitação pelo formulário.</p>
              <Button className={styles.contactButton} asChild><Link to={storeContact.path}>Enviar uma mensagem</Link></Button>
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
          <h2 className={styles.helpCtaTitle}>Ainda com dúvidas?</h2>
          <p className={styles.helpCtaText}>
            Envie sua dúvida para nossa equipe.
          </p>
          <a
            href={storeContact.path}
            className={styles.helpCtaButton}
          >
            Falar com atendimento
          </a>
        </div>
      </section>
    </div>
  );
}
