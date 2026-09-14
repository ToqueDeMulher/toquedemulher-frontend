import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Sparkles,
  MessageCircle,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import { Reveal } from "@/shared/animation/Reveal";
import { routes } from "@/app/router/paths";
import beautyImage from "@/shared/assets/favorites-cards/Gisou_Honey_Infused_lip_oil.jpg";
import ritualImage from "@/shared/assets/favorites-cards/Byoma.jpg";
import { BeautyFlower } from "@/shared/ui/BeautyFlower";
import styles from "./AboutPage.module.css";

const values = [
  {
    icon: Heart,
    title: "Beleza com identidade",
    text: "Acreditamos na beleza que respeita seu estilo. Aquela que faz sentido para você, no seu tempo e do seu jeito.",
  },
  {
    icon: Sparkles,
    title: "Escolhas com cuidado",
    text: "Maquiagem, skincare e pequenos rituais de autocuidado. Um universo para explorar novas texturas, cores e possibilidades.",
  },
  {
    icon: MessageCircle,
    title: "Uma relação próxima",
    text: "Da primeira descoberta às dúvidas sobre o pedido, queremos tornar cada etapa mais simples e acolhedora.",
  },
];

export function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Reveal className={styles.heroCopy}>
          <span className={styles.eyebrow}>A ESSÊNCIA DA TOQUE DE MULHER</span>
          <h1>
            Beleza para sentir.
            <br />
            Liberdade para
            <br />
            <span>ser você.</span>
          </h1>
          <p>
            Nascemos da paixão pela beleza e da vontade de transformar o cuidado
            em um momento especial. Um toque de cor, de confiança, de você.
          </p>
          <a href="#nossa-historia" className={styles.textLink}>
            Conheça a nossa história <ArrowRight size={17} />
          </a>
        </Reveal>
        <Reveal className={styles.heroMedia} delayMs={100}>
          <ImageWithFallback
            src={beautyImage}
            alt="Detalhes de um ritual de beleza com lip oil"
            className={styles.heroImage}
          />
          <span className={styles.imageNote}>NOSSO UNIVERSO, SEU MOMENTO.</span>
        </Reveal>
      </section>

      <section className={styles.manifesto} id="nossa-historia">
        <Reveal>
          <BeautyFlower className={styles.storyFlower} />
          <span className={styles.eyebrow}>UM OLHAR MAIS PRÓXIMO</span>
          <h2>
            Não existe um jeito único
            <br />
            de ser bonita. <span>Existe o seu.</span>
          </h2>
          <p>
            A Toque de Mulher nasceu em 2024 com uma ideia simples: aproximar
            você de produtos que despertem o prazer de se cuidar. Acreditamos
            que beleza é expressão, descoberta e confiança na própria pele.
          </p>
          <p>
            Queremos fazer parte dos seus pequenos rituais. Do skincare que abre
            o dia à maquiagem que acompanha um momento especial, cada escolha
            tem espaço para contar uma história.
          </p>
        </Reveal>
      </section>

      <section className={styles.valuesSection} aria-labelledby="values-title">
        <Reveal className={styles.sectionHeading}>
          <span className={styles.eyebrow}>O QUE NOS MOVE</span>
          <h2 id="values-title">Cuidado, em cada detalhe.</h2>
        </Reveal>
        <div className={styles.valuesGrid}>
          {values.map(({ icon: Icon, title, text }, index) => (
            <Reveal
              key={title}
              className={styles.valueCard}
              delayMs={index * 80}
            >
              <div className={styles.valueTop}>
                <Icon size={25} strokeWidth={1.3} />
                <span>0{index + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={styles.ritualSection}>
        <Reveal className={styles.ritualMedia}>
          <ImageWithFallback
            src={ritualImage}
            alt="Produtos de skincare em uma composição colorida"
            loading="lazy"
          />
        </Reveal>
        <Reveal className={styles.ritualCopy} delayMs={100}>
          <span className={styles.eyebrow}>SEU RITUAL COMEÇA AQUI</span>
          <h2>
            Uma pausa.
            <br />
            Um cuidado.
            <br />
            Um toque seu.
          </h2>
          <p>
            Um novo favorito pode mudar o seu dia. Explore nossas coleções e
            encontre o que combina com o seu momento.
          </p>
          <Link
            to={routes.category("maquiagem")}
            className={styles.primaryLink}
          >
            Descobrir a coleção <ArrowUpRight size={19} />
          </Link>
        </Reveal>
      </section>

      <section className={styles.helpSection}>
        <Reveal className={styles.helpHeader}>
          <Package size={24} strokeWidth={1.3} />
          <div>
            <h2>Conte com a gente.</h2>
            <p>As informações que você precisa, sempre por perto.</p>
          </div>
        </Reveal>
        <div className={styles.helpLinks}>
          <Link to={routes.help}>
            Entrega e atendimento <ArrowUpRight size={18} />
          </Link>
          <Link to={routes.institutional("trocas")}>
            Trocas e devoluções <ArrowUpRight size={18} />
          </Link>
          <Link to={routes.institutional("privacidade")}>
            Privacidade e seus dados <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
