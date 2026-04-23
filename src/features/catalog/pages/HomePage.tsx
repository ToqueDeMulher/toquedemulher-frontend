import { useEffect, useState } from "react";
import { ChevronUp, Crown, MessageCircle, Sparkles, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { routes } from "@/shared/lib/routes";
import { useAuth } from "@/shared/contexts/auth-context";
import { useCart } from "@/shared/contexts/cart-context";
import { useGamification } from "@/shared/contexts/gamification-context";
import {
  defaultCategorySlug,
  getProductById,
  trendingProducts,
  type CatalogProduct,
} from "@/shared/data/catalog-products";
import styles from "./HomePage.module.css";

import offSeasonSale from "@/shared/assets/banner-off-season/Sale.png";
import offSeasonSkincare from "@/shared/assets/banner-off-season/Skincare.png";
import aintSheSweetImage from "@/shared/assets/favorites-cards/Ain't She Sweet Candle Product Shoot - Crickle Daisy - Treesha Millicent.jpg";
import byomaImage from "@/shared/assets/favorites-cards/Byoma.jpg";
import gisouLipOilImage from "@/shared/assets/favorites-cards/Gisou_Honey_Infused_lip_oil.jpg";
import blueTubeImage from "@/shared/assets/favorites-cards/Instagram (1).jpg";
import instagramTwoImage from "@/shared/assets/favorites-cards/Instagram (2).jpg";
import instagramImage from "@/shared/assets/favorites-cards/Instagram.jpg";
import sanrioImage from "@/shared/assets/favorites-cards/Mei_Melody_Instagram.jpg";
import skincareSweetImage from "@/shared/assets/favorites-cards/skincare-sweet.jpg";
import downloadFourImage from "@/shared/assets/favorites-cards/download (4).jpg";
import downloadFiveImage from "@/shared/assets/favorites-cards/download (5).jpg";
import beVelvetImage from "@/shared/assets/favorites-cards/download (6).jpg";
import downloadSevenImage from "@/shared/assets/favorites-cards/download (7).jpg";
import glamOnImage from "@/shared/assets/favorites-cards/Game_on_Glam_on.jpg";
const faqs = [
  {
    question: "Qual o prazo de entrega?",
    answer:
      "O prazo de entrega varia de acordo com sua região. Para compras acima de R$ 150, o frete é grátis! Geralmente, entregamos em 5 a 10 dias úteis.",
  },
  {
    question: "Como funciona a política de trocas?",
    answer:
      "Você tem até 30 dias para trocar ou devolver produtos não utilizados. Basta entrar em contato com nossa central de atendimento.",
  },
  {
    question: "Os produtos são originais?",
    answer:
      "Sim! Todos os nossos produtos são 100% originais e adquiridos diretamente das marcas ou distribuidores autorizados.",
  },
  {
    question: "Posso parcelar minhas compras?",
    answer:
      "Sim! Aceitamos parcelamento em até 6x sem juros no cartão de crédito para compras acima de R$ 100.",
  },
];

const favoriteProducts = [
  { id: "fav-1", image: byomaImage, title: "byoma" },
  { id: "fav-2", image: instagramImage, title: "dior" },
  { id: "fav-3", image: downloadFourImage, title: "innisfree" },
  { id: "fav-4", image: downloadFiveImage, title: "mella" },
  { id: "fav-5", image: aintSheSweetImage, title: "crickle daisy" },
  { id: "fav-6", image: skincareSweetImage, title: "offweglow" },
  { id: "fav-7", image: beVelvetImage, title: "beauty of joseon" },
  { id: "fav-8", image: gisouLipOilImage, title: "gisou" },
  { id: "fav-9", image: sanrioImage, title: "sheglam" },
  { id: "fav-10", image: blueTubeImage, title: "be velvet" },
  { id: "fav-12", image: downloadSevenImage, title: "joocyee" },
  { id: "fav-13", image: instagramTwoImage, title: "colorgram" },
  { id: "fav-14", image: glamOnImage, title: "judydoll" },
];

const applyDominantColor = (img: HTMLImageElement) => {
  const card = img.closest(`.${styles.favoriteCard}`) as HTMLElement | null;
  if (!card || img.naturalWidth === 0 || img.naturalHeight === 0) return;

  try {
    const canvas = document.createElement("canvas");
    const size = 48;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    const step = 4 * 2;
    for (let i = 0; i < data.length; i += step) {
      const alpha = data[i + 3];
      if (alpha < 200) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count += 1;
    }

    if (count === 0) return;
    const avgR = Math.round(r / count);
    const avgG = Math.round(g / count);
    const avgB = Math.round(b / count);
    card.style.setProperty("--favorite-dominant", `${avgR}, ${avgG}, ${avgB}`);

    const luminance = (0.2126 * avgR + 0.7152 * avgG + 0.0722 * avgB) / 255;
    const textColor =
      luminance > 0.62 ? "rgba(17, 24, 39, 0.9)" : "rgba(255, 255, 255, 0.95)";
    card.style.setProperty("--favorite-text", textColor);
  } catch {
  }
};

export function HomePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addItem } = useCart();
  const {
    completedMissionsCount,
    levelName,
    missions,
    nextLevelName,
    pointsToNextLevel,
    progressToNextLevel,
    totalPoints,
  } = useGamification();
  const [heroApi, setHeroApi] = useState<CarouselApi | null>(null);
  const [productApi, setProductApi] = useState<CarouselApi | null>(null);
  const [productIndex, setProductIndex] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [promoCountdown, setPromoCountdown] = useState("06h 00m 00s");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const recentKey = "tdm_recent_products";

  const loadRecentIds = () => {
    try {
      const raw = window.localStorage.getItem(recentKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  };

  const saveRecentIds = (ids: string[]) => {
    try {
      window.localStorage.setItem(recentKey, JSON.stringify(ids));
    } catch {
    }
  };

  const handleRecentClick = (productId: string) => {
    const current = loadRecentIds();
    const next = [productId, ...current.filter((id) => id !== productId)].slice(0, 12);
    saveRecentIds(next);
    setRecentIds(next);
    navigate(routes.product(productId));
  };

  useEffect(() => {
    if (!heroApi) return;
    const intervalId = window.setInterval(() => {
      heroApi.scrollNext();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [heroApi]);

  useEffect(() => {
    if (!productApi) return;

    const updateProgress = (api?: CarouselApi) => {
      if (!api) return;
      const snaps = api.scrollSnapList();
      const index = api.selectedScrollSnap();
      setProductCount(snaps.length);
      setProductIndex(index);
    };

    updateProgress(productApi);
    productApi.on("select", updateProgress);
    productApi.on("reInit", updateProgress);

    return () => {
      productApi.off("select", updateProgress);
      productApi.off("reInit", updateProgress);
    };
  }, [productApi]);

  useEffect(() => {
    const endsAt = Date.now() + 6 * 60 * 60 * 1000;

    const tick = () => {
      const remaining = Math.max(0, endsAt - Date.now());
      const totalSeconds = Math.floor(remaining / 1000);
      const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
      const seconds = String(totalSeconds % 60).padStart(2, "0");
      setPromoCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setRecentIds(loadRecentIds());
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 360);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const recentProducts = recentIds
    .map((id) => getProductById(id))
    .filter((product): product is CatalogProduct => Boolean(product));
  const highlightedMissions = missions.filter((mission) => !mission.completed).slice(0, 2);

  const recentCardStyle = {
    "--product-card-min-h": "320px",
    "--product-card-min-h-sm": "350px",
    "--product-card-image-h": "11.5rem",
    "--product-card-image-h-sm": "13rem",
    "--product-card-bg": "transparent",
    "--product-card-border": "none",
  } as React.CSSProperties;

  const recommendedCardStyle = {
    "--product-card-bg": "transparent",
    "--product-card-border": "none",
  } as React.CSSProperties;

  return (
    <div className={styles.page}>
      <section className={styles.heroSection} aria-label="Destaques principais">
        <LotusPattern />
        <Carousel
          className={styles.carousel}
          opts={{ loop: true, align: "start" }}
          setApi={setHeroApi}
        >
          <CarouselContent>
            <CarouselItem>
              <div className={styles.slide}>
                <ImageWithFallback
                  src={offSeasonSale}
                  alt="Off Season - Sale"
                  className={styles.slideImageAbsolute}
                />
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className={styles.slide}>
                <ImageWithFallback
                  src={offSeasonSkincare}
                  alt="Off Season - Skincare"
                  className={styles.slideImageAbsolute}
                />
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className={styles.carouselPrev} />
          <CarouselNext className={styles.carouselNext} />
        </Carousel>
      </section>

      <section className={styles.promoStrip} aria-label="Cupom promocional">
        <div className={styles.promoStripInner}>
          <span>8% OFF em compras acima de R$ 79</span>
          <span className={styles.promoSep}>|</span>
          <span>10% OFF em compras acima de R$ 149</span>
          <span className={styles.promoSep}>|</span>
          <span>15% OFF em compras acima de R$ 199</span>
          <span className={styles.promoCodeWrap}>
            Use o código <span className={styles.promoCode}>GIFT26</span>
          </span>
          <span aria-live="off">Termina em {promoCountdown}</span>
          <Link className={styles.promoLink} to={routes.help}>
            Ver detalhes
          </Link>
        </div>
      </section>

      <section className={styles.clubSection}>
        <div className={styles.clubCard}>
          <div className={styles.clubIntro}>
            <div className={styles.clubEyebrow}>
              <Sparkles className={styles.clubEyebrowIcon} />
              Beauty Club
            </div>
            <h2 className={styles.clubTitle}>Acompanhe sua evolução enquanto compra</h2>
            <p className={styles.clubText}>
              {isLoggedIn
                ? "Seu progresso está salvo. Complete missões, some pontos e apareça no ranking."
                : "Faça login para salvar seus pontos, liberar missões e entrar no ranking do clube."}
            </p>

            <div className={styles.clubActions}>
              <Button
                size="sm"
                className={styles.clubPrimaryButton}
                onClick={() => navigate(isLoggedIn ? routes.missions : routes.login)}
              >
                <Target className={styles.clubButtonIcon} />
                {isLoggedIn ? "Ver missões" : "Fazer login"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={styles.clubSecondaryButton}
                onClick={() => navigate(routes.ranking)}
              >
                <Crown className={styles.clubButtonIcon} />
                Ver ranking
              </Button>
            </div>
          </div>

          <div className={styles.clubPanel}>
            <div className={styles.clubStatsGrid}>
              <article className={styles.clubStatCard}>
                <span className={styles.clubStatLabel}>Pontos</span>
                <strong className={styles.clubStatValue}>
                  {totalPoints.toLocaleString("pt-BR")}
                </strong>
              </article>
              <article className={styles.clubStatCard}>
                <span className={styles.clubStatLabel}>Nível</span>
                <strong className={styles.clubStatValue}>{levelName}</strong>
              </article>
              <article className={styles.clubStatCard}>
                <span className={styles.clubStatLabel}>Missões feitas</span>
                <strong className={styles.clubStatValue}>{completedMissionsCount}</strong>
              </article>
            </div>

            <div className={styles.clubProgressCard}>
              <div className={styles.clubProgressHeader}>
                <div>
                  <p className={styles.clubProgressTitle}>Próximo nível</p>
                  <p className={styles.clubProgressText}>
                    {nextLevelName
                      ? `${pointsToNextLevel} pontos para ${nextLevelName}`
                      : "Você já chegou ao nível máximo"}
                  </p>
                </div>
                <Badge className={styles.clubBadge}>{levelName}</Badge>
              </div>
              <Progress value={progressToNextLevel} className={styles.clubProgressBar} />
            </div>

            <div className={styles.clubMissionList}>
              {highlightedMissions.map((mission) => (
                <div key={mission.id} className={styles.clubMissionCard}>
                  <div>
                    <p className={styles.clubMissionTitle}>{mission.title}</p>
                    <p className={styles.clubMissionText}>{mission.description}</p>
                  </div>
                  <Badge className={styles.clubMissionBadge}>
                    {mission.progressLabel}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.trendingSection}>
        <div className={styles.trendingContainer}>
          <div className={styles.trendingHeader}>
            <h2 id="home-novidades-title" className={styles.trendingTitle}>
              Novidades
            </h2>
          </div>

          <Carousel
            className={styles.productCarousel}
            opts={{ align: "start", loop: true }}
            setApi={setProductApi}
          >
            <CarouselContent className={styles.productCarouselContent}>
              {trendingProducts.slice(0, 12).map((product) => (
                <CarouselItem key={product.id} className={styles.productCarouselItem}>
                  <ProductCard
                    {...product}
                    onAddToCart={() => addItem(product.id, 1)}
                    onClick={() => handleRecentClick(product.id)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className={styles.productCarouselPrev} />
            <CarouselNext className={styles.productCarouselNext} />
          </Carousel>
          <div className={styles.productCarouselProgress} aria-hidden="true">
            {Array.from({ length: productCount }).map((_, index) => (
              <span
                key={`product-dot-${index}`}
                className={`${styles.productCarouselDot} ${
                  index === productIndex ? styles.productCarouselDotActive : ""
                }`}
              />
            ))}
          </div>

          <div className={styles.trendingSubHeader}>
            <h2 id="home-favorites-title" className={styles.trendingTitle}>
              Favoritos da Semana
            </h2>
          </div>

          <div className={styles.favoritesGrid}>
            {favoriteProducts.slice(0, 8).map((product) => (
              <Link
                key={`favorite-${product.id}`}
                className={styles.favoriteCard}
                role="button"
                tabIndex={0}
                onClick={() => navigate(routes.category(defaultCategorySlug))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(routes.category(defaultCategorySlug));
                  }
                }}
              >
                <ImageWithFallback
                  src={product.image}
                  alt=""
                  className={styles.favoriteImage}
                  onLoad={(event) => applyDominantColor(event.currentTarget)}
                />
                <div className={styles.favoriteGradient} aria-hidden="true" />
                <span className={styles.favoriteCaption}>{product.title}</span>
              </Link>
            ))}
          </div>
          {favoriteProducts.length > 8 && (
            <div className={styles.favoritesGridCompact}>
              {favoriteProducts.slice(8).map((product) => (
                <Link
                  key={`favorite-compact-${product.id}`}
                  className={`${styles.favoriteCard} ${styles.favoriteCardCompact}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(routes.category(defaultCategorySlug))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(routes.category(defaultCategorySlug));
                    }
                  }}
                >
                  <ImageWithFallback
                    src={product.image}
                    alt=""
                    className={styles.favoriteImageCompact}
                    onLoad={(event) => applyDominantColor(event.currentTarget)}
                  />
                  <div className={styles.favoriteGradient} aria-hidden="true" />
                  <span className={styles.favoriteCaption}>{product.title}</span>
                </Link>
              ))}
            </div>
          )}

          <div className={styles.trendingSubHeader}>
            <h2 id="home-recommended-title" className={styles.trendingTitle}>
              Recomendados
            </h2>
          </div>

          <div className={styles.recommendedBox}>
            <div className={styles.recommendedGrid}>
              {Array.from({ length: 18 }).map((_, index) => {
                const product = trendingProducts[index % trendingProducts.length];
                return (
                  <div key={`recommended-${index}`} className={styles.recommendedItem}>
                    <ProductCard
                      {...product}
                      style={recommendedCardStyle}
                      onAddToCart={() => addItem(product.id, 1)}
                      onClick={() => handleRecentClick(product.id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.trendingButtonWrap}>
            <Button
              size="sm"
              variant="default"
              className={styles.trendingButton}
              onClick={() => navigate(routes.category(defaultCategorySlug))}
            >
              Ver tudo
            </Button>
          </div>

          {recentProducts.length > 0 && (
            <section className={styles.recentSection} aria-label="Visto recentemente">
              <div className={styles.recentHeader}>
                <h2 className={styles.recentTitle}>Visto recentemente</h2>
              </div>
              <div className={styles.recentGrid}>
                {recentProducts.map((product) => (
                  <div key={`recent-${product.id}`} className={styles.recommendedItem}>
                    <ProductCard
                      {...product}
                      style={recentCardStyle}
                      onAddToCart={() => addItem(product.id, 1)}
                      onClick={() => handleRecentClick(product.id)}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
          {showScrollTop && (
        <>
          <button
            type="button"
            className={styles.scrollChatButton}
            aria-label="Abrir chat"
            onClick={() => navigate(routes.help)}
          >
            <MessageCircle className={styles.scrollTopIcon} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.scrollTopButton}
            aria-label="Voltar ao topo"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ChevronUp className={styles.scrollTopIcon} aria-hidden="true" />
          </button>
        </>
      )}

    </div>
  );
}

function LotusPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.lotusPattern} ${className}`} aria-hidden="true">
      <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="#FF69B4"
          d="M45.7,-76.3C58.9,-69.3,69.1,-58.3,76.5,-46.3C83.9,-34.3,88.5,-21.3,87.3,-8.7C86.1,3.9,79.1,16.1,71.1,27.2C63.1,38.3,54.1,48.3,43.5,56.8C32.9,65.3,20.7,72.3,7.9,73.6C-4.9,74.9,-18.3,70.5,-30.9,63.4C-43.5,56.3,-55.3,46.5,-64.3,34.5C-73.3,22.5,-79.5,8.3,-78.9,-5.6C-78.3,-19.5,-70.9,-33.1,-60.7,-43.3C-50.5,-53.5,-37.5,-60.3,-24.8,-67.6C-12.1,-74.9,0.3,-82.7,13.2,-80.7C26.1,-78.7,39.5,-66.9,45.7,-76.3Z"
          transform="translate(100 100)"
        />
      </svg>
    </div>
  );
}
