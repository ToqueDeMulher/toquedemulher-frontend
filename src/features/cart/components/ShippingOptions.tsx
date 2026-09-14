import { useCart } from "@/features/cart/context/cart-context";
import {
  formatShippingMoney,
  shippingDeadline,
} from "@/features/cart/api/shipping-service";
import styles from "./ShippingOptions.module.css";

export function ShippingOptions() {
  const { shippingQuote, shippingService, selectShippingService } = useCart();
  if (!shippingQuote) return null;
  return (
    <fieldset className={styles.options}>
      <legend>Escolha sua entrega</legend>
      {shippingQuote.services.map((service) => (
        <label
          key={service.id}
          className={`${styles.option} ${shippingService?.id === service.id ? styles.selected : ""}`}
        >
          <input
            type="radio"
            name="shipping-service"
            value={service.id}
            checked={shippingService?.id === service.id}
            onChange={() => selectShippingService(service.id)}
          />
          <span>
            <strong>
              {service.company} · {service.name}
            </strong>
            <small>{shippingDeadline(service)} após postagem</small>
          </span>
          <b>
            {service.price === 0
              ? "Grátis"
              : formatShippingMoney(service.price)}
          </b>
        </label>
      ))}
      <p>
        Frete grátis, quando disponível, na opção mais econômica. Cotação válida
        até{" "}
        {new Date(shippingQuote.expires_at).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
        .
      </p>
    </fieldset>
  );
}
