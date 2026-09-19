import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronUp,
  Heart,
  Pause,
  Play,
  Sparkles,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { routes } from "@/app/router/paths";
import { useAuth } from "@/features/auth/context/auth-context";
import { useCart } from "@/features/cart/context/cart-context";
import { Reveal } from "@/shared/animation/Reveal";
import {
  catalogCategories,
  getProductById,
  trendingProducts,
  type CatalogProduct,
  type CatalogCategorySlug,
} from "@/features/catalog/data/catalog-products";
import { useGamification } from "@/features/gamification/context/gamification-context";
import saleImage from "@/shared/assets/banner-off-season/Sale.png";
import skincareImage from "@/shared/assets/banner-off-season/Skincare.png";
import byomaImage from "@/shared/assets/favorites-cards/Byoma.jpg";
import diorImage from "@/shared/assets/favorites-cards/Instagram.jpg";
import gisouImage from "@/shared/assets/favorites-cards/Gisou_Honey_Infused_lip_oil.jpg";
import { BeautyFlower } from "@/shared/ui/BeautyFlower";
import styles from "./HomePage.module.css";

const campaigns = [
  {
    image: saleImage,
    alt: "Seleção de beleza em promoção",
    label: "Um toque de desejo",
    text: "Encontre seu novo favorito na nossa seleção de beleza.",
    to: routes.category("maquiagem"),
    action: "Explorar maquiagem",
  },
  {
    image: skincareImage,
    alt: "Seleção de skincare Toque de Mulher",
    label: "Seu ritual de cuidado",
    text: "Texturas e cuidados para um momento só seu.",
    to: routes.category("skincare"),
    action: "Descobrir skincare",
  },
];
const edits = [
  {
    image: diorImage,
    title: "O poder de um toque",
    label: "MAQUIAGEM",
    text: "Cor, textura e novas possibilidades.",
    to: routes.category("maquiagem"),
  },
  {
    image: byomaImage,
    title: "Pele bem cuidada",
    label: "SKINCARE",
    text: "O começo de todo bom ritual.",
    to: routes.category("skincare"),
  },
  {
    image: gisouImage,
    title: "Detalhes que encantam",
    label: "PARA DESCOBRIR",
    text: "Pequenos desejos para o dia a dia.",
    to: routes.category("cabelos"),
  },
];

export function HomePage() {
  const { isLoggedIn } = useAuth();
  const { addItem } = useCart();
  const {
    totalPoints,
    levelName,
    progressToNextLevel,
    nextLevelName,
    pointsToNextLevel,
  } = useGamification();
  const [heroApi, setHeroApi] = useState<CarouselApi>();
  const [heroIndex, setHeroIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [category, setCategory] = useState<CatalogCategorySlug | "all">("all");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [recentProducts] = useState(() => {
    try {
      const ids: unknown = JSON.parse(
        localStorage.getItem("tdm_recent_products") ?? "[]",
      );
      return Array.isArray(ids)
        ? [...new Set(ids.filter((id): id is string => typeof id === "string"))]
            .map(getProductById)
            .filter((product): product is CatalogProduct => Boolean(product))
            .slice(0, 4)
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!heroApi) return;
    const update = () => setHeroIndex(heroApi.selectedScrollSnap());
    update();
    heroApi.on("select", update);
    return () => {
      heroApi.off("select", update);
    };
  }, [heroApi]);

  useEffect(() => {
    if (!heroApi || paused || interacting) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const id = window.setInterval(() => {
      if (!motion.matches && !document.hidden) heroApi.scrollNext();
    }, 6500);
    return () => window.clearInterval(id);
  }, [heroApi, paused, interacting]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const selection = (
    category === "all"
      ? trendingProducts
      : trendingProducts.filter((product) => product.category === category)
  ).slice(0, 8);
  const campaign = campaigns[heroIndex];

  return (
    <div className={styles.page}>
      <h1 className="sr-only">Toque de Mulher — beleza do seu jeito</h1>
      <section className={styles.heroSection} aria-label="Destaques da loja">
        <div
          onMouseEnter={() => setInteracting(true)}
          onMouseLeave={() => setInteracting(false)}
          onFocusCapture={() => setInteracting(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setInteracting(false);
          }}
        >
          <Carousel
            opts={{ loop: true }}
            setApi={setHeroApi}
            className={styles.heroCarousel}
          >
            <CarouselContent>
              {campaigns.map((item, index) => (
                <CarouselItem
                  key={item.label}
                  aria-hidden={index !== heroIndex}
                >
                  <Link
                    to={item.to}
                    className={styles.heroLink}
                    tabIndex={index === heroIndex ? 0 : -1}
                    aria-label={item.action}
                  >
                    <ImageWithFallback
                      src={item.image}
                      alt={item.alt}
                      className={styles.heroImage}
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                    />
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              className={styles.heroPrevious}
              aria-label="Destaque anterior"
            />
            <CarouselNext
              className={styles.heroNext}
              aria-label="Próximo destaque"
            />
          </Carousel>
          <div className={styles.heroCaption}>
            <div className={styles.campaignCopy} key={heroIndex}>
              <strong>{campaign.label}</strong>
              <span>{campaign.text}</span>
            </div>
            <Link className={styles.textLink} to={campaign.to}>
              {campaign.action} <ArrowUpRight size={17} />
            </Link>
            <div className={styles.heroControls}>
              {campaigns.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  aria-label={`Mostrar destaque ${index + 1}`}
                  aria-pressed={index === heroIndex}
                  onClick={() => heroApi?.scrollTo(index)}
                  className={styles.heroDot}
                />
              ))}
              <button
                type="button"
                className={styles.pauseButton}
                aria-label={
                  paused ? "Reproduzir destaques" : "Pausar destaques"
                }
                onClick={() => setPaused(!paused)}
              >
                {paused ? <Play size={13} /> : <Pause size={13} />}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.serviceStrip}>
        <span>
          <Truck size={18} /> Frete grátis acima de R$ 150
        </span>
        <span>
          <Heart size={18} /> Beleza escolhida com cuidado
        </span>
        <Link to={routes.missions}>
          <Sparkles size={18} /> Descubra o Beauty Club <ArrowRight size={14} />
        </Link>
      </div>

      <section
        className={styles.section}
        id="novidades"
        aria-labelledby="new-title"
      >
        <Reveal className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>ACABARAM DE CHEGAR</span>
            <h2 id="new-title">Novidades para se apaixonar.</h2>
          </div>
          <Link to={routes.category("maquiagem")} className={styles.textLink}>
            Explorar a coleção <ArrowUpRight size={17} />
          </Link>
        </Reveal>
        <Reveal>
          <Carousel
            opts={{ align: "start", containScroll: "trimSnaps" }}
            className={styles.productCarousel}
          >
            <CarouselContent className={styles.productTrack}>
              {trendingProducts
                .filter((product) => product.isNew)
                .slice(0, 8)
                .map((product) => (
                  <CarouselItem
                    key={product.id}
                    className={styles.productSlide}
                  >
                    <ProductCard
                      {...product}
                      onAddToCart={() => addItem(product.id)}
                    />
                  </CarouselItem>
                ))}
            </CarouselContent>
            <div className={styles.productControls}>
              <CarouselPrevious aria-label="Produtos anteriores" />
              <CarouselNext aria-label="Próximos produtos" />
            </div>
          </Carousel>
        </Reveal>
      </section>

      <section className={styles.editorialSection} aria-labelledby="edit-title">
        <Reveal className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>INSPIRAÇÃO PARA O SEU RITUAL</span>
            <h2 id="edit-title">
              Qual é o seu momento?{" "}
              <BeautyFlower className={styles.spinningFlower} />
            </h2>
          </div>
          <p>Do primeiro cuidado ao último toque.</p>
        </Reveal>
        <div className={styles.editorialGrid}>
          {edits.map((edit, index) => (
            <Reveal key={edit.title} delayMs={index * 85}>
              <Link className={styles.editorialCard} to={edit.to}>
                <div className={styles.editorialMedia}>
                  <ImageWithFallback
                    src={edit.image}
                    alt={edit.title}
                    loading="lazy"
                  />
                  <span className={styles.editorialNumber}>0{index + 1}</span>
                  <span className={styles.editorialArrow}>
                    <ArrowUpRight size={22} />
                  </span>
                </div>
                <div className={styles.editorialCopy}>
                  <span className={styles.eyebrow}>{edit.label}</span>
                  <h3>{edit.title}</h3>
                  <p>{edit.text}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section
        className={styles.section}
        id="selecao"
        aria-labelledby="selection-title"
      >
        <Reveal className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>
              A NOSSA SELEÇÃO, A SUA BELEZA
            </span>
            <h2 id="selection-title">Seu próximo favorito.</h2>
          </div>
          <p>Explore o que combina com você.</p>
        </Reveal>
        <div
          className={styles.categoryTabs}
          role="group"
          aria-label="Filtrar seleção por categoria"
        >
          <button
            type="button"
            aria-pressed={category === "all"}
            onClick={() => setCategory("all")}
          >
            Todos os favoritos
          </button>
          {Object.values(catalogCategories).map((item) => (
            <button
              key={item.slug}
              type="button"
              aria-pressed={category === item.slug}
              onClick={() => setCategory(item.slug)}
            >
              {item.title}
            </button>
          ))}
        </div>
        <div className={styles.selectionGrid} key={category}>
          {selection.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={() => addItem(product.id)}
            />
          ))}
        </div>
        <p className="sr-only" role="status">
          {selection.length} produtos na seleção
        </p>
        <div className={styles.collectionLink}>
          <Button variant="outline" asChild>
            <Link
              to={routes.category(category === "all" ? "maquiagem" : category)}
            >
              Ver a coleção completa <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </section>

      <section className={styles.clubSection} aria-labelledby="club-title">
        <Reveal className={styles.clubCard}>
          <div className={styles.clubIntro}>
            <span className={styles.clubEyebrow}>
              <Sparkles size={16} /> BEAUTY CLUB
            </span>
            <h2 id="club-title">
              Seu toque merece
              <br />
              algo a mais.
            </h2>
            <p>
              {isLoggedIn
                ? "Cada descoberta faz parte da sua jornada. Acompanhe seus pontos e o próximo nível."
                : "Um lugar para quem ama descobrir beleza. Crie sua conta, complete missões e acompanhe sua evolução."}
            </p>
            <Button asChild>
              <Link to={isLoggedIn ? routes.missions : routes.login}>
                {isLoggedIn ? "Explorar minhas missões" : "Quero fazer parte"}{" "}
                <ArrowUpRight size={18} />
              </Link>
            </Button>
          </div>
          <div className={styles.clubDetail}>
            {isLoggedIn ? (
              <>
                <span className={styles.clubEyebrow}>SEU MOMENTO NO CLUBE</span>
                <strong className={styles.clubPoints}>
                  {totalPoints.toLocaleString("pt-BR")} <small>pontos</small>
                </strong>
                <div className={styles.clubLevel}>
                  <span>{levelName}</span>
                  <span>{nextLevelName ?? "Nível máximo"}</span>
                </div>
                <Progress
                  value={progressToNextLevel}
                  className={styles.clubProgress}
                />
                <p>
                  {nextLevelName
                    ? `Faltam ${pointsToNextLevel} pontos para o próximo nível.`
                    : "Continue descobrindo seus favoritos."}
                </p>
                <Link to={routes.ranking} className={styles.textLink}>
                  Ver ranking <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <>
                <span className={styles.clubMonogram} aria-hidden="true">
                  tm
                  <BeautyFlower className={styles.clubFlower} />
                </span>
                <span className={styles.clubSignature}>
                  BELEZA QUE CONECTA.
                </span>
              </>
            )}
          </div>
        </Reveal>
      </section>

      {recentProducts.length > 0 && (
        <section className={styles.section} aria-labelledby="recent-title">
          <Reveal className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>CONTINUE DE ONDE PAROU</span>
              <h2 id="recent-title">Ficaram no seu radar.</h2>
            </div>
          </Reveal>
          <div className={styles.selectionGrid}>
            {recentProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={() => addItem(product.id)}
              />
            ))}
          </div>
        </section>
      )}
      {showScrollTop && (
        <button
          type="button"
          className={styles.scrollTop}
          aria-label="Voltar ao topo"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
            })
          }
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
}
