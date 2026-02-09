import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Smartphone, Check } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { toast } from "sonner";
import { routes } from "@/shared/lib/routes";
import styles from "./CheckoutPage.module.css";

export function CheckoutPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("credit");

  const handlePlaceOrder = () => {
    toast.success("Pedido realizado com sucesso!");
    setTimeout(() => {
      navigate(routes.profile);
    }, 2000);
  };

  const subtotal = 181.7;
  const discount = 18.17;
  const shipping = 0;
  const total = subtotal - discount + shipping;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Finalizar Compra</h1>

        <div className={styles.stepsWrapper}>
          <div className={styles.stepsRow}>
            <div
              className={`${styles.stepCircle} ${
                step >= 1 ? styles.stepCircleActive : styles.stepCircleInactive
              }`}
            >
              {step > 1 ? <Check className={styles.iconCheck} /> : "1"}
            </div>
            <div
              className={`${styles.stepConnector} ${
                step >= 2
                  ? styles.stepConnectorActive
                  : styles.stepConnectorInactive
              }`}
            />
            <div
              className={`${styles.stepCircle} ${
                step >= 2 ? styles.stepCircleActive : styles.stepCircleInactive
              }`}
            >
              {step > 2 ? <Check className={styles.iconCheck} /> : "2"}
            </div>
            <div
              className={`${styles.stepConnector} ${
                step >= 3
                  ? styles.stepConnectorActive
                  : styles.stepConnectorInactive
              }`}
            />
            <div
              className={`${styles.stepCircle} ${
                step >= 3 ? styles.stepCircleActive : styles.stepCircleInactive
              }`}
            >
              {step > 3 ? <Check className={styles.iconCheck} /> : "3"}
            </div>
          </div>
        </div>

        <div className={styles.layoutGrid}>
          <div className={styles.mainColumn}>
            {step === 1 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Endereco de Entrega</h2>
                <div className={styles.reviewSection}>
                  <div className={styles.gridTwo}>
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        defaultValue="Maria Joao"
                        className={styles.input}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        defaultValue="(11) 99999-9999"
                        className={styles.input}
                      />
                    </div>
                  </div>
                  <div className={styles.gridThree}>
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        defaultValue="01234-567"
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.gridTwoThirds}>
                      <Label htmlFor="street">Rua</Label>
                      <Input
                        id="street"
                        defaultValue="Rua das Flores"
                        className={styles.input}
                      />
                    </div>
                  </div>
                  <div className={styles.gridThree}>
                    <div>
                      <Label htmlFor="number">Numero</Label>
                      <Input
                        id="number"
                        defaultValue="123"
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.gridTwoThirds}>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        placeholder="Apto, bloco..."
                        className={styles.input}
                      />
                    </div>
                  </div>
                  <div className={styles.gridTwo}>
                    <div>
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        defaultValue="Centro"
                        className={styles.input}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        defaultValue="Sao Paulo"
                        className={styles.input}
                      />
                    </div>
                  </div>
                  <div className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      id="save-address"
                      className={styles.checkbox}
                    />
                    <label
                      htmlFor="save-address"
                      className={styles.checkboxLabel}
                    >
                      Salvar este endereco para proximas compras
                    </label>
                  </div>
                </div>
                <div className={styles.actionsRight}>
                  <Button
                    onClick={() => setStep(2)}
                    size="lg"
                    variant="default"
                    className={styles.primaryButton}
                  >
                    Continuar para Pagamento
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Forma de Pagamento</h2>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className={styles.paymentOptions}
                >
                  <div
                    className={`${styles.paymentOption} ${
                      paymentMethod === "credit"
                        ? styles.paymentOptionActive
                        : styles.paymentOptionInactive
                    }`}
                  >
                    <div className={styles.paymentOptionHeader}>
                      <RadioGroupItem value="credit" id="credit" />
                      <Label
                        htmlFor="credit"
                        className={styles.paymentOptionLabel}
                      >
                        <CreditCard className={styles.paymentIcon} />
                        Cartao de Credito
                      </Label>
                    </div>
                    {paymentMethod === "credit" && (
                      <div className={styles.paymentDetails}>
                        <div>
                          <Label>Numero do Cartao</Label>
                          <Input
                            placeholder="0000 0000 0000 0000"
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.gridTwo}>
                          <div>
                            <Label>Validade</Label>
                            <Input
                              placeholder="MM/AA"
                              className={styles.input}
                            />
                          </div>
                          <div>
                            <Label>CVV</Label>
                            <Input
                              placeholder="000"
                              className={styles.input}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Nome no Cartao</Label>
                          <Input
                            placeholder="Como esta no cartao"
                            className={styles.input}
                          />
                        </div>
                        <div>
                          <Label>Parcelas</Label>
                          <select className={styles.select}>
                            <option>
                              1x de R$ {total.toFixed(2)} sem juros
                            </option>
                            <option>
                              2x de R$ {(total / 2).toFixed(2)} sem juros
                            </option>
                            <option>
                              3x de R$ {(total / 3).toFixed(2)} sem juros
                            </option>
                            <option>
                              4x de R$ {(total / 4).toFixed(2)} sem juros
                            </option>
                            <option>
                              5x de R$ {(total / 5).toFixed(2)} sem juros
                            </option>
                            <option>
                              6x de R$ {(total / 6).toFixed(2)} sem juros
                            </option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className={`${styles.paymentOption} ${
                      paymentMethod === "pix"
                        ? styles.paymentOptionActive
                        : styles.paymentOptionInactive
                    }`}
                  >
                    <div className={styles.paymentOptionHeaderCompact}>
                      <RadioGroupItem value="pix" id="pix" />
                      <Label
                        htmlFor="pix"
                        className={styles.paymentOptionLabel}
                      >
                        <Smartphone className={styles.paymentIcon} />
                        PIX (5% de desconto)
                      </Label>
                    </div>
                    {paymentMethod === "pix" && (
                      <p className={styles.paymentNote}>
                        O codigo PIX sera gerado apos a confirmacao do pedido.
                      </p>
                    )}
                  </div>
                </RadioGroup>

                <div className={styles.actionsBetween}>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                    className={styles.secondaryButton}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    size="lg"
                    variant="default"
                    className={styles.primaryButton}
                  >
                    Revisar Pedido
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Revisar Pedido</h2>

                <div className={styles.reviewSection}>
                  <div>
                    <h3 className={styles.reviewSubTitle}>
                      Endereco de Entrega
                    </h3>
                    <p className={styles.reviewText}>
                      Maria Joao
                      <br />
                      Rua das Flores, 123
                      <br />
                      Centro - Sao Paulo, SP
                      <br />
                      CEP: 01234-567
                      <br />
                      (11) 99999-9999
                    </p>
                  </div>

                  <div>
                    <h3 className={styles.reviewSubTitle}>Forma de Pagamento</h3>
                    <p className={styles.reviewText}>
                      {paymentMethod === "credit" ? "Cartao de Credito" : "PIX"}
                    </p>
                  </div>

                  <div>
                    <h3 className={styles.reviewSubTitle}>Itens do Pedido</h3>
                    <div className={styles.reviewItems}>
                      <div className={styles.reviewRow}>
                        <span>2x Batom Matte Nude Luxo</span>
                        <span>R$ 91,80</span>
                      </div>
                      <div className={styles.reviewRow}>
                        <span>1x Serum Anti-Idade Vitamina C</span>
                        <span>R$ 89,90</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.actionsBetween}>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(2)}
                    className={styles.secondaryButton}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    size="lg"
                    variant="default"
                    className={styles.primaryButton}
                  >
                    Finalizar Pedido
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.summaryColumn}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Resumo do Pedido</h3>

              <div className={styles.freeShipping}>
                <p className={styles.freeShippingText}>Frete Gratis</p>
              </div>

              <div className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className={styles.summaryRowDiscount}>
                  <span>Desconto (BEMVINDA10)</span>
                  <span>- R$ {discount.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className={styles.summaryRowDiscount}>
                  <span>Frete</span>
                  <span>Gratis</span>
                </div>
              </div>

              <div className={styles.summaryTotal}>
                <span className={styles.summaryTotalLabel}>Total</span>
                <span className={styles.summaryTotalValue}>
                  R$ {total.toFixed(2).replace(".", ",")}
                </span>
              </div>

              <div className={styles.summaryMeta}>
                <p>2 itens no carrinho</p>
                <p>Entrega estimada: 5-7 dias uteis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
