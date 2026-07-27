import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { routes } from "@/app/router/paths";
import {
  createAddress,
  fetchAddressByCep,
  getRegiaoByUF,
  type AddressRequest,
} from "@/features/auth/api/address-service";
import { useAuth } from "@/features/auth/context/auth-context";
import { Button } from "@/shared/ui/button";
import styles from "./AddressPage.module.css";

type FormState = {
  label: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  region: string;
  ddd: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
};

const INITIAL_FORM: FormState = {
  label: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  region: "",
  ddd: "",
  is_default_shipping: false,
  is_default_billing: false,
};

export function AddressPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const numberRef = useRef<HTMLInputElement>(null);

  if (!isLoggedIn) {
    navigate(routes.login, { replace: true });
    return null;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function formatCep(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return digits;
  }

  async function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCep(e.target.value);
    setForm((prev) => ({ ...prev, cep: formatted }));
    setCepError(null);
    setFieldErrors((prev) => ({ ...prev, cep: undefined }));

    const digits = formatted.replace(/\D/g, "");
    if (digits.length === 8) {
      setCepLoading(true);
      try {
        const data = await fetchAddressByCep(digits);
        if (data) {
          setForm((prev) => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
            region: getRegiaoByUF(data.uf) || prev.region,
            ddd: data.ddd || prev.ddd,
          }));
          setTimeout(() => numberRef.current?.focus(), 50);
        } else {
          setCepError("CEP não encontrado. Verifique e tente novamente.");
        }
      } catch {
        setCepError("Erro ao consultar o CEP. Tente novamente.");
      } finally {
        setCepLoading(false);
      }
    }
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!form.label.trim()) errors.label = "Campo obrigatório";
    if (!form.cep.replace(/\D/g, "").trim() || form.cep.replace(/\D/g, "").length !== 8)
      errors.cep = "CEP inválido";
    if (!form.street.trim()) errors.street = "Campo obrigatório";
    if (!form.number.trim()) errors.number = "Campo obrigatório";
    if (!form.neighborhood.trim()) errors.neighborhood = "Campo obrigatório";
    if (!form.city.trim()) errors.city = "Campo obrigatório";
    if (!form.state.trim()) errors.state = "Campo obrigatório";
    if (!form.region.trim()) errors.region = "Campo obrigatório";
    if (!form.ddd.trim()) errors.ddd = "Campo obrigatório";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!validate()) return;

    const payload: AddressRequest = {
      label: form.label.trim(),
      cep: form.cep.replace(/\D/g, ""),
      street: form.street.trim(),
      number: form.number.trim(),
      complement: form.complement.trim() || undefined,
      neighborhood: form.neighborhood.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      region: form.region.trim(),
      ddd: form.ddd.trim(),
      is_default_shipping: form.is_default_shipping,
      is_default_billing: form.is_default_billing,
    };

    setSubmitLoading(true);
    try {
      const res = await createAddress(payload);
      setSuccessMsg(res.mensagem ?? "Endereço criado com sucesso");
      setForm(INITIAL_FORM);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao cadastrar endereço.";
      if (message.includes("401") || message.includes("403")) {
        setErrorMsg("Sessão expirada. Faça login novamente.");
      } else if (message.includes("422") || message.includes("400")) {
        setErrorMsg("Dados inválidos. Verifique os campos e tente novamente.");
      } else {
        setErrorMsg("Ocorreu um erro ao salvar o endereço. Tente novamente.");
      }
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.headerRow}>
          <button
            className={styles.backButton}
            onClick={() => navigate(routes.profile)}
            aria-label="Voltar ao perfil"
          >
            <ArrowLeft className={styles.backIcon} />
            Voltar
          </button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrap}>
              <MapPin className={styles.headerIcon} />
            </div>
            <div>
              <h1 className={styles.cardTitle}>Cadastrar Endereço</h1>
              <p className={styles.cardSubtitle}>
                Preencha seu CEP e complete os dados restantes
              </p>
            </div>
          </div>

          {/* Feedback de sucesso */}
          {successMsg && (
            <div className={styles.alertSuccess} role="alert">
              <CheckCircle2 className={styles.alertIcon} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Feedback de erro */}
          {errorMsg && (
            <div className={styles.alertError} role="alert">
              <AlertCircle className={styles.alertIcon} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className={styles.form}>

            {/* Label do endereço */}
            <div className={styles.fieldGroup}>
              <label htmlFor="label" className={styles.label}>
                Identificação do endereço <span className={styles.required}>*</span>
              </label>
              <input
                id="label"
                name="label"
                type="text"
                placeholder="Ex: Casa, Trabalho..."
                value={form.label}
                onChange={handleChange}
                className={`${styles.input} ${fieldErrors.label ? styles.inputError : ""}`}
              />
              {fieldErrors.label && (
                <span className={styles.fieldError}>{fieldErrors.label}</span>
              )}
            </div>

            {/* CEP */}
            <div className={styles.fieldGroup}>
              <label htmlFor="cep" className={styles.label}>
                CEP <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="cep"
                  name="cep"
                  type="text"
                  placeholder="00000-000"
                  value={form.cep}
                  onChange={handleCepChange}
                  maxLength={9}
                  className={`${styles.input} ${fieldErrors.cep || cepError ? styles.inputError : ""}`}
                />
                {cepLoading && (
                  <Loader2 className={styles.inputSpinner} aria-label="Consultando CEP..." />
                )}
              </div>
              {cepError && (
                <span className={styles.fieldError}>{cepError}</span>
              )}
              {fieldErrors.cep && !cepError && (
                <span className={styles.fieldError}>{fieldErrors.cep}</span>
              )}
            </div>

            {/* Rua e Número lado a lado */}
            <div className={styles.row}>
              <div className={`${styles.fieldGroup} ${styles.flex3}`}>
                <label htmlFor="street" className={styles.label}>
                  Logradouro <span className={styles.required}>*</span>
                </label>
                <input
                  id="street"
                  name="street"
                  type="text"
                  placeholder="Rua, Avenida..."
                  value={form.street}
                  onChange={handleChange}
                  className={`${styles.input} ${fieldErrors.street ? styles.inputError : ""}`}
                />
                {fieldErrors.street && (
                  <span className={styles.fieldError}>{fieldErrors.street}</span>
                )}
              </div>

              <div className={`${styles.fieldGroup} ${styles.flex1}`}>
                <label htmlFor="number" className={styles.label}>
                  Número <span className={styles.required}>*</span>
                </label>
                <input
                  id="number"
                  name="number"
                  type="text"
                  placeholder="Ex: 123"
                  value={form.number}
                  onChange={handleChange}
                  ref={numberRef}
                  className={`${styles.input} ${fieldErrors.number ? styles.inputError : ""}`}
                />
                {fieldErrors.number && (
                  <span className={styles.fieldError}>{fieldErrors.number}</span>
                )}
              </div>
            </div>

            {/* Complemento */}
            <div className={styles.fieldGroup}>
              <label htmlFor="complement" className={styles.label}>
                Complemento{" "}
                <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                id="complement"
                name="complement"
                type="text"
                placeholder="Apto 101, Bloco B..."
                value={form.complement}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            {/* Bairro e DDD */}
            <div className={styles.row}>
              <div className={`${styles.fieldGroup} ${styles.flex3}`}>
                <label htmlFor="neighborhood" className={styles.label}>
                  Bairro <span className={styles.required}>*</span>
                </label>
                <input
                  id="neighborhood"
                  name="neighborhood"
                  type="text"
                  placeholder="Seu bairro"
                  value={form.neighborhood}
                  onChange={handleChange}
                  className={`${styles.input} ${fieldErrors.neighborhood ? styles.inputError : ""}`}
                />
                {fieldErrors.neighborhood && (
                  <span className={styles.fieldError}>{fieldErrors.neighborhood}</span>
                )}
              </div>

              <div className={`${styles.fieldGroup} ${styles.flex1}`}>
                <label htmlFor="ddd" className={styles.label}>
                  DDD <span className={styles.required}>*</span>
                </label>
                <input
                  id="ddd"
                  name="ddd"
                  type="text"
                  placeholder="61"
                  maxLength={3}
                  value={form.ddd}
                  onChange={handleChange}
                  className={`${styles.input} ${fieldErrors.ddd ? styles.inputError : ""}`}
                />
                {fieldErrors.ddd && (
                  <span className={styles.fieldError}>{fieldErrors.ddd}</span>
                )}
              </div>
            </div>

            {/* Cidade, Estado e Região */}
            <div className={styles.row}>
              <div className={`${styles.fieldGroup} ${styles.flex3}`}>
                <label htmlFor="city" className={styles.label}>
                  Cidade <span className={styles.required}>*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Sua cidade"
                  value={form.city}
                  onChange={handleChange}
                  className={`${styles.input} ${fieldErrors.city ? styles.inputError : ""}`}
                />
                {fieldErrors.city && (
                  <span className={styles.fieldError}>{fieldErrors.city}</span>
                )}
              </div>

              <div className={`${styles.fieldGroup} ${styles.flex1}`}>
                <label htmlFor="state" className={styles.label}>
                  UF <span className={styles.required}>*</span>
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="DF"
                  maxLength={2}
                  value={form.state}
                  onChange={handleChange}
                  className={`${styles.input} ${fieldErrors.state ? styles.inputError : ""}`}
                />
                {fieldErrors.state && (
                  <span className={styles.fieldError}>{fieldErrors.state}</span>
                )}
              </div>

              <div className={`${styles.fieldGroup} ${styles.flex2}`}>
                <label htmlFor="region" className={styles.label}>
                  Região <span className={styles.required}>*</span>
                </label>
                <input
                  id="region"
                  name="region"
                  type="text"
                  placeholder="Centro-Oeste"
                  value={form.region}
                  onChange={handleChange}
                  className={`${styles.input} ${fieldErrors.region ? styles.inputError : ""}`}
                />
                {fieldErrors.region && (
                  <span className={styles.fieldError}>{fieldErrors.region}</span>
                )}
              </div>
            </div>

            {/* Opções de padrão */}
            <div className={styles.checkboxSection}>
              <h3 className={styles.checkboxSectionTitle}>Definir como padrão</h3>
              <div className={styles.checkboxRow}>
                <label className={styles.checkboxLabel} htmlFor="is_default_shipping">
                  <input
                    id="is_default_shipping"
                    name="is_default_shipping"
                    type="checkbox"
                    checked={form.is_default_shipping}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>
                    Endereço padrão de <strong>entrega</strong>
                  </span>
                </label>

                <label className={styles.checkboxLabel} htmlFor="is_default_billing">
                  <input
                    id="is_default_billing"
                    name="is_default_billing"
                    type="checkbox"
                    checked={form.is_default_billing}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>
                    Endereço padrão de <strong>cobrança</strong>
                  </span>
                </label>
              </div>
            </div>

            {/* Botão submit */}
            <div className={styles.formFooter}>
              <Button
                type="submit"
                disabled={submitLoading}
                size="lg"
                className={styles.submitButton}
                id="submit-address-btn"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className={styles.spinnerIcon} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <MapPin className={styles.submitIcon} />
                    Salvar Endereço
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
