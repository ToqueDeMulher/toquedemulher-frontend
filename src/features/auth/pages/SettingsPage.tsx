import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Moon, Sun, UserRound, Zap } from "lucide-react";
import { useTheme } from "@/app/providers/theme/theme-context";
import { useAuth } from "@/features/auth/context/auth-context";
import { routes } from "@/app/router/paths";
import styles from "./SettingsPage.module.css";
export function SettingsPage() {
 const { theme, setTheme } = useTheme();
 const { user } = useAuth();
 const [reduced, setReduced] = useState(() => localStorage.getItem("tdm-reduced-motion") === "true");
 const updateMotion = (value: boolean) => {
  setReduced(value); document.documentElement.dataset.reducedMotion = String(value);
  try { localStorage.setItem("tdm-reduced-motion", String(value)); } catch {}
 };
 return <div className="store-container">
  <div className="store-page-heading"><span className="store-eyebrow">DO SEU JEITO</span><h1>Seu espaço. Seu ritmo.</h1><p>Ajuste os detalhes para se sentir em casa. Suas preferências são salvas automaticamente neste navegador.</p></div>
  <div className={styles.grid}>
   <section className={styles.panel}><span className="store-eyebrow">01 / APARÊNCIA</span><h2>Qual combina com seu momento?</h2><p>Do primeiro café ao último cuidado da noite.</p>
    <div className={styles.themes} role="group" aria-label="Escolha o tema">
     {(["light","dark"] as const).map(mode => <button key={mode} onClick={() => setTheme(mode)} className={styles.theme} aria-pressed={theme === mode}>
      <span className={mode === "light" ? styles.lightPreview : styles.darkPreview}><i/><i/><i/></span><span>{mode === "light" ? <Sun size={17}/> : <Moon size={17}/>} {mode === "light" ? "Modo claro" : "Modo escuro"} {theme === mode && <Check size={16}/>}</span>
     </button>)}
    </div>
   </section>
   <div className={styles.stack}>
    <section className={styles.panel}><Zap className={styles.icon}/><h2>Movimento na sua medida.</h2><p>Prefere uma experiência mais tranquila? Reduza as animações da loja.</p>
     <label className={styles.switchRow}>Reduzir animações<input type="checkbox" role="switch" checked={reduced} onChange={e => updateMotion(e.target.checked)}/></label>
     <small>A preferência de movimento reduzido do seu dispositivo também é respeitada.</small>
    </section>
    <section className={styles.panel}><UserRound className={styles.icon}/><h2>Tudo sobre você.</h2><p>Seus dados, endereços, pedidos e formas de pagamento em um só lugar.</p><Link to={user ? routes.profile + "?tab=settings" : routes.login}>Gerenciar minha conta <ArrowUpRight size={17}/></Link></section>
   </div>
  </div>
 </div>;
}