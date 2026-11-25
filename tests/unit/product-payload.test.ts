import { describe, expect, it } from "vitest";
import { buildProductPayload, defaultProductValues, imageOrderError } from "@/features/admin/lib/product-form";

const draft = () => ({ ...structuredClone(defaultProductValues), name: " Batom ", price: "49.9" });

describe("product payload derived from the FastAPI ProductRequest", () => {
  it("serializes only supported fields with numbers, booleans and the supplier relationship", () => {
    const values = Object.assign(draft(), { price: "0", active: false, vegan: true, cruelty_free: false,
      hypoallergenic: true, spf: "50", brand_id: "3", description_id: "5", shipping_width: "10",
      shipping_height: "20", shipping_length: "30", shipping_weight: "0.2", supplier_name: " Existente ",
      supplier_price: "0", lead_time_days: "0", volume: " 30ml ",
      supplier_contact: "ignored", stock_quantity: "99", categories_names: "ignored", description_text: "ignored" });
    expect(buildProductPayload(values)).toEqual({ name: "Batom", price: 0, active: false, volume: "30ml",
      target_audience: null, product_type: null, skin_type: null, hair_type: null, color: null, fragrance: null,
      spf: 50, vegan: true, cruelty_free: false, hypoallergenic: true, brand_id: 3, description_id: 5,
      shipping_width: 10, shipping_height: 20, shipping_length: 30, shipping_weight: 0.2,
      description: { text: "ignored", usage_tips: null, ingredients: null }, stock_quantity: 99,
      supplier_products: [{ supplier_name: "Existente", supplier_price: 0, lead_time_days: 0 }] });
  });

  it("leaves optional values empty and lets the backend generate IDs, slug and initial stock", () => {
    const payload = buildProductPayload(draft());
    expect(payload).toMatchObject({ name: "Batom", price: 49.9, spf: null, brand_id: null, description_id: null });
    for (const key of ["id", "slug", "images", "supplier_products", "stock_quantity", "categories_names"]) {
      expect(payload).not.toHaveProperty(key);
    }
  });

  it.each(["", " ", "-1", "NaN", "Infinity", "-Infinity", "1e309", "not-a-number"])("rejects invalid price %j instead of serializing zero or null", price => {
    expect(() => buildProductPayload({ ...draft(), price })).toThrow();
  });
  it.each(["", "   "])("rejects an empty product name %j", name => {
    expect(() => buildProductPayload({ ...draft(), name })).toThrow("Informe o nome comercial.");
  });
  it.each([
    { spf: "1.5" }, { brand_id: "1.5" }, { description_id: "Infinity" },
    { shipping_width: "0" }, { shipping_height: "301" }, { shipping_length: "-1" }, { shipping_weight: "1001" },
    { supplier_name: "Existente", supplier_price: "" }, { supplier_price: "1" },
    { supplier_name: "Existente", supplier_price: "-1" },
    { supplier_name: "Existente", supplier_price: "1", lead_time_days: "1.5" },
  ])("rejects invalid optional/relationship values %j", overrides => {
    expect(() => buildProductPayload({ ...draft(), ...overrides })).toThrow();
  });

  it.each(["0", "-1", "1.5", "Infinity", "NaN"])("rejects invalid image order %s", order => {
    expect(imageOrderError(order)).not.toBe(true);
  });
  it("allows an omitted image order for the server to assign", () => {
    expect(imageOrderError("")).toBe(true);
  });
});
