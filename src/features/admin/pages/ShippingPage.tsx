import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Truck,
  ArrowUpRight,
  RefreshCw,
  Printer,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";
import {
  getShippingConnection,
  authorizeShipping,
  getAdminShipments,
  getShippingProducts,
  saveShippingDimensions,
  adminShipmentAction,
  type ShippingConnection,
  type ShippingProduct,
} from "@/features/admin/api/shipping-service";
import {
  shipmentStatusLabels,
  shippingDeadline,
  formatShippingMoney,
  type Shipment,
} from "@/features/cart/api/shipping-service";
import styles from "./ShippingPage.module.css";

const dimensionFields = [
  { key: "shipping_width", label: "Largura (cm)" },
  { key: "shipping_height", label: "Altura (cm)" },
  { key: "shipping_length", label: "Comprimento (cm)" },
  { key: "shipping_weight", label: "Peso (kg)" },
] as const;
export function ShippingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [connection, setConnection] = useState<ShippingConnection | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [products, setProducts] = useState<ShippingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invoiceKeys, setInvoiceKeys] = useState<Record<string, string>>({});
  const [recoveryIds, setRecoveryIds] = useState<Record<string, string>>({});
  const [productId, setProductId] = useState("");
  const [dimensions, setDimensions] = useState<Record<string, string>>({});
  async function load() {
    setLoading(true);
    setError(null);
    const results = await Promise.allSettled([
      getShippingConnection(),
      getAdminShipments(),
      getShippingProducts(),
    ]);
    if (results[0].status === "fulfilled") setConnection(results[0].value);
    if (results[1].status === "fulfilled") setShipments(results[1].value);
    if (results[2].status === "fulfilled") setProducts(results[2].value);
    const failed = results.find((result) => result.status === "rejected");
    if (failed?.status === "rejected")
      setError(
        failed.reason instanceof Error
          ? failed.reason.message
          : "Não foi possível carregar os envios.",
      );
    setLoading(false);
  }
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    if (searchParams.get("connection") === "success")
      toast.success("Melhor Envio conectado.");
    if (searchParams.get("connection") === "cancelled")
      toast.info("A autorização foi cancelada.");
    if (searchParams.has("connection")) setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);
  async function connect() {
    setBusy("connect");
    try {
      const result = await authorizeShipping();
      window.location.assign(result.url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível conectar.",
      );
      setBusy(null);
    }
  }
  async function action(shipment: Shipment, action: string) {
    setBusy(shipment.id);
    try {
      const body =
        action === "prepare"
          ? { invoice_key: invoiceKeys[shipment.id] }
          : action === "reconcile"
            ? {
                label_ids: (recoveryIds[shipment.id] ?? "")
                  .split(/[\s,]+/)
                  .filter(Boolean),
              }
            : undefined;
      const updated = await adminShipmentAction(
        shipment.order_id,
        action,
        body,
      );
      setShipments((current) =>
        current.map((item) => (item.id === shipment.id ? updated : item)),
      );
      toast.success(
        action === "generate"
          ? "Geração solicitada. Atualize o status antes de imprimir."
          : "Envio atualizado.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Operação não concluída.",
      );
      await load();
    } finally {
      setBusy(null);
    }
  }
  function selectProduct(id: string) {
    setProductId(id);
    const product = products.find((item) => item.id === id);
    setDimensions(
      Object.fromEntries(
        dimensionFields.map((field) => [
          field.key,
          String(product?.[field.key] ?? ""),
        ]),
      ),
    );
  }
  async function saveDimensions(event: React.FormEvent) {
    event.preventDefault();
    if (!productId) return;
    setBusy("dimensions");
    try {
      await saveShippingDimensions(
        productId,
        Object.fromEntries(
          dimensionFields.map((field) => [
            field.key,
            Number(dimensions[field.key]),
          ]),
        ) as Omit<ShippingProduct, "id" | "name">,
      );
      toast.success("Peso e dimensões salvos.");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <span>
            <Truck size={16} /> Logística da loja
          </span>
          <h1>Envios e etiquetas</h1>
          <p>Da escolha da transportadora ao acompanhamento da entrega.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading || Boolean(busy)}
        >
          <RefreshCw size={16} /> Atualizar
        </Button>
      </header>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <section className={styles.connection}>
        <div>
          <h2>
            Melhor Envio <Sparkles size={20} />
          </h2>
          <p>
            {connection?.connected
              ? "Conta conectada"
              : "Conecte sua conta para habilitar as cotações e etiquetas"}{" "}
            ·{" "}
            {connection?.environment === "production" ? "Produção" : "Sandbox"}
          </p>
          {connection && !connection.configured && (
            <p>Configure o aplicativo e o remetente no .env do backend.</p>
          )}
        </div>
        <Button
          onClick={() => void connect()}
          isLoading={busy === "connect"}
          disabled={Boolean(busy) || !connection?.configured}
        >
          {connection?.connected ? "Reconectar conta" : "Conectar conta"}
          <ArrowUpRight size={16} />
        </Button>
      </section>
      <section className={styles.card}>
        <h2>Medidas para cotação</h2>
        <p>
          Informe as medidas unitárias do produto embalado e o peso em
          quilogramas.
        </p>
        <form onSubmit={saveDimensions}>
          <Label htmlFor="shipping-product">Produto</Label>
          <select
            id="shipping-product"
            value={productId}
            onChange={(event) => selectProduct(event.target.value)}
          >
            <option value="">Selecione um produto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
                {dimensionFields.some((field) => !product[field.key])
                  ? " — medidas pendentes"
                  : ""}
              </option>
            ))}
          </select>
          <div className={styles.dimensions}>
            {dimensionFields.map((field) => (
              <div key={field.key}>
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={field.key === "shipping_weight" ? "1000" : "300"}
                  required
                  disabled={!productId}
                  value={dimensions[field.key] ?? ""}
                  onChange={(event) =>
                    setDimensions((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <Button
            type="submit"
            disabled={!productId || Boolean(busy)}
            isLoading={busy === "dimensions"}
          >
            Salvar medidas
          </Button>
        </form>
      </section>
      <div className={styles.listHeading}>
        <h2>Pedidos para envio</h2>
        <p>
          {loading
            ? "Carregando..."
            : `${shipments.length} pedidos com entrega integrada`}
        </p>
      </div>
      {!loading && shipments.length === 0 && (
        <div className={styles.card}>
          <p>Os pedidos feitos com uma cotação de frete aparecerão aqui.</p>
        </div>
      )}
      {shipments.map((shipment) => (
        <article key={shipment.id} className={styles.card}>
          <div className={styles.shipmentTop}>
            <div>
              <span className={styles.orderId}>
                Pedido {shipment.order_id.slice(0, 8).toUpperCase()}
              </span>
              <h2>{shipment.recipient_name}</h2>
              <p>
                {shipment.company} · {shipment.service} ·{" "}
                {shippingDeadline(shipment)} após postagem
              </p>
            </div>
            <span className={styles.status}>
              {shipmentStatusLabels[shipment.status] ?? shipment.status}
            </span>
          </div>
          <p>
            Frete da transportadora:{" "}
            <strong>{formatShippingMoney(shipment.cost ?? 0)}</strong> · Cobrado
            do cliente: <strong>{formatShippingMoney(shipment.price)}</strong>
          </p>
          {shipment.last_error && (
            <p role="alert" className={styles.error}>
              {shipment.last_error}
            </p>
          )}
          {shipment.payment_status !== "approved" && (
            <p>Aguarde o pagamento do pedido para preparar o envio.</p>
          )}
          {shipment.status === "pending" && (
            <div className={styles.invoice}>
              <Label htmlFor={`invoice-${shipment.id}`}>
                Chave da NF-e (44 dígitos)
              </Label>
              <Input
                id={`invoice-${shipment.id}`}
                inputMode="numeric"
                maxLength={44}
                value={invoiceKeys[shipment.id] ?? ""}
                onChange={(event) =>
                  setInvoiceKeys((current) => ({
                    ...current,
                    [shipment.id]: event.target.value.replace(/\D/g, ""),
                  }))
                }
              />
            </div>
          )}
          {shipment.labels.map((label) => (
            <p key={label.id}>
              Etiqueta {label.id.slice(0, 8)}
              {label.tracking && (
                <>
                  {" "}
                  · Rastreio <code>{label.tracking}</code>
                </>
              )}
            </p>
          ))}
          <div className={styles.actions}>
            {shipment.status === "pending" && (
              <Button
                disabled={
                  Boolean(busy) ||
                  shipment.payment_status !== "approved" ||
                  invoiceKeys[shipment.id]?.length !== 44
                }
                isLoading={busy === shipment.id}
                onClick={() => void action(shipment, "prepare")}
              >
                Preparar etiquetas
              </Button>
            )}
            {shipment.status === "carted" && (
              <Button
                disabled={
                  Boolean(busy) || shipment.payment_status !== "approved"
                }
                isLoading={busy === shipment.id}
                onClick={() => void action(shipment, "pay")}
              >
                Pagar {formatShippingMoney(shipment.cost ?? 0)} da carteira
              </Button>
            )}
            {shipment.status === "paid" && (
              <Button
                disabled={Boolean(busy)}
                isLoading={busy === shipment.id}
                onClick={() => void action(shipment, "generate")}
              >
                Gerar etiquetas
              </Button>
            )}
            {["ready", "posted", "delivered"].includes(shipment.status) && (
              <Button
                variant="outline"
                disabled={Boolean(busy)}
                onClick={() => void action(shipment, "print")}
              >
                <Printer size={16} /> Obter impressão
              </Button>
            )}
            {shipment.labels.length > 0 && (
              <Button
                variant="outline"
                disabled={Boolean(busy)}
                onClick={() => void action(shipment, "sync")}
              >
                Consultar status
              </Button>
            )}
            {shipment.print_url && (
              <Button variant="outline" asChild>
                <a
                  href={shipment.print_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir etiquetas <ArrowUpRight size={16} />
                </a>
              </Button>
            )}
          </div>
          {["needs_review", "creating"].includes(shipment.status) && (
            <details className={styles.recovery}>
              <summary>Recuperar criação interrompida</summary>
              <p>
                Confira as etiquetas deste pedido na conta Melhor Envio. Informe
                todos os IDs, separados por vírgula; o sistema verificará o
                vínculo com o pedido.
              </p>
              <Label htmlFor={`recovery-${shipment.id}`}>
                IDs das etiquetas
              </Label>
              <Input
                id={`recovery-${shipment.id}`}
                value={
                  recoveryIds[shipment.id] ??
                  shipment.labels.map((label) => label.id).join(",")
                }
                onChange={(event) =>
                  setRecoveryIds((current) => ({
                    ...current,
                    [shipment.id]: event.target.value,
                  }))
                }
              />
              <Button
                variant="outline"
                disabled={Boolean(busy) || !recoveryIds[shipment.id]?.trim()}
                onClick={() => void action(shipment, "reconcile")}
              >
                Conferir e recuperar
              </Button>
            </details>
          )}
        </article>
      ))}
    </div>
  );
}
