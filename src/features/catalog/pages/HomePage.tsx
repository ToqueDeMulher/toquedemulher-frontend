import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight, Heart, Leaf, Pause, Play, Sparkles } from "lucide-react";
import { routes } from "@/app/router/paths";
import { useCart } from "@/features/cart/context/cart-context";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { trendingProducts } from "@/features/catalog/data/catalog-products";
import { Reveal } from "@/shared/animation/Reveal";
import lipOil from "@/shared/assets/favorites-cards/Gisou_Honey_Infused_lip_oil.jpg";
import skincare from "@/shared/assets/favorites-cards/Byoma.jpg";
import makeup from "@/shared/assets/favorites-cards/Instagram.jpg";
import ritual from "@/shared/assets/favorites-cards/skincare-sweet.jpg";
import styles from "./HomePage.module.css";

const categories = [
 { name:"Maquiagem", slug:"maquiagem", subtitle:"Sua expressão, em cores", image:makeup },
 { name:"Skincare", slug:"skincare", subtitle:"Uma pausa para cuidar", image:skincare },
 { name:"Perfumes", slug:"perfumes", subtitle:"Presença que fica", image:ritual },
];
export function HomePage() {
 const { addItem } = useCart();
 const [tickerPaused, setTickerPaused] = useState(false);
 return <div className={styles.page}>
  <section className={styles.hero} aria-label="Descubra Toque de Mulher">
   <div className={styles.heroCopy}>
    <span className={styles.eyebrow}><span/> BELEZA COM PERSONALIDADE</span>
    <h1>Seu ritual.<br/>Suas <em>regras.</em></h1>
    <p>Para os dias de pouco e os dias de tudo.<br/>Descubra a beleza de ser você, do seu jeito.</p>
    <Link to={routes.search()} className={styles.primaryLink}>Encontre seu próximo favorito <ArrowUpRight size={19}/></Link>
    <div className={styles.heroFoot}><span>Um toque muda tudo.</span><a href="#descobertas" aria-label="Explorar descobertas"><ArrowDown size={18}/></a></div>
   </div>
   <div className={styles.heroArt}>
    <img src={lipOil} alt="Lip oil rosa com cerejas, inspiração para um ritual de beleza" fetchPriority="high"/>
    <div className={styles.sticker} aria-hidden="true"><Sparkles/><span>100%<br/>você!</span></div>
    <div className={styles.heroLabel}><span>BEAUTY PLAYGROUND</span><span>01 / UM TOQUE DE ROSA</span></div>
    <Link to={routes.category("maquiagem")} className={styles.imageLink}><span>Um pouco de cor.<br/><strong>Muito de você.</strong></span><ArrowUpRight size={26}/></Link>
   </div>
  </section>
  <section className={styles.ticker} aria-label="Sua beleza, suas regras">
   <div className={styles.tickerTrack} style={{animationPlayState: tickerPaused ? "paused" : "running"}} aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <span key={i}>good vibes <Sparkles/> seu toque <Heart/> suas regras <Sparkles/></span>)}</div>
  <button className={styles.tickerPause} onClick={() => setTickerPaused(value => !value)} aria-label={tickerPaused ? "Retomar faixa animada" : "Pausar faixa animada"} aria-pressed={tickerPaused}>{tickerPaused ? <Play size={13}/> : <Pause size={13}/>}</button>
  </section>
  <div className={styles.values}><span><Heart/>Beleza sem regras</span><i/><span><Sparkles/>Descobertas para sua rotina</span><i/><span><Leaf/>Autocuidado no seu tempo</span></div>
  <section className={styles.section} id="descobertas">
   <Reveal><div className={styles.sectionHeading}><div><span className="store-eyebrow">O QUE COMBINA COM VOCÊ?</span><h2>Todo dia, um novo <em>toque.</em></h2></div><p>Da primeira etapa ao último detalhe.<br/>Escolha por onde começar.</p></div></Reveal>
   <div className={styles.categoryGrid}>
    {categories.map((category,index) => <Reveal key={category.slug} delayMs={index*80}><Link to={routes.category(category.slug)} className={styles.categoryCard}>
     <div className={styles.categoryImage}><img src={category.image} alt={category.name} loading="lazy"/><span>0{index+1}</span></div>
     <div className={styles.categoryCaption}><div><h3>{category.name}</h3><p>{category.subtitle}</p></div><ArrowUpRight/></div>
    </Link></Reveal>)}
   </div>
   <div className={styles.moreCategories}><span>Continue explorando</span><Link to={routes.category("corpo")}>Corpo & banho <ArrowUpRight size={14}/></Link><Link to={routes.category("cabelos")}>Cuidados com os cabelos <ArrowUpRight size={14}/></Link></div>
  </section>
  <section className={styles.selection}>
   <div className={styles.section}>
    <Reveal><div className={styles.sectionHeading}><div><span className="store-eyebrow">ALERTA DE CRUSH</span><h2>Deu match? <em>Deu toque.</em></h2></div><Link className={styles.textLink} to={routes.search()}>Explorar a coleção <ArrowUpRight size={17}/></Link></div></Reveal>
    <div className={styles.products}>{trendingProducts.slice(0,4).map((product,index) => <Reveal key={product.id} delayMs={index*50}><ProductCard {...product} onAddToCart={() => addItem(product.id)}/></Reveal>)}</div>
   </div>
  </section>
  <section className={styles.section}>
   <Reveal className={styles.ritual}>
    <div className={styles.ritualImage}><img src={skincare} alt="Produtos de skincare em uma composição colorida" loading="lazy"/></div>
    <div className={styles.ritualCopy}><span className="store-eyebrow">RESERVE UM MOMENTO SEU</span><h2>Menos pressa.<br/>Mais <em>cuidado.</em></h2><p>Uma textura gostosa, seu aroma favorito e alguns minutos só para você. Pequenos rituais também transformam o dia.</p><Link to={routes.category("skincare")} className={styles.primaryLink}>Monte seu ritual <ArrowUpRight size={19}/></Link><span className={styles.ritualNote}>Seu tempo. Sua pele. Seu toque.</span></div>
   </Reveal>
  </section>
  <section className={styles.section}>
   <Reveal><div className={styles.sectionHeading}><div><span className="store-eyebrow">MAIS PARA DESCOBRIR</span><h2>Novos desejos, <em>novas versões.</em></h2></div><Link className={styles.textLink} to={routes.favorites}>Sua lista de desejos <Heart size={17}/></Link></div></Reveal>
   <div className={styles.products}>{trendingProducts.slice(4,8).map(product => <ProductCard key={product.id} {...product} onAddToCart={() => addItem(product.id)}/>)}</div>
  </section>
  <Reveal className={styles.manifesto}><span className="store-eyebrow">TOQUE DE MULHER</span><h2>A sua beleza não precisa<br/>de permissão. Só de <em>espaço.</em></h2><Link to={routes.about}>Conheça nosso universo <ArrowRight size={16}/></Link></Reveal>
 </div>;
}