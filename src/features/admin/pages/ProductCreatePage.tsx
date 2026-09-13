import { ProductImagePreview } from "@/features/admin/components/ProductImagePreview";
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
  FormLabel,
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
} from "@/features/admin/types/product";

import { createProduct, uploadProductImage } from "@/features/admin/api/product-service";
import { routes } from "@/app/router/paths";

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
  const tags = values.categories_names
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const stockQuantity = normalizeNumber(values.stock_quantity) ?? 0;
  const categoryId = normalizeNumber(values.categories_names);
  const attributes: Record<string, unknown> = {
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
    supplier_name: values.supplier_name.trim() || null,
    supplier_contact: values.supplier_contact.trim() || null,
    supplier_email: values.supplier_email.trim() || null,
    usage_tips: values.description_usage_tips.trim() || null,
    ingredients: values.description_ingredients.trim() || null,
    stock_expiry_date: values.stock_expiry_date.trim() || null,
  };

  return {
    name: values.name.trim(),
    description: values.description_text.trim(),
    short_description: values.description_text.trim().slice(0, 500) || null,
    brand: values.brand_name.trim() || null,
    price: Number(values.price) || 0,
    stock_quantity: stockQuantity,
    status: values.active ? "active" : "inactive",
    attributes,
    tags: tags.length > 0 ? tags : null,
    category_id: categoryId && categoryId > 0 ? categoryId : null,
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

  const [uploadProductId, setUploadProductId] = useState("");
  const [pendingImages, setPendingImages] = useState<Record<string, File>>({});
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadErrors, setUploadErrors] = useState<
    Record<number, string | null>
  >({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleImageFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldId: string,
    index: number,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Selecione um arquivo JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024 || file.size === 0) {
      toast.error("Selecione uma imagem de até 5 MB.");
      return;
    }
    setPendingImages((previous) => ({ ...previous, [fieldId]: file }));
    setUploadErrors((previous) => ({ ...previous, [index]: null }));
  };

  const submitProduct = async (values: ProductFormValues) => {
    try {
      let productId = uploadProductId;
      if (!productId) {
        const product = await createProduct(buildPayload(values));
        productId = product.id;
        setUploadProductId(productId);
      }
      for (const [index, field] of fields.entries()) {
        const file = pendingImages[field.id];
        if (!file) continue;
        setUploadingIndex(index);
        try {
          const image = await uploadProductImage(productId, file, {
            is_primary: index === 0,
            alt_text: values.images[index]?.alt_text?.trim() || undefined,
          });
          form.setValue(`images.${index}.url`, image.url);
          setPendingImages((previous) => {
            const next = { ...previous };
            delete next[field.id];
            return next;
          });
          setUploadErrors((previous) => ({ ...previous, [index]: null }));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erro ao enviar imagem.";
          setUploadErrors((previous) => ({ ...previous, [index]: message }));
          throw new Error(`Produto cadastrado. ${message} Clique em Salvar imagens para tentar novamente.`);
        }
      }
      toast.success("Produto e imagens salvos com sucesso!");
      reset(defaultValues);
      setUploadProductId("");
      setPendingImages({});
      setUploadErrors({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar produto.");
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <div className={styles.headerMetaRow}>
              <Badge variant="secondary" className={styles.headerBadge}>
                Sua vitrine
              </Badge>
              <span className={styles.headerMeta}>
                Um novo favorito para sua loja.
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
                <CardTitle>Informações gerais</CardTitle>
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
                      <FormLabel className={styles.fieldLabel}>
                        Nome *
                      </FormLabel>
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
                      <FormLabel className={styles.fieldLabel}>
                        Preço (R$) *
                      </FormLabel>
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
                      <FormLabel className={styles.fieldLabel}>
                        Volume
                      </FormLabel>
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
                      <FormLabel className={styles.fieldLabel}>
                        Tipo de produto
                      </FormLabel>
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
                      <FormLabel className={styles.fieldLabel}>
                        Público
                      </FormLabel>
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
                <CardTitle>Detalhes cosméticos</CardTitle>
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
                      <FormLabel className={styles.fieldLabel}>
                        Tipo de pele
                      </FormLabel>
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
                      <FormLabel className={styles.fieldLabel}>
                        Tipo de cabelo
                      </FormLabel>
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
                      <FormLabel className={styles.fieldLabel}>
                        Cor
                      </FormLabel>
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
                      <FormLabel className={styles.fieldLabel}>
                        Fragrância
                      </FormLabel>
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
                      <FormLabel className={styles.fieldLabel}>
                        Proteção solar (SPF)
                      </FormLabel>
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
                          <FormLabel className={styles.fieldLabel}>
                            Produto ativo
                          </FormLabel>
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
                          <FormLabel className={styles.fieldLabel}>
                            Vegano
                          </FormLabel>
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
                          <FormLabel className={styles.fieldLabel}>
                            Cruelty-free
                          </FormLabel>
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
                          <FormLabel className={styles.fieldLabel}>
                            Hipoalergênico
                          </FormLabel>
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
                <CardTitle>Fornecedor</CardTitle>
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
                      <FormLabel className={styles.fieldLabel}>
                        Nome do fornecedor *
                      </FormLabel>
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
                      <FormLabel className={styles.fieldLabel}>
                        Contato do fornecedor
                      </FormLabel>
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
                      <FormLabel className={styles.fieldLabel}>
                        E-mail do fornecedor
                      </FormLabel>
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
                <CardTitle>Marca</CardTitle>
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
                      <FormLabel className={styles.fieldLabel}>
                        Marca *
                      </FormLabel>
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
                <CardTitle>Descrição</CardTitle>
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
                      <FormLabel className={styles.fieldLabel}>
                        Descrição principal *
                      </FormLabel>
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
                      <FormLabel className={styles.fieldLabel}>
                        Dicas de uso
                      </FormLabel>
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
                      <FormLabel className={styles.fieldLabel}>
                        Ingredientes
                      </FormLabel>
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
                <CardTitle>Categorias</CardTitle>
                <CardDescription>
                  Este campo alimenta tags do produto. Se informar um número,
                  ele será usado como category_id.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={control}
                  name="categories_names"
                  render={({ field }) => (
                    <FormItem className={styles.maxWidthXl}>
                      <FormLabel className={styles.fieldLabel}>
                        Tags ou category_id
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Maquiagem, Lábios, Batom ou 1"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Valores separados por vírgula viram `tags`; se o conteúdo
                        for numérico, vira `category_id`.
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
                <CardTitle>Estoque inicial</CardTitle>
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
                      <FormLabel className={styles.fieldLabel}>
                        Quantidade em estoque *
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Será registrada em stock_quantity.
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
                      <FormLabel className={styles.fieldLabel}>
                        Validade (opcional)
                      </FormLabel>
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
                      <FormLabel className={styles.fieldLabel}>
                        Observações
                      </FormLabel>
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
                <CardTitle>Imagens</CardTitle>
                <CardDescription>
                  A primeira imagem enviada será marcada como principal.
                </CardDescription>
              </CardHeader>
              <CardContent className={styles.cardFlexLarge}>
                <div className={styles.imageIntro}>
                  <p className={styles.helperText}>
                    Selecione as imagens e clique em Cadastrar produto.
                    Os arquivos serão enviados automaticamente após o cadastro.
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
                            setPendingImages((previous) => {
                              const next = { ...previous };
                              delete next[field.id];
                              return next;
                            });
                            remove(index);
                          }}
                          disabled={isSubmitting}
                          className={styles.removeButton}
                        >
                          <Trash2 className={styles.iconLeft} /> Remover
                        </Button>
                      )}
                    </div>

                    <div className={styles.imageRow}>
                      <input
                        ref={(element) => {
                          if (element) fileInputRefs.current[field.id] = element;
                          else delete fileInputRefs.current[field.id];
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
                          fileInputRefs.current[field.id]?.click();
                        }}
                        disabled={isSubmitting}
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
                        {pendingImages[field.id]?.name || "Aceita JPG, PNG ou WEBP, at\u00e9 5 MB."}
                      </span>
                    </div>
                    <ProductImagePreview file={pendingImages[field.id]} url={watchedValues.images?.[index]?.url} />
                    {uploadErrors[index] && (
                      <p className={styles.errorText}>{uploadErrors[index]}</p>
                    )}

                    <div className={styles.gridImageFields}>
                      <FormField
                        control={control}
                        name={`images.${index}.url` as const}
                        render={({ field }) => (
                          <FormItem className={styles.imageFieldWide}>
                            <FormLabel className={styles.fieldLabel}>
                              URL da imagem enviada
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Preenchida ao enviar a imagem" {...field} readOnly />
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
                            <FormLabel className={styles.fieldLabel}>
                              Ordenação
                            </FormLabel>
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
                            <FormLabel className={styles.fieldLabel}>
                              Texto alternativo
                            </FormLabel>
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
                  disabled={isSubmitting}
                  className={styles.addButton}
                >
                  <Plus className={styles.iconLeft} /> Adicionar imagem
                </Button>
              </CardContent>
            </Card>

            {/* PREVIEW */}
            <Card>
              <CardHeader>
                <CardTitle>Pronto para a vitrine?</CardTitle>
                <CardDescription>
                  Confira o nome, o valor e as imagens antes de salvar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.productSummary}><span>{watchedValues.name || "Seu novo produto"}</span><strong>{new Intl.NumberFormat("pt-BR", {style:"currency",currency:"BRL"}).format(Number(watchedValues.price) || 0)}</strong></div>
              </CardContent>
              <CardFooter className={styles.cardFooter}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    reset(defaultValues);
                    setUploadProductId("");
                    setPendingImages({});
                    setUploadErrors({});
                  }}
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
                  {uploadProductId ? "Salvar imagens" : "Cadastrar produto"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
