import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
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
import { useCart } from "@/shared/contexts/cart-context";
import styles from "./HomePage.module.css";

import offSeasonSale from "@/shared/assets/banner-off-season/Sale.png";
import offSeasonSkincare from "@/shared/assets/banner-off-season/Skincare.png";
import byomaImage from "@/shared/assets/Byoma.jpg";
import instagramImage from "@/shared/assets/Instagram.jpg";
import downloadFourImage from "@/shared/assets/download (4).jpg";
import downloadFiveImage from "@/shared/assets/download (5).jpg";
import aintSheSweetImage from "@/shared/assets/Ain't She Sweet Candle Product Shoot - Crickle Daisy - Treesha Millicent.jpg";
import skincareSweetImage from "@/shared/assets/skincare-sweet.jpg";

const trendingProducts = [
  {
    id: "1",
    name: "Lancome - La Vie Est Belle Feminino Eau De Parfum",
    price: 399.9,
    originalPrice: 509.9,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwbe2e132a/images/hi-res-BR/Frag/Nova%20pasta/Quele/LANCOME/3605532612690.01_1000px.jpg?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 124,
    isNew: true,
    discount: 30,
  },
  {
    id: "2",
    name: "Dior Backstage - Blush Rosy Glow",
    price: 280.9,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwac4c8ec5/images/Color%20BR/DIOR/2025/atualizar/rosyGlow/004/1.3348901665827.jpg?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 89,
    isNew: true,
  },
  {
    id: "3",
    name: "MAC - Batom Matte Macximall",
    price: 79.9,
    originalPrice: 119.9,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwe3f4fb81/images/Color%20BR/MAC/2024/MACXIMAL/Ruby_Woo/773602685189_1.jpg?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 203,
    discount: 33,
  },
  {
    id: "4",
    name: "Chloe - Perfume Feminino Eau de Parfum",
    price: 391.9,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwada68e19/images/hi-res-BR/688575201901_1500px.jpg?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 156,
    isNew: true,
  },
  {
    id: "5",
    name: "Rare Beauty - Kit Mini Blush + Mini Lip Oil",
    price: 269.9,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwd9ff0b36/images/Color%20BR/RARE%20BEAUTY/2025/kit_vday/840122906831_1.jpg?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 178,
  },
  {
    id: "6",
    name: "Wella Professional - Kit Blondorlex 6",
    price: 454.9,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwd2b0c429/images/hi-res-BR/Merchandising2%20-%20Hair/Wella%20Kits/kIT58/KIT158.png?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 92,
  },
  {
    id: "7",
    name: "Glow Recipe - Creme de Tratamento Noturno Watermelon Glow",
    price: 179.4,
    originalPrice: 289.0,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwa0e65582/images/hi-res-BR/PDPs/IIP/GlowRecipe/WM/NC/810052961620--full-size-packshot.jpg?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 341,
    discount: 30,
  },
  {
    id: "8",
    name: "Gucci - Bloom Ambrosia di Fiori Eau de Parfum",
    price: 847.8,
    image:
      "https://www.sephora.com.br/dw/image/v2/BFJC_PRD/on/demandware.static/-/Sites-masterCatalog_Sephora/pt_BR/dwe21f1d41/images/hi-res-BR/Frag/Nova%20pasta/Maria%20Helena%202.0/New%20Folder/MA%202.0/MA%203.0/3616305275745.jpeg?sw=1200&sh=1200&sm=fit",
    rating: 5,
    reviews: 215,
    isNew: true,
  },
];

const faqs = [
  {
    question: "Qual o prazo de entrega?",
    answer:
      "O prazo de entrega varia de acordo com sua regiao. Para compras acima de R$ 150, o frete e gratis! Geralmente, entregamos em 5-10 dias uteis.",
  },
  {
    question: "Como funciona a politica de trocas?",
    answer:
      "Voce tem ate 30 dias para trocar ou devolver produtos nao utilizados. Basta entrar em contato com nossa central de atendimento.",
  },
  {
    question: "Os produtos sao originais?",
    answer:
      "Sim! Todos os nossos produtos sao 100% originais e adquiridos diretamente das marcas ou distribuidores autorizados.",
  },
  {
    question: "Posso parcelar minhas compras?",
    answer:
      "Sim! Aceitamos parcelamento em ate 6x sem juros no cartao de credito para compras acima de R$ 100.",
  },
];

const favoriteProducts = [
  { id: "fav-1", image: byomaImage, title: "byoma" },
  { id: "fav-2", image: instagramImage, title: "dior" },
  { id: "fav-3", image: downloadFourImage, title: "innisfree" },
  { id: "fav-4", image: downloadFiveImage, title: "mella" },
  { id: "fav-5", image: aintSheSweetImage, title: "crickle daisy" },
  { id: "fav-6", image: skincareSweetImage, title: "offweglow" },
];

export function HomePage() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [heroApi, setHeroApi] = useState<CarouselApi | null>(null);
  const [productApi, setProductApi] = useState<CarouselApi | null>(null);
  const [productIndex, setProductIndex] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [promoCountdown, setPromoCountdown] = useState("06h 00m 00s");

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

    const updateProgress = (api: CarouselApi) => {
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

  return (
    <div className={styles.page}>
      <section className={styles.heroSection}>
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
          <span>Termina em {promoCountdown}</span>
          <button className={styles.promoLink} type="button">
            Ver detalhes
          </button>
        </div>
      </section>

      <section className={styles.trendingSection}>
        <div className={styles.trendingContainer}>
          <div className={styles.trendingHeader}>
            <h2 className={styles.trendingTitle}>Novidades</h2>
          </div>

          <Carousel
            className={styles.productCarousel}
            opts={{ align: "start", loop: true }}
            setApi={setProductApi}
          >
            <CarouselContent className={styles.productCarouselContent}>
              {trendingProducts.slice(0, 12).map((product) => (
                <CarouselItem key={product.id} className={styles.productCarouselItem}>
                  <ProductCard {...product} onAddToCart={() => addItem(1)} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className={styles.productCarouselPrev} />
            <CarouselNext className={styles.productCarouselNext} />
          </Carousel>
          <div className={styles.productCarouselProgress}>
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
            <h2 className={styles.trendingTitle}>Favoritos da semana</h2>
          </div>

          <div className={styles.favoritesGrid}>
            {favoriteProducts.map((product) => (
              <div
                key={`favorite-${product.id}`}
                className={styles.favoriteCard}
                role="button"
                tabIndex={0}
                onClick={() => navigate(routes.category("feminino"))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(routes.category("feminino"));
                  }
                }}
              >
                <ImageWithFallback
                  src={product.image}
                  alt={product.title}
                  className={styles.favoriteImage}
                />
                <button
                  className={styles.favoriteCaptionButton}
                  type="button"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className={styles.favoriteCaption}>{product.title}</span>
                </button>
              </div>
            ))}
          </div>

          <div className={styles.trendingSubHeader}>
            <h2 className={styles.trendingTitle}>Recomendados</h2>
          </div>

          <div className={styles.recommendedGrid}>
            {Array.from({ length: 18 }).map((_, index) => {
              const product = trendingProducts[index % trendingProducts.length];
              return (
                <div key={`recommended-${index}`} className={styles.recommendedItem}>
                  <ProductCard {...product} onAddToCart={() => addItem(1)} />
                </div>
              );
            })}
          </div>

          <div className={styles.trendingButtonWrap}>
            <Button
              size="sm"
              variant="default"
              className={styles.trendingButton}
              onClick={() => navigate(routes.category("feminino"))}
            >
              Ver tudo
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqContainer}>
          <div className={styles.faqHeader}>
            <h2 className={styles.faqTitle}>PERGUNTAS FREQUENTES</h2>
          </div>

          <Accordion type="single" collapsible className={styles.faqAccordion}>
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className={styles.faqItem}
              >
                <AccordionTrigger className={styles.faqTrigger}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className={styles.faqContent}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className={styles.faqButtonWrap}>
            <Button
              size="lg"
              variant="outline"
              className={styles.faqButton}
              onClick={() => navigate(routes.help)}
            >
              VER TODAS
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function LotusPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`${styles.lotusPattern} ${className}`}>
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
