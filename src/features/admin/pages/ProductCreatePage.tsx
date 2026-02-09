import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Checkbox } from "@/shared/ui/checkbox";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

import { Badge } from "@/shared/ui/badge";
import { ChevronLeft, Loader2, Plus, Trash2, UploadCloud } from "lucide-react";
import styles from "./ProductCreatePage.module.css";

import {
  CreateProductPayload,
  CategoryPayload,
  ProductImagePayload,
} from "@/shared/types/product";

import { createProduct, uploadProductImage } from "@/shared/services/productService";
import { routes } from "@/shared/lib/routes";

type ProductImageField = {
  url: string;
  order?: string;
  alt_text?: string;
};

type ProductFormValues = {
  // Product
  name: string;
  price: string;
  active: boolean;
  volume: string;
  target_audience: string;
  product_type: string;
  skin_type: string;
  hair_type: string;
  color: string;
  fragrance: string;
  spf: string;
  vegan: boolean;
  cruelty_free: boolean;
  hypoallergenic: boolean;

  // Supplier
  supplier_name: string;
  supplier_contact: string;
  supplier_email: string;

  // Brand
  brand_name: string;

  // Description
  description_text: string;
  description_usage_tips: string;
  description_ingredients: string;

  // Category (nomes separados por vírgula)
  categories_names: string;

  // Stock
  stock_quantity: string;
  stock_expiry_date: string; // "YYYY-MM-DD" ou ""

  // ProductImage
  images: ProductImageField[];

  // interno, não vai pro backend
  notes: string;
};

const defaultValues: ProductFormValues = {
  name: "",
  price: "",
  active: true,
  volume: "",
  target_audience: "",
  product_type: "",
  skin_type: "",
  hair_type: "",
  color: "",
  fragrance: "",
  spf: "",
  vegan: false,
  cruelty_free: true,
  hypoallergenic: false,

  supplier_name: "",
  supplier_contact: "",
  supplier_email: "",

  brand_name: "",

  description_text: "",
  description_usage_tips: "",
  description_ingredients: "",

  categories_names: "",

  stock_quantity: "",
  stock_expiry_date: "",

  notes: "",
  images: [
    {
      url: "",
      order: "1",
      alt_text: "",
    },
  ],
};

const preventLabelFocus = (event: React.MouseEvent) => {
  event.preventDefault();
};

function normalizeNumber(value?: string) {
  if (!value) return null;
  const parsed = Number(value.trim());
  return Number.isNaN(parsed) ? null : parsed;
}

function buildPayload(values: ProductFormValues): CreateProductPayload {
  const categories: CategoryPayload[] = values.categories_names
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((name) => ({ name }));

  const images: ProductImagePayload[] = values.images
    .filter((image) => image.url.trim().length > 0)
    .map((image, index) => ({
      url: image.url.trim(),
      order: normalizeNumber(image.order || String(index + 1)) ?? index + 1,
      alt_text: image.alt_text?.trim() || null,
    }));

  const stockQuantity = normalizeNumber(values.stock_quantity) ?? 0;
  const stockExpiry =
    values.stock_expiry_date.trim().length > 0
      ? values.stock_expiry_date.trim()
      : null;

  return {
    product: {
      name: values.name.trim(),
      price: Number(values.price) || 0,
      active: values.active,
      volume: values.volume.trim() || null,
      target_audience: values.target_audience.trim() || null,
      product_type: values.product_type.trim() || null,
      skin_type: values.skin_type.trim() || null,
      hair_type: values.hair_type.trim() || null,
      color: values.color.trim() || null,
      fragrance: values.fragrance.trim() || null,
      spf: normalizeNumber(values.spf),
      vegan: values.vegan,
      cruelty_free: values.cruelty_free,
      hypoallergenic: values.hypoallergenic,
    },
    supplier: {
      name: values.supplier_name.trim(),
      contact: values.supplier_contact.trim() || null,
      email: values.supplier_email.trim() || null,
    },
    brand: {
      name: values.brand_name.trim(),
    },
    description: {
      text: values.description_text.trim(),
      usage_tips: values.description_usage_tips.trim() || null,
      ingredients: values.description_ingredients.trim() || null,
    },
    categories,
    stock: {
      quantity: stockQuantity,
      expiry_date: stockExpiry,
    },
    images,
  };
}

export function ProductCreatePage() {
  const navigate = useNavigate();
  const form = useForm<ProductFormValues>({
    defaultValues,
    mode: "onBlur",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
    watch,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images",
  });

  const watchedValues = watch();
  const previewPayload = buildPayload(watchedValues);
  const [uploadProductId, setUploadProductId] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadErrors, setUploadErrors] = useState<
    Record<number, string | null>
  >({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldId: string,
    index: number,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!uploadProductId.trim()) {
      toast.error("Informe o ID do produto para enviar imagens.");
      event.target.value = "";
      return;
    }

    setUploadingIndex(index);
    setUploadErrors((prev) => ({ ...prev, [index]: null }));

    try {
      const currentOrder = normalizeNumber(
        form.getValues(`images.${index}.order` as const),
      );
      const altTextValue = form
        .getValues(`images.${index}.alt_text` as const)
        ?.trim();

      const response = await uploadProductImage(uploadProductId.trim(), file, {
        order: currentOrder ?? undefined,
        alt_text: altTextValue || undefined,
      });

      form.setValue(`images.${index}.url`, response.url);
      form.setValue(`images.${index}.order`, String(response.order));
      if (response.alt_text) {
        form.setValue(`images.${index}.alt_text`, response.alt_text);
      }

      setUploadErrors((prev) => ({ ...prev, [index]: null }));
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao enviar imagem. Tente novamente.";
      toast.error(message);
      setUploadErrors((prev) => ({ ...prev, [index]: message }));
    } finally {
      setUploadingIndex(null);
      event.target.value = "";
    }
  };

  const submitProduct = async (values: ProductFormValues) => {
    const payload = buildPayload(values);

    try {
      await createProduct(payload);
      toast.success("Produto criado com sucesso!");
      reset(defaultValues);
    } catch (err) {
      toast.error("Erro ao cadastrar produto.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <div className={styles.headerMetaRow}>
              <Badge variant="secondary" className={styles.headerBadge}>
                Novo recurso
              </Badge>
              <span className={styles.headerMeta}>
                Envie os dados no formato aceito pelo endpoint POST /products
              </span>
            </div>
            <h1 className={styles.title}>Cadastro de Produtos</h1>
            <p className={styles.description}>
              Preencha os campos abaixo para cadastrar novos itens no catálogo.
              Os campos marcados com * são obrigatórios. Os demais são opcionais
              e podem ser ajustados depois diretamente no painel administrativo.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate(routes.home)}
            className={styles.backButton}
          >
            <ChevronLeft className={styles.iconLeft} /> Voltar
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(submitProduct)} className={styles.form}>
            {/* PRODUCT - Informações gerais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações gerais (Product)</CardTitle>
                <CardDescription>
                  Dados básicos utilizados para identificar o produto na
                  plataforma.
                </CardDescription>
              </CardHeader>
              <CardContent className={styles.gridTwo}>
                <FormField
                  control={control}
                  name="name"
                  rules={{ required: "Informe o nome comercial." }}
                  render={({ field }) => (
                    <FormItem>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Nome *
                      </span>
                      <FormControl>
                        <Input
                          placeholder="Batom Matte Vermelho Power"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="price"
                  rules={{ required: "Informe o preço." }}
                  render={({ field }) => (
                    <FormItem>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Preço (R$) *
                      </span>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Volume
                      </span>
                      <FormControl>
                        <Input placeholder="5ml, 30g, 250ml" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="product_type"
                  render={({ field }) => (
                    <FormItem>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Tipo de produto
                      </span>
                      <FormControl>
                        <Input placeholder="batom, sérum, perfume" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="target_audience"
                  render={({ field }) => (
                    <FormItem>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Público
                      </span>
                      <FormControl>
                        <Input
                          placeholder="feminino, masculino, unissex"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* PRODUCT - Detalhes cosméticos */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes cosméticos (Product)</CardTitle>
                <CardDescription>
                  Especificações usadas para filtros e recomendações
                  personalizadas.
                </CardDescription>
              </CardHeader>
              <CardContent className={styles.gridTwo}>
                <FormField
                  control={control}
                  name="skin_type"
                  render={({ field }) => (
                    <FormItem>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Tipo de pele
                      </span>
                      <FormControl>
                        <Input
                          placeholder="seca, oleosa, sensível"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="hair_type"
                  render={({ field }) => (
                    <FormItem>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Tipo de cabelo
                      </span>
                      <FormControl>
                        <Input placeholder="liso, cacheado, todos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Cor
                      </span>
                      <FormControl>
                        <Input
                          placeholder="vermelho, nude, transparente"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="fragrance"
                  render={({ field }) => (
                    <FormItem>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Fragrância
                      </span>
                      <FormControl>
                        <Input
                          placeholder="floral, amadeirado, cítrico"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="spf"
                  render={({ field }) => (
                    <FormItem>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Proteção solar (SPF)
                      </span>
                      <FormControl>
                        <Input type="number" min="0" step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <div className={styles.footerGrid}>
                  <FormField
                    control={control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className={styles.footerItem}>
                        <div className={styles.footerTextGroup}>
                          <span
                            className={styles.fieldLabel}
                            onMouseDown={preventLabelFocus}
                          >
                            Produto ativo
                          </span>
                          <FormDescription>
                            Controla exibição na vitrine.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="vegan"
                    render={({ field }) => (
                      <FormItem className={styles.footerItem}>
                        <div className={styles.footerTextGroup}>
                          <span
                            className={styles.fieldLabel}
                            onMouseDown={preventLabelFocus}
                          >
                            Vegano
                          </span>
                          <FormDescription>
                            Sem ingredientes de origem animal.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="cruelty_free"
                    render={({ field }) => (
                      <FormItem className={styles.footerItem}>
                        <div className={styles.footerTextGroup}>
                          <span
                            className={styles.fieldLabel}
                            onMouseDown={preventLabelFocus}
                          >
                            Cruelty-free
                          </span>
                          <FormDescription>
                            Sem testes em animais.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="hypoallergenic"
                    render={({ field }) => (
                      <FormItem className={styles.footerItemWide}>
                        <div className={styles.footerTextGroup}>
                          <span
                            className={styles.fieldLabel}
                            onMouseDown={preventLabelFocus}
                          >
                            Hipoalergênico
                          </span>
                          <FormDescription>
                            Indicado para peles sensíveis.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardFooter>
            </Card>

            {/* SUPPLIER */}
            <Card>
              <CardHeader>
                <CardTitle>Fornecedor (Supplier)</CardTitle>
                <CardDescription>
                  Dados para criar ou vincular o fornecedor responsável por este
                  produto.
                </CardDescription>
              </CardHeader>
              <CardContent className={styles.gridThree}>
                <FormField
                  control={control}
                  name="supplier_name"
                  rules={{ required: "Informe o nome do fornecedor." }}
                  render={({ field }) => (
                    <FormItem>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Nome do fornecedor *
                      </span>
                      <FormControl>
                        <Input
                          placeholder="Beleza Suprema Distribuidora"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="supplier_contact"
                  render={({ field }) => (
                    <FormItem>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Contato do fornecedor
                      </span>
                      <FormControl>
                        <Input placeholder="(11) 99999-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="supplier_email"
                  render={({ field }) => (
                    <FormItem>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        E-mail do fornecedor
                      </span>
                      <FormControl>
                        <Input
                          placeholder="contato@fornecedor.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* BRAND */}
            <Card>
              <CardHeader>
                <CardTitle>Marca (Brand)</CardTitle>
                <CardDescription>
                  Marca comercial exibida junto ao nome do produto.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={control}
                  name="brand_name"
                  rules={{ required: "Informe o nome da marca." }}
                  render={({ field }) => (
                    <FormItem className={styles.maxWidthMd}>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Marca *
                      </span>
                      <FormControl>
                        <Input placeholder="Toque de Mulher" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* DESCRIPTION */}
            <Card>
              <CardHeader>
                <CardTitle>Descrição (Description)</CardTitle>
                <CardDescription>
                  Texto detalhado vinculado a este produto.
                </CardDescription>
              </CardHeader>
              <CardContent className={styles.cardFlex}>
                <FormField
                  control={control}
                  name="description_text"
                  rules={{ required: "Informe a descrição principal." }}
                  render={({ field }) => (
                    <FormItem className={styles.fullWidth}>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Descrição principal *
                      </span>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Batom matte de longa duração com acabamento aveludado..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Texto exibido na página do produto.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="description_usage_tips"
                  render={({ field }) => (
                    <FormItem className={styles.fullWidth}>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Dicas de uso
                      </span>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Aplicar diretamente nos lábios limpos..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="description_ingredients"
                  render={({ field }) => (
                    <FormItem className={styles.fullWidth}>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Ingredientes
                      </span>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Cera vegetal, manteiga de karité, óleo de rícino..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* CATEGORY */}
            <Card>
              <CardHeader>
                <CardTitle>Categorias (Category)</CardTitle>
                <CardDescription>
                  Nomes das categorias que serão criadas/vinculadas ao produto.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={control}
                  name="categories_names"
                  render={({ field }) => (
                    <FormItem className={styles.maxWidthXl}>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Categorias (nomes)
                      </span>
                      <FormControl>
                        <Input
                          placeholder="Maquiagem, Lábios, Batom"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Separe por vírgulas. Cada nome vira um objeto{" "}
                        {"{ name }"}.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* STOCK */}
            <Card>
              <CardHeader>
                <CardTitle>Estoque inicial (Stock)</CardTitle>
                <CardDescription>
                  Estoque vinculado ao produto no momento do cadastro.
                </CardDescription>
              </CardHeader>
              <CardContent className={styles.gridTwoWide}>
                <FormField
                  control={control}
                  name="stock_quantity"
                  rules={{
                    required: "Informe a quantidade inicial em estoque.",
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Quantidade em estoque *
                      </span>
                      <FormControl>
                        <Input type="number" min="0" step="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Será registrada em Stock.quantity.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="stock_expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Validade (opcional)
                      </span>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Vai para Stock.expiry_date, se preenchido.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* NOTES (interno) */}
            <Card>
              <CardHeader>
                <CardTitle>Observações internas</CardTitle>
                <CardDescription>
                  Campo opcional apenas para contexto interno (não é enviado ao
                  backend).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className={styles.fullWidth}>
                      <span
                        className={styles.fieldLabel}
                        onMouseDown={preventLabelFocus}
                      >
                        Observações
                      </span>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Detalhes extras para o time de catálogo, logística, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* PRODUCTIMAGE */}
            <Card>
              <CardHeader>
                <CardTitle>Imagens (ProductImage)</CardTitle>
                <CardDescription>
                  A primeira imagem será usada como principal (order = 1).
                </CardDescription>
              </CardHeader>
              <CardContent className={styles.cardFlexLarge}>
                <div className={styles.imageIntro}>
                  <span
                    className={styles.fieldLabel}
                    onMouseDown={preventLabelFocus}
                  >
                    ID do produto para upload de imagens
                  </span>
                  <Input
                    value={uploadProductId}
                    onChange={(event) => setUploadProductId(event.target.value)}
                    placeholder="UUID retornado após criar o produto"
                    className={styles.inputTopSpace}
                  />
                  <p className={styles.helperText}>
                    O endpoint{" "}
                    <code>/products/&lt;product_id&gt;/images/upload</code>
                    requer o ID do produto. Informe o valor e, em seguida, use o
                    botão de upload em cada imagem para enviar o arquivo
                    diretamente ao backend.
                  </p>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className={styles.imageCard}>
                    <div className={styles.imageCardHeader}>
                      <div className={styles.imageCardMeta}>
                        <Badge variant="outline">Imagem {index + 1}</Badge>
                        {index === 0 && (
                          <span className={styles.primaryBadge}>Principal</span>
                        )}
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            delete fileInputRefs.current[field.id];
                            remove(index);
                          }}
                          className={styles.removeButton}
                        >
                          <Trash2 className={styles.iconLeft} /> Remover
                        </Button>
                      )}
                    </div>

                    <div className={styles.imageRow}>
                      <input
                        ref={(element) => {
                          if (element) {
                            fileInputRefs.current[field.id] = element;
                          } else {
                            delete fileInputRefs.current[field.id];
                          }
                        }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className={styles.hiddenInput}
                        onChange={(event) =>
                          handleImageFileChange(event, field.id, index)
                        }
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (!uploadProductId.trim()) {
                            toast.error(
                              "Informe o ID do produto antes de enviar arquivos.",
                            );
                            return;
                          }
                          fileInputRefs.current[field.id]?.click();
                        }}
                        disabled={uploadingIndex === index}
                        className={styles.uploadButton}
                      >
                        {uploadingIndex === index ? (
                          <>
                            <Loader2 className={styles.iconSpin} />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <UploadCloud className={styles.iconSmall} /> Upload
                            de arquivo
                          </>
                        )}
                      </Button>
                      <span className={styles.uploadHint}>
                        Aceita JPG, PNG ou WEBP.
                      </span>
                    </div>
                    {uploadErrors[index] && (
                      <p className={styles.errorText}>{uploadErrors[index]}</p>
                    )}

                    <div className={styles.gridImageFields}>
                      <FormField
                        control={control}
                        name={`images.${index}.url` as const}
                        rules={{ required: "Informe a URL da imagem." }}
                        render={({ field }) => (
                          <FormItem className={styles.imageFieldWide}>
                            <span
                              className={styles.fieldLabel}
                              onMouseDown={preventLabelFocus}
                            >
                              URL *
                            </span>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`images.${index}.order` as const}
                        render={({ field }) => (
                          <FormItem>
                            <span
                              className={styles.fieldLabel}
                              onMouseDown={preventLabelFocus}
                            >
                              Ordenação
                            </span>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`images.${index}.alt_text` as const}
                        render={({ field }) => (
                          <FormItem className={styles.fullWidth}>
                            <span
                              className={styles.fieldLabel}
                              onMouseDown={preventLabelFocus}
                            >
                              Texto alternativo
                            </span>
                            <FormControl>
                              <Input
                                placeholder="Descrição acessível da imagem"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      url: "",
                      order: String(fields.length + 1),
                      alt_text: "",
                    })
                  }
                  className={styles.addButton}
                >
                  <Plus className={styles.iconLeft} /> Adicionar imagem
                </Button>
              </CardContent>
            </Card>

            {/* PREVIEW */}
            <Card>
              <CardHeader>
                <CardTitle>Pré-visualização da requisição</CardTitle>
                <CardDescription>
                  Payload pronto para ser enviado ao endpoint POST /products.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className={styles.preview}>
                  {JSON.stringify(previewPayload, null, 2)}
                </pre>
              </CardContent>
              <CardFooter className={styles.cardFooter}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => reset(defaultValues)}
                  disabled={isSubmitting}
                >
                  Limpar campos
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  variant="default"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting && <Loader2 className={styles.iconSpin} />}
                  Cadastrar produto
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
