import { useEffect, useState } from "react";
export function ProductImagePreview({ file, url }: { file?: File; url?: string }) {
 const [preview, setPreview] = useState("");
 useEffect(() => {
  if (!file) { setPreview(""); return; }
  const objectUrl = URL.createObjectURL(file);
  setPreview(objectUrl);
  return () => URL.revokeObjectURL(objectUrl);
 }, [file]);
 const src = preview || url;
 return src ? <img src={src} alt="Prévia da imagem selecionada para o produto" style={{width:"100%",height:200,objectFit:"contain",background:"#fff",borderRadius:12,border:"1px solid var(--border)"}}/> : null;
}