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
      question: "Quais formas de pagamento são aceitas?",
      answer:
        "Aceitamos cartões de crédito (Visa, Mastercard, Elo e American Express), PIX e PayPal. Para cartão de crédito, oferecemos parcelamento em até 6x sem juros para compras acima de R$ 100.",
    },
    {
      question: "É seguro comprar no site?",
      answer:
        "Sim! Nosso site utiliza certificado SSL, e todas as transações são processadas por meio de gateways de pagamento seguros e certificados.",
    },
    {
      question: "O desconto do PIX é automático?",
      answer:
        "Sim! Ao selecionar PIX como forma de pagamento, o desconto de 5% é aplicado automaticamente no valor total.",
    },
    {
      question: "Posso parcelar no PIX?",
      answer:
        "Não. O PIX é uma forma de pagamento à vista. Para parcelamento, utilize cartão de crédito.",
    },
  ],
  shipping: [
    {
      question: "Qual o prazo de entrega?",
      answer:
        "O prazo de entrega varia de acordo com sua região e é calculado no checkout. Geralmente, entregamos em 5 a 10 dias úteis para as regiões Sul e Sudeste, e de 10 a 15 dias úteis para as demais regiões.",
    },
    {
      question: "Como funciona o frete grátis?",
      answer:
        "Oferecemos frete grátis para todo o Brasil em compras acima de R$ 150,00. O desconto é aplicado automaticamente no carrinho quando o valor mínimo é atingido.",
    },
    {
      question: "Posso rastrear meu pedido?",
      answer:
        "Sim! Assim que seu pedido for enviado, você receberá um código de rastreamento por e-mail. Você também pode acompanhar o status na seção 'Meus Pedidos' do seu perfil.",
    },
    {
      question: "O que fazer se o produto não chegar?",
      answer:
        "Se o prazo de entrega expirar, entre em contato com nossa central de atendimento. Verificaremos a situação com a transportadora e tomaremos as medidas necessárias.",
    },
  ],
  returns: [
    {
      question: "Qual é o prazo para trocas e devoluções?",
      answer:
        "Você tem até 30 dias após o recebimento do produto para solicitar troca ou devolução. O produto deve estar sem uso, na embalagem original e com a nota fiscal.",
    },
    {
      question: "Como solicitar uma troca ou devolução?",
      answer:
        "Acesse 'Minha Conta' > 'Pedidos' > selecione o pedido > clique em 'Solicitar Devolução'. Nossa equipe analisará o pedido e enviará instruções por e-mail.",
    },
    {
      question: "Quem paga o frete da devolução?",
      answer:
        "Em caso de defeito ou erro no pedido, nós arcamos com o frete. Para trocas por motivo pessoal, o frete é de responsabilidade do cliente.",
    },
  ],
  support: [
    {
      question: "Como entrar em contato com o suporte?",
      answer:
        "Você pode entrar em contato via chat, e-mail ou telefone. Nosso atendimento funciona de segunda a sexta, das 9h às 18h.",
    },
    {
      question: "Quanto tempo leva para responder?",
      answer:
        "Nosso tempo médio de resposta é de até 24 horas úteis.",
    },
    {
      question: "Posso alterar meu pedido após confirmar?",
      answer:
        "Depende do status do pedido. Se ele ainda não foi enviado, entre em contato rapidamente com nossa central para tentarmos ajustar.",
    },
  ],
};

export function HelpPage() {
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
              <div className={styles.searchBox}>
                <Search className={styles.searchIcon} />
                <Input
                  placeholder="Busque por palavras-chave..."
                  className={styles.searchInput}
                />
              </div>
            </div>
            <div className={styles.heroCard}>
              <div className={styles.heroCardTitle}>Atendimento rápido</div>
              <p className={styles.heroCardText}>
                Estamos sempre prontos para ajudar você a ter a melhor
                experiência.
              </p>
              <div className={styles.heroStats}>
                <div>
                  <p className={styles.heroStatValue}>24h</p>
                  <p className={styles.heroStatLabel}>Tempo médio de resposta</p>
                </div>
                <div>
                  <p className={styles.heroStatValue}>4.9/5</p>
                  <p className={styles.heroStatLabel}>Satisfação das clientes</p>
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
              <Mail className={styles.contactIcon} />
              <h3 className={styles.contactTitle}>E-mail</h3>
              <p className={styles.contactText}>contato@toquedemulher.com</p>
              <Badge className={styles.contactBadge}>Resposta em 24h</Badge>
            </div>
            <div className={styles.contactCard}>
              <Phone className={styles.contactIcon} />
              <h3 className={styles.contactTitle}>Telefone</h3>
              <p className={styles.contactText}>(11) 3333-3333</p>
              <Badge className={styles.contactBadge}>Seg a Sex 9h-18h</Badge>
            </div>
            <div className={styles.contactCard}>
              <MessageCircle className={styles.contactIcon} />
              <h3 className={styles.contactTitle}>Chat ao vivo</h3>
              <p className={styles.contactText}>Inicie uma conversa agora</p>
              <Button size="lg" variant="default" className={styles.contactButton}>
                Iniciar chat
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

              {Object.entries(faqs).map(([key, questions]) => (
                <TabsContent key={key} value={key}>
                  <Accordion type="single" collapsible className={styles.accordion}>
                    {questions.map((faq, index) => (
                      <AccordionItem key={index} value={`${key}-${index}`}>
                        <AccordionTrigger className={styles.accordionTrigger}>
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className={styles.accordionContent}>
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
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
            Nossa equipe está pronta para te ajudar a qualquer momento.
          </p>
          <Button size="lg" variant="outline" className={styles.helpCtaButton}>
            Falar com atendimento
          </Button>
        </div>
      </section>
    </div>
  );
}
