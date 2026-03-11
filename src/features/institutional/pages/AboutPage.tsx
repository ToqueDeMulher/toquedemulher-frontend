import { Heart, Shield, Truck, Award } from "lucide-react";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import styles from "./AboutPage.module.css";

export function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Sobre Toque de Mulher</h1>
            <p className={styles.textBody}>
              Nascemos da paixão pela beleza e do desejo de proporcionar a todas
              as mulheres acesso aos melhores produtos de cuidado pessoal, com
              qualidade, segurança e preços justos.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.storyWrapper}>
            <div className={styles.storyGrid}>
              <div>
                <h2 className={styles.sectionTitle}>Nossa História</h2>
                <p className={styles.textSpacing}>
                  Fundada em 2024, a Toque de Mulher surgiu com a missão de
                  democratizar o acesso à beleza de qualidade. Acreditamos que
                  toda mulher merece se sentir especial e confiante em sua
                  própria pele.
                </p>
                <p className={styles.textBody}>
                  Começamos com uma pequena seleção de produtos cuidadosamente
                  escolhidos e, hoje, oferecemos milhares de opções das melhores
                  marcas nacionais e internacionais.
                </p>
              </div>
              <div className={styles.imageFrame}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1690087938677-a2b27fe32270?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwbG90dXMlMjBmbG93ZXJ8ZW58MXx8fHwxNzYxNTI5NTEyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Lotus flower"
                  className={styles.imageCover}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <h2 className={styles.centerTitle}>Nossos Valores</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIconWrap}>
                <Heart className={styles.valueIcon} />
              </div>
              <h3 className={styles.valueTitle}>Autenticidade</h3>
              <p className={styles.valueText}>
                Todos os produtos são 100% originais e autênticos.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIconWrap}>
                <Shield className={styles.valueIcon} />
              </div>
              <h3 className={styles.valueTitle}>Segurança</h3>
              <p className={styles.valueText}>
                Compra segura e protegida em todas as etapas
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIconWrap}>
                <Truck className={styles.valueIcon} />
              </div>
              <h3 className={styles.valueTitle}>Entrega Rápida</h3>
              <p className={styles.valueText}>
                Frete grátis acima de R$ 150 e entrega garantida.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIconWrap}>
                <Award className={styles.valueIcon} />
              </div>
              <h3 className={styles.valueTitle}>Qualidade</h3>
              <p className={styles.valueText}>
                Seleção rigorosa das melhores marcas do mercado.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.policiesSection}>
        <div className={styles.container}>
          <div className={styles.storyWrapper}>
            <h2 className={styles.policiesTitle}>Políticas</h2>

            <div className={styles.policiesStack}>
              <div className={styles.policyCard}>
                <h3 className={styles.policyTitle}>Política de Envio</h3>
                <div className={styles.policyList}>
                  <p>• Frete grátis para compras acima de R$ 150,00</p>
                  <p>
                    • Prazo de entrega: 5 a 10 dias úteis (Sul/Sudeste) e 10 a 15
                    dias úteis (demais regiões)
                  </p>
                  <p>• Enviamos para todo o Brasil</p>
                  <p>
                    • Código de rastreamento enviado por e-mail após o despacho
                  </p>
                </div>
              </div>

              <div className={styles.policyCard}>
                <h3 className={styles.policyTitle}>Política de Devolução</h3>
                <div className={styles.policyList}>
                  <p>• 30 dias para troca ou devolução</p>
                  <p>• Produtos devem estar sem uso e na embalagem original</p>
                  <p>
                    • Reembolso processado em até 7 dias úteis após aprovação
                  </p>
                  <p>
                    • Defeitos de fabricação: frete de devolução por nossa conta
                  </p>
                </div>
              </div>

              <div className={styles.policyCard}>
                <h3 className={styles.policyTitle}>Política de Privacidade</h3>
                <div className={styles.policyList}>
                  <p>• Seus dados pessoais são protegidos e seguros</p>
                  <p>
                    • Não compartilhamos informações com terceiros sem
                    consentimento
                  </p>
                  <p>• Utilizamos cookies para melhorar sua experiência</p>
                  <p>
                    • Conformidade com a LGPD (Lei Geral de Proteção de Dados)
                  </p>
                </div>
              </div>

              <div className={styles.policyCard}>
                <h3 className={styles.policyTitle}>Termos de Uso</h3>
                <div className={styles.policyList}>
                  <p>• Ao usar nosso site, você concorda com nossos termos</p>
                  <p>• Produtos sujeitos a disponibilidade de estoque</p>
                  <p>
                    • Preços e promoções podem ser alterados sem aviso prévio
                  </p>
                  <p>
                    • Reservamo-nos o direito de cancelar pedidos em caso de
                    suspeita de fraude
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Ficou com alguma dúvida?</h2>
            <p className={styles.ctaText}>
              Nossa equipe está pronta para te ajudar!
            </p>
            <div className={styles.ctaActions}>
              <a
                href="mailto:contato@toquedemulher.com"
                className={styles.ctaLink}
              >
                contato@toquedemulher.com
              </a>
              <a href="tel:1133333333" className={styles.ctaLink}>
                (11) 3333-3333
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
