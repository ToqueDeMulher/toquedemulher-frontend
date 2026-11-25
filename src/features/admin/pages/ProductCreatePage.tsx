import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Plus, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Checkbox } from "@/shared/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { createProduct, getAdminCategories, publishProduct, uploadProductImage } from "@/features/admin/api/product-service";
import type { AdminCategory } from "@/features/admin/types/product";
import { ApiError } from "@/shared/api/api-client";
import { buildProductPayload, defaultProductValues, imageOrderError, productFieldError, productImageError,
  type ProductFormValues, type ProductTextField } from "@/features/admin/lib/product-form";
import { routes } from "@/app/router/paths";
import styles from "./ProductCreatePage.module.css";

function UnavailableProductField({ name, label, noticeId, type = "text", rows }: {
  name: string;
  label: string;
  noticeId: string;
  type?: string;
  rows?: number;
}) {
  // These controls preserve the administrative sections without accepting data
  // that the current flow cannot save. They are not registered with the form.
  const props = { id: name, name, disabled: true, "aria-describedby": noticeId };
  return (
    <div className={styles.cardFlex}>
      <Label htmlFor={name} className={styles.fieldLabel}>{label}</Label>
      {rows
        ? <Textarea {...props} rows={rows} placeholder="Aguardando integração" />
        : <Input {...props} type={type} placeholder="Aguardando integração" />}
    </div>
  );
}

export function ProductCreatePage() {
  const navigate = useNavigate();
  const form = useForm<ProductFormValues>({ defaultValues: defaultProductValues, mode: "onBlur" });
  const { control, handleSubmit, reset, watch, formState: { isSubmitting } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "images" });
  const values = watch();
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const createdProductRef = useRef<string | null>(null);
  const submittingRef = useRef(false);
  const uploadingRef = useRef(new Set<string>());
  const [pendingImageFiles, setPendingImageFiles] = useState<Record<string, File>>({});
  const [uploadingImageIds, setUploadingImageIds] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [creationUnconfirmed, setCreationUnconfirmed] = useState(false);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const busy = isSubmitting || Object.keys(uploadingImageIds).length > 0;
  let previewPayload = null;
  try { previewPayload = buildProductPayload(values); } catch { /* The preview waits for valid form values. */ }

  useEffect(() => {
    void getAdminCategories().then(value => setCategories(Array.isArray(value) ? value : [])).catch(error => {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível carregar as categorias.");
    });
  }, []);

  const forgetPendingFile = (fieldId: string) => {
    setPendingImageFiles(previous => {
      const next = { ...previous };
      delete next[fieldId];
      return next;
    });
    setUploadErrors(previous => {
      const next = { ...previous };
      delete next[fieldId];
      return next;
    });
  };

  const uploadImage = async (productId: string, fieldId: string, index: number, file: File) => {
    if (uploadingRef.current.has(fieldId)) return false;
    uploadingRef.current.add(fieldId);
    setUploadingImageIds(previous => ({ ...previous, [fieldId]: true }));
    setUploadErrors(previous => ({ ...previous, [fieldId]: "" }));
    try {
      const metadata = form.getValues(`images.${index}`);
      const response = await uploadProductImage(productId, file, {
        order: metadata.order.trim() ? Number(metadata.order) : undefined,
        alt_text: metadata.alt_text.trim() || undefined,
      });
      form.setValue(`images.${index}.url`, response.url);
      form.setValue(`images.${index}.order`, String(response.order));
      form.setValue(`images.${index}.alt_text`, response.alt_text ?? "");
      forgetPendingFile(fieldId);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao enviar imagem. Tente novamente.";
      setUploadErrors(previous => ({ ...previous, [fieldId]: message }));
      toast.error(message);
      return false;
    } finally {
      uploadingRef.current.delete(fieldId);
      setUploadingImageIds(previous => {
        const next = { ...previous };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>, fieldId: string, index: number) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || submittingRef.current || uploadingRef.current.size) return;
    // Keep failed selections available for retry, including after the product exists.
    setPendingImageFiles(previous => ({ ...previous, [fieldId]: file }));
    const error = productImageError(file);
    setUploadErrors(previous => ({ ...previous, [fieldId]: error ?? "" }));
    if (error) return;
    if (createdProductRef.current) {
      const orderField = `images.${index}.order` as const;
      const orderError = imageOrderError(form.getValues(orderField));
      if (orderError !== true) {
        form.setError(orderField, { type: "validate", message: orderError });
        return;
      }
      form.clearErrors(orderField);
      await uploadImage(createdProductRef.current, fieldId, index, file);
    }
  };

  const clearForm = () => {
    reset(defaultProductValues);
    createdProductRef.current = null;
    setCreatedProductId(null);
    setPendingImageFiles({});
    setUploadErrors({});
    setSubmitError(null);
    setCreationUnconfirmed(false);
  };

  const submitProduct = async (submitted: ProductFormValues) => {
    setSubmitError(null);
    setCreationUnconfirmed(false);
    for (const field of fields) {
      const file = pendingImageFiles[field.id];
      const error = file && productImageError(file);
      if (error) {
        setUploadErrors(previous => ({ ...previous, [field.id]: error }));
        setSubmitError("Confira as imagens selecionadas antes de continuar.");
        return;
      }
    }
    try {
      let productId = createdProductRef.current;
      if (!productId) {
        const payload = buildProductPayload(submitted);
        const product = await createProduct(payload).catch(error => {
          // A missing response or a server/gateway error does not prove the POST was rolled back.
          setCreationUnconfirmed(!(error instanceof ApiError) || error.status >= 500);
          throw error;
        });
        if (!product || typeof product.id !== "string" || !product.id.trim()) {
          setCreationUnconfirmed(true);
          throw new Error("Não foi possível confirmar o produto criado. Consulte a lista de produtos antes de tentar novamente.");
        }
        productId = product.id;
        createdProductRef.current = productId;
        setCreatedProductId(productId);
      }
      let allUploaded = true;
      // A blank order is assigned by the backend, so uploads must not race each other.
      for (const [index, field] of fields.entries()) {
        const file = pendingImageFiles[field.id];
        if (file && !await uploadImage(productId, field.id, index, file)) allUploaded = false;
      }
      if (!allUploaded) {
        setSubmitError("Produto criado, mas há imagens pendentes. Reenvie as imagens para concluir.");
        return;
      }
      if (submitted.active) await publishProduct(productId);
      toast.success(submitted.active ? "Produto criado e publicado!" : "Produto salvo como rascunho!");
      clearForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar produto.";
      setSubmitError(message);
      toast.error(message);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current || uploadingRef.current.size) return;
    submittingRef.current = true;
    void handleSubmit(submitProduct)(event).finally(() => { submittingRef.current = false; });
  };

  const input = (name: ProductTextField, label: string, options: { type?: string; placeholder?: string; description?: string; step?: string } = {}) => (
    <FormField key={name} control={control} name={name}
      rules={{ validate: value => productFieldError(name, value, form.getValues()) }}
      render={({ field }) => <FormItem>
        <FormLabel className={styles.fieldLabel}>{label}</FormLabel>
        <FormControl><Input {...field} type={options.type} placeholder={options.placeholder} step={options.step} /></FormControl>
        {options.description && <FormDescription>{options.description}</FormDescription>}
        <FormMessage />
      </FormItem>} />
  );

  return (
    <div className={styles.page}><div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <div className={styles.headerMetaRow}>
            <Badge variant="secondary" className={styles.headerBadge}>CATÁLOGO</Badge>
            <span className={styles.headerMeta}>Novo item para a loja</span>
          </div>
          <h1 className={styles.title}>Cadastrar produto</h1>
          <p className={styles.description}>Organize as informações e imagens do novo produto. Campos marcados com * são obrigatórios.</p>
        </div>
        <Button type="button" variant="outline" size="lg" onClick={() => navigate(routes.adminDashboard)} disabled={busy} className={styles.backButton}>
          <ChevronLeft className={styles.iconLeft} /> Voltar
        </Button>
      </div>
      {createdProductId && <div role="status" className={styles.imageIntro}>
        Produto já criado. Os dados estão salvos; conclua o envio das imagens pendentes.
        {" "}<Link to={routes.adminProducts}>Ver produtos</Link>
      </div>}
      {submitError && <p role="alert" className={styles.errorText}>{submitError}</p>}
      {creationUnconfirmed && <div role="status" className={styles.imageIntro}>
        A criação pode ter sido concluída, mas não foi possível confirmar a resposta.
        Consulte a lista antes de reenviar para evitar um cadastro duplicado.
        {" "}<Link to={routes.adminProducts}>Consultar produtos</Link>
      </div>}
      <Form {...form}>
        <form onSubmit={submit} noValidate className={styles.form}>
          <fieldset disabled={busy || Boolean(createdProductId)} className={styles.form}>
            <Card>
              <CardHeader><CardTitle>Informações gerais</CardTitle><CardDescription>O identificador e o slug são gerados automaticamente no cadastro.</CardDescription></CardHeader>
              <CardContent className={styles.gridTwo}>
                {input("name", "Nome *", { placeholder: "Batom Matte Vermelho Power" })}
                {input("price", "Preço (R$) *", { type: "number", step: "any" })}
                {input("volume", "Volume", { placeholder: "5ml, 30g, 250ml" })}
                {input("product_type", "Tipo de produto", { placeholder: "batom, sérum, perfume" })}
                {input("target_audience", "Público", { placeholder: "feminino, masculino, unissex" })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Detalhes cosméticos</CardTitle><CardDescription>Especificações usadas para filtros e recomendações personalizadas.</CardDescription></CardHeader>
              <CardContent className={styles.gridTwo}>
                {input("skin_type", "Tipo de pele", { placeholder: "seca, oleosa, sensível" })}
                {input("hair_type", "Tipo de cabelo", { placeholder: "liso, cacheado, todos" })}
                {input("color", "Cor", { placeholder: "vermelho, nude, transparente" })}
                {input("fragrance", "Fragrância", { placeholder: "floral, amadeirado, cítrico" })}
                {input("spf", "Proteção solar (SPF)", { type: "number", step: "1" })}
              </CardContent>
              <CardFooter><div className={styles.footerGrid}>
                {([ ["active", "Publicar após cadastrar", "A publicação ocorrerá após o envio das imagens."], ["vegan", "Vegano", "Sem ingredientes de origem animal."],
                  ["cruelty_free", "Cruelty-free", "Sem testes em animais."], ["hypoallergenic", "Hipoalergênico", "Indicado para peles sensíveis."] ] as const)
                  .map(([name, label, description]) => <FormField key={name} control={control} name={name} render={({ field }) => (
                    <FormItem className={name === "hypoallergenic" ? styles.footerItemWide : styles.footerItem}>
                      <div className={styles.footerTextGroup}><FormLabel className={styles.fieldLabel}>{label}</FormLabel><FormDescription>{description}</FormDescription></div>
                      <FormControl><Checkbox checked={field.value} onCheckedChange={checked => field.onChange(checked === true)} /></FormControl>
                    </FormItem>
                  )} />)}
              </div></CardFooter>
            </Card>
            <Card>
              <CardHeader><CardTitle>Fornecedor</CardTitle><CardDescription>Vincule um fornecedor já cadastrado. Informe o custo para criar o vínculo.</CardDescription></CardHeader>
              <CardContent className={styles.gridThree}>
                {input("supplier_name", "Nome do fornecedor", { placeholder: "Beleza Suprema Distribuidora" })}
                {input("supplier_price", "Custo do fornecedor (R$)", { type: "number", step: "any" })}
                {input("lead_time_days", "Prazo do fornecedor (dias)", { type: "number", step: "1" })}
                <p id="supplier-unavailable-notice" className={`${styles.fullWidth} ${styles.helperText}`}>
                  Contato e e-mail indisponíveis neste cadastro. A manutenção de fornecedores ainda não está integrada ao painel.
                </p>
                <UnavailableProductField name="supplier_contact" label="Contato do fornecedor" noticeId="supplier-unavailable-notice" />
                <UnavailableProductField name="supplier_email" label="E-mail do fornecedor" type="email" noticeId="supplier-unavailable-notice" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Marca</CardTitle>
                <CardDescription id="brand-unavailable-notice">
                  Indisponível neste cadastro. A seleção e o cadastro de marcas ainda não estão disponíveis no painel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnavailableProductField name="brand_name" label="Marca" noticeId="brand-unavailable-notice" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Descrição</CardTitle><CardDescription>Conteúdo exibido na página do produto.</CardDescription></CardHeader>
              <CardContent className={styles.cardFlex}>
                <FormField control={control} name="description_text" rules={{ validate: value => productFieldError("description_text", value, form.getValues()) }} render={({ field }) => <FormItem><FormLabel>Descrição principal *</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={control} name="description_usage_tips" render={({ field }) => <FormItem><FormLabel>Dicas de uso</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl></FormItem>} />
                <FormField control={control} name="description_ingredients" render={({ field }) => <FormItem><FormLabel>Ingredientes</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl></FormItem>} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Categorias e tags</CardTitle>
                <CardDescription>Selecione uma categoria já cadastrada.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField control={control} name="category_id" rules={{ validate: value => productFieldError("category_id", value, form.getValues()) }} render={({ field }) => <FormItem><FormLabel>Categoria *</FormLabel><FormControl><select {...field} aria-label="Categoria"><option value="">Selecione</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></FormControl><FormMessage /></FormItem>} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Estoque inicial</CardTitle>
                <CardDescription>Quantidade disponível ao cadastrar. Alterações posteriores ficam no histórico.</CardDescription>
              </CardHeader>
              <CardContent className={styles.gridTwoWide}>
                {input("stock_quantity", "Quantidade em estoque *", { type: "number", step: "1" })}
                <UnavailableProductField name="stock_expiry_date" label="Validade (opcional)" type="date" noticeId="stock-expiry-notice" />
                <p id="stock-expiry-notice" className={styles.helperText}>Validade indisponível neste cadastro; permanece no fluxo de entrada por lote e fornecedor.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Medidas para entrega</CardTitle><CardDescription>Medidas opcionais: até 300 cm por dimensão e 1000 kg de peso, sempre maiores que zero.</CardDescription></CardHeader>
              <CardContent className={styles.gridTwo}>
                {input("shipping_width", "Largura (cm)", { type: "number", step: "any" })}
                {input("shipping_height", "Altura (cm)", { type: "number", step: "any" })}
                {input("shipping_length", "Comprimento (cm)", { type: "number", step: "any" })}
                {input("shipping_weight", "Peso (kg)", { type: "number", step: "any" })}
              </CardContent>
            </Card>
          </fieldset>
          <fieldset disabled={busy}>
            <Card>
              <CardHeader><CardTitle>Imagens do produto</CardTitle><CardDescription>A imagem de ordem 1 será a principal. Aceita JPG, PNG ou WEBP.</CardDescription></CardHeader>
              <CardContent className={styles.cardFlexLarge}>
                <p className={styles.helperText}>Selecione as imagens antes de cadastrar. Elas serão enviadas após a criação do produto.</p>
                {fields.map((field, index) => {
                  const image = values.images[index];
                  const uploaded = Boolean(image?.url);
                  return <div key={field.id} className={styles.imageCard}>
                    <div className={styles.imageCardHeader}>
                      <div className={styles.imageCardMeta}><Badge variant="outline">Imagem {index + 1}</Badge>
                        {Number(image?.order) === 1 && <span className={styles.primaryBadge}>Principal</span>}
                      </div>
                      {fields.length > 1 && !uploaded && <Button type="button" variant="ghost" size="sm" className={styles.removeButton} onClick={() => {
                        forgetPendingFile(field.id); delete fileInputRefs.current[field.id]; remove(index);
                      }}><Trash2 className={styles.iconLeft} /> Remover</Button>}
                    </div>
                    <div className={styles.imageRow}>
                      <input ref={element => {
                        if (element) fileInputRefs.current[field.id] = element;
                        else delete fileInputRefs.current[field.id];
                      }} type="file" accept="image/jpeg,image/png,image/webp"
                        aria-label={`Arquivo da imagem ${index + 1}`} disabled={uploaded} className={styles.hiddenInput}
                        onChange={event => void handleImageFileChange(event, field.id, index)} />
                      <Button type="button" variant="secondary" size="sm" disabled={uploaded || Boolean(uploadingImageIds[field.id])}
                        onClick={() => fileInputRefs.current[field.id]?.click()} className={styles.uploadButton}>
                        {uploadingImageIds[field.id] ? <><Loader2 className={styles.iconSpin} /> Enviando...</> : <><UploadCloud className={styles.iconSmall} /> Upload de arquivo</>}
                      </Button>
                      <span className={styles.uploadHint}>{pendingImageFiles[field.id]?.name ?? (uploaded ? "Imagem já enviada." : "Aceita JPG, PNG ou WEBP.")}</span>
                      {pendingImageFiles[field.id] && <Button type="button" variant="ghost" size="sm" onClick={() => forgetPendingFile(field.id)}>Limpar seleção</Button>}
                    </div>
                    {uploadErrors[field.id] && <p role="alert" className={styles.errorText}>{uploadErrors[field.id]}</p>}
                    <div className={styles.gridImageFields}>
                      <FormField control={control} name={`images.${index}.url`} render={({ field: imageField }) => <FormItem className={styles.imageFieldWide}>
                        <FormLabel className={styles.fieldLabel}>URL da imagem {index + 1}</FormLabel><FormControl><Input {...imageField} placeholder="Preenchida após o envio" readOnly /></FormControl><FormMessage />
                      </FormItem>} />
                      <FormField control={control} name={`images.${index}.order`} rules={{ validate: imageOrderError }} render={({ field: imageField }) => <FormItem>
                        <FormLabel className={styles.fieldLabel}>Ordenação da imagem {index + 1}</FormLabel><FormControl><Input {...imageField} type="number" min="1" step="1" disabled={uploaded} /></FormControl><FormMessage />
                      </FormItem>} />
                      <FormField control={control} name={`images.${index}.alt_text`} render={({ field: imageField }) => <FormItem className={styles.fullWidth}>
                        <FormLabel className={styles.fieldLabel}>Texto alternativo da imagem {index + 1}</FormLabel><FormControl><Input {...imageField} placeholder="Descrição acessível da imagem" disabled={uploaded} /></FormControl><FormMessage />
                      </FormItem>} />
                    </div>
                  </div>;
                })}
                <Button type="button" variant="outline" size="sm" className={styles.addButton} onClick={() => append({ url: "", alt_text: "",
                  order: String(Math.max(0, ...form.getValues("images").map(image => Number(image.order) || 0)) + 1),
                })}><Plus className={styles.iconLeft} /> Adicionar imagem</Button>
              </CardContent>
            </Card>
          </fieldset>
          <Card>
            <CardHeader><CardTitle>Finalizar cadastro</CardTitle><CardDescription>Revise os campos e cadastre o produto no catálogo.</CardDescription></CardHeader>
            <CardContent><details className={styles.technicalPreview}><summary>Ver dados técnicos do envio</summary><pre className={styles.preview}>
              {previewPayload ? JSON.stringify(previewPayload, null, 2) : "Preencha os campos obrigatórios com valores válidos para visualizar o envio."}
            </pre></details></CardContent>
            <CardFooter className={styles.cardFooter}>
              <Button type="button" variant="ghost" onClick={clearForm} disabled={busy}>{createdProductId ? "Novo produto" : "Limpar campos"}</Button>
              <Button type="submit" size="lg" disabled={busy} className={styles.submitButton}>
                {isSubmitting && <Loader2 className={styles.iconSpin} />}
                {createdProductId ? (Object.keys(pendingImageFiles).length ? "Reenviar imagens pendentes" : "Concluir cadastro") : "Cadastrar produto"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div></div>
  );
}
