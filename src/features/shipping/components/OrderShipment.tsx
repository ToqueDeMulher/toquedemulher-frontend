import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  getShipment,
  syncShipment,
  shipmentStatusLabels,
  shippingDeadline,
  formatShippingMoney,
  type Shipment,
} from "@/features/cart/api/shipping-service";
import styles from "./OrderShipment.module.css";

export function OrderShipment({ orderId }: { orderId: string }) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setShipment(null);
    setError(null);
    getShipment(orderId)
      .then((data) => {
        if (active) setShipment(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [orderId]);
  if (!shipment) return null;
  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setShipment(await syncShipment(orderId));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível consultar o envio.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className={styles.panel} aria-label="Entrega do pedido">
      <h3>Sua entrega</h3>
      <p>
        {shipment.company} · {shipment.service} ·{" "}
        {shipment.price === 0
          ? "Frete grátis"
          : formatShippingMoney(shipment.price)}
      </p>
      <p>{shippingDeadline(shipment)} após postagem</p>
      <strong>
        {shipmentStatusLabels[shipment.status] ?? "Acompanhando envio"}
      </strong>
      {shipment.labels
        .filter((label) => label.tracking)
        .map((label) => (
          <p key={label.id}>
            Rastreio: <code>{label.tracking}</code>
          </p>
        ))}
      {shipment.labels.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          isLoading={loading}
          onClick={() => void refresh()}
        >
          Atualizar envio
        </Button>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
