import { useEffect, useState } from "react";
import {
  ChevronUp,
  Crown,
  MessageCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { routes } from "@/app/router/paths";
import { useAuth } from "@/features/auth/context/auth-context";
import { useCart } from "@/features/cart/context/cart-context";
import { Reveal } from "@/shared/animation/Reveal";
import {
  defaultCategorySlug,
  getProductById,
  trendingProducts,
  type CatalogProduct,
} from "@/features/catalog/data/catalog-products";
import { useGamification } from "@/features/gamification/context/gamification-context";
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

      <section className={styles.clubSection}>
        <div className={styles.trendingContainer}>
          <Reveal className={styles.clubCard} delayMs={60}>
          <div className={styles.clubIntro}>
            <div className={styles.clubIntroTop}>
              <div className={styles.clubEyebrow}>
                <Sparkles className={styles.clubEyebrowIcon} />
                Beauty Club
              </div>
              <div className={styles.clubHeroGlow} aria-hidden="true" />
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
                <div className={styles.clubProgressInfo}>
                  <p className={styles.clubProgressTitle}>Próximo nível</p>
                  <p className={styles.clubProgressText}>
                    {nextLevelName
                      ? `${pointsToNextLevel} pontos para ${nextLevelName}`
                      : "Você já chegou ao nível máximo"}
                  </p>
                </div>
                <Badge className={styles.clubBadge}>{levelName}</Badge>
              </div>
              <div className={styles.clubProgressMeta}>
                <span className={styles.clubProgressMetaItem}>
                  {Math.round(progressToNextLevel)}% concluído
                </span>
                <span className={styles.clubProgressMetaItem}>
                  {nextLevelName ? `${nextLevelName} a seguir` : "Meta concluída"}
                </span>
              </div>
              <Progress value={progressToNextLevel} className={styles.clubProgressBar} />
            </div>

            <div className={styles.clubMissionList}>
              {highlightedMissions.slice(0, 1).map((mission) => (
                <div key={mission.id} className={styles.clubMissionCard}>
                  <div className={styles.clubMissionContent}>
                    <p className={styles.clubMissionTitle}>{mission.title}</p>
                    <p className={styles.clubMissionText}>{mission.progressLabel}</p>
                  </div>
                  <Badge className={styles.clubMissionBadge}>
                    Missão ativa
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        </div>
      </section>

      <section className={styles.trendingSection}>
        <div className={styles.trendingContainer}>
          <Reveal className={styles.trendingHeader} delayMs={40}>
            <h2 id="home-novidades-title" className={styles.trendingTitle}>
              Novidades
            </h2>
          </Reveal>

          <Reveal delayMs={120}>
            <Carousel
              className={styles.productCarousel}
              opts={{ align: "start", loop: true }}
              setApi={setProductApi}
            >
              <CarouselContent className={styles.productCarouselContent}>
                {trendingProducts.slice(0, 10).map((product) => (
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
          </Reveal>
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

          <Reveal className={styles.trendingSubHeader} delayMs={90}>
            <h2 id="home-favorites-title" className={styles.trendingTitle}>
              Favoritos da Semana
            </h2>
          </Reveal>

          <Reveal className={styles.favoritesGrid} delayMs={130}>
            {favoriteProducts.slice(0, 4).map((product) => (
              <Link
                key={`favorite-${product.id}`}
                className={styles.favoriteCard}
                to={routes.category(defaultCategorySlug)}
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
          </Reveal>
          <Reveal className={styles.trendingSubHeader} delayMs={110}>
            <h2 id="home-recommended-title" className={styles.trendingTitle}>
              Recomendados
            </h2>
          </Reveal>

          <Reveal className={styles.recommendedBox} delayMs={150}>
            <div className={styles.recommendedGrid}>
              {Array.from({ length: 12 }).map((_, index) => {
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
          </Reveal>

          <Reveal className={styles.trendingButtonWrap} delayMs={160}>
            <Button
              size="sm"
              variant="default"
              className={styles.trendingButton}
              onClick={() => navigate(routes.category(defaultCategorySlug))}
            >
              Ver tudo
            </Button>
          </Reveal>

          {recentProducts.length > 0 && (
            <Reveal delayMs={180}>
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
            </Reveal>
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
