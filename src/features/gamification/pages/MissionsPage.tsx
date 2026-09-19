import type { CSSProperties, ReactNode } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Eye,
  Flower2,
  Gift,
  Heart,
  LogIn,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { BeautyFlower } from "@/shared/ui/BeautyFlower";
import { routes } from "@/app/router/paths";
import { useAuth } from "@/features/auth/context/auth-context";
import {
  useGamification,
  type GamificationMission,
} from "@/features/gamification/context/gamification-context";
import styles from "./MissionsPage.module.css";

const ICON_MAP: Record<string, ReactNode> = {
  Sparkles: <Sparkles className={styles.missionIconSvg} />,
  Eye: <Eye className={styles.missionIconSvg} />,
  ShoppingCart: <ShoppingCart className={styles.missionIconSvg} />,
  ShoppingBag: <ShoppingBag className={styles.missionIconSvg} />,
  Target: <Target className={styles.missionIconSvg} />,
  Trophy: <Trophy className={styles.missionIconSvg} />,
};

const TRACK_LABELS = {
  daily: "Descobrir",
  weekly: "Evoluir",
  special: "Conquistar",
} as const;

function MissionCard({ mission }: { mission: GamificationMission }) {
  const progressPercent = Math.min(
    100,
    (mission.progress / mission.targetCount) * 100,
  );

  return (
    <article
      className={`${styles.missionCard} ${
        mission.completed ? styles.missionCardCompleted : ""
      }`}
    >
      <span
        className={`${styles.missionIconWrap} ${
          mission.completed ? styles.missionIconWrapCompleted : ""
        }`}
      >
        {mission.completed ? (
          <CheckCircle2 className={styles.missionIconSvg} />
        ) : (
          ICON_MAP[mission.icon]
        )}
      </span>

      <div className={styles.missionBody}>
        <div className={styles.missionMetaRow}>
          <span className={styles.missionTrack}>{TRACK_LABELS[mission.type]}</span>
          <span
            className={
              mission.completed ? styles.completedBadge : styles.rewardBadge
            }
          >
            {mission.completed ? "Concluída" : `+${mission.pointsReward} pontos`}
          </span>
        </div>

        <h3 className={styles.missionTitle}>{mission.title}</h3>
        <p className={styles.missionDescription}>{mission.description}</p>

        {mission.completed ? (
          <div className={styles.completedMessage}>
            <Award className={styles.completedMessageIcon} />
            Recompensa adicionada à sua jornada
          </div>
        ) : (
          <>
            <div className={styles.progressHeader}>
              <span>{mission.progressLabel}</span>
              <strong>{Math.round(progressPercent)}%</strong>
            </div>
            <Progress
              value={progressPercent}
              className={styles.progressBar}
              aria-label={`Progresso de ${mission.title}: ${Math.round(progressPercent)}%`}
            />
            <Button asChild variant="outline" size="sm" className={styles.missionAction}>
              <Link to={mission.ctaRoute}>
                {mission.ctaLabel}
                <ArrowRight className={styles.actionIcon} />
              </Link>
            </Button>
          </>
        )}
      </div>
    </article>
  );
}

function MissionCollection({
  eyebrow,
  title,
  description,
  missions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  missions: GamificationMission[];
}) {
  return (
    <div className={styles.collection}>
      <header className={styles.collectionHeader}>
        <div>
          <p className={styles.collectionEyebrow}>{eyebrow}</p>
          <h2 className={styles.collectionTitle}>{title}</h2>
          <p className={styles.collectionText}>{description}</p>
        </div>
        <span className={styles.collectionCount}>
          {missions.filter((mission) => mission.completed).length}/{missions.length}
        </span>
      </header>
      <div className={styles.missionList}>
        {missions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>
    </div>
  );
}

export function MissionsPage() {
  const { isLoggedIn } = useAuth();
  const {
    completedMissionsCount,
    levelName,
    missions,
    nextLevelName,
    pointsToNextLevel,
    progressToNextLevel,
    totalPoints,
  } = useGamification();

  if (!isLoggedIn) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <section className={styles.loginCard}>
            <BeautyFlower className={styles.loginFlower} />
            <span className={styles.loginIconWrap}>
              <Flower2 className={styles.loginIcon} />
            </span>
            <p className={styles.loginEyebrow}>Beauty Club</p>
            <h1 className={styles.loginTitle}>Uma jornada que floresce com você.</h1>
            <p className={styles.loginText}>
              Entre para completar missões, colecionar pontos e acompanhar cada
              nova conquista no clube.
            </p>
            <Button asChild className={styles.loginButton}>
              <Link to={routes.login}>
                <LogIn className={styles.loginButtonIcon} />
                Entrar no Beauty Club
              </Link>
            </Button>
          </section>
        </div>
      </div>
    );
  }

  const discoveryMissions = missions.filter((mission) => mission.type === "daily");
  const evolutionMissions = missions.filter((mission) => mission.type === "weekly");
  const achievementMissions = missions.filter((mission) => mission.type === "special");
  const nextMission = missions.find((mission) => !mission.completed);
  const remainingMissions = missions.length - completedMissionsCount;
  const ringStyle = {
    "--club-progress": `${progressToNextLevel}%`,
  } as CSSProperties;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <BeautyFlower className={styles.heroFlower} />
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>
              <Sparkles className={styles.heroEyebrowIcon} />
              Beauty Club
            </p>
            <h1 className={styles.heroTitle}>Sua beleza, sua jornada.</h1>
            <p className={styles.heroText}>
              Cada descoberta rende pontos. Cada missão revela um novo nível.
              Avance no seu ritmo e celebre os pequenos rituais.
            </p>
            <div className={styles.heroStats}>
              <div>
                <strong>{totalPoints.toLocaleString("pt-BR")}</strong>
                <span>pontos</span>
              </div>
              <div>
                <strong>{completedMissionsCount}</strong>
                <span>conquistas</span>
              </div>
              <div>
                <strong>{remainingMissions}</strong>
                <span>para florescer</span>
              </div>
            </div>
          </div>

          <div className={styles.levelCard}>
            <div className={styles.levelRing} style={ringStyle}>
              <div className={styles.levelRingCenter}>
                <span>Nível</span>
                <strong>{levelName}</strong>
              </div>
            </div>
            <div className={styles.levelCopy}>
              <span className={styles.levelCaption}>Seu florescer</span>
              <strong>
                {nextLevelName ? `${pointsToNextLevel} pontos` : "Jornada completa"}
              </strong>
              <p>
                {nextLevelName
                  ? `até alcançar o nível ${nextLevelName}`
                  : "Você chegou ao nível máximo do clube."}
              </p>
            </div>
          </div>
        </section>

        <section className={styles.overviewGrid} aria-label="Resumo da jornada">
          <article className={styles.overviewCard}>
            <span className={styles.overviewIcon}><Target /></span>
            <div>
              <p className={styles.overviewLabel}>Próxima conquista</p>
              <strong className={styles.overviewValue}>
                {nextMission?.title ?? "Todas concluídas"}
              </strong>
              <p className={styles.overviewText}>
                {nextMission?.progressLabel ?? "Sua coleção está completa por agora."}
              </p>
            </div>
          </article>
          <article className={styles.overviewCard}>
            <span className={styles.overviewIcon}><Gift /></span>
            <div>
              <p className={styles.overviewLabel}>Próxima recompensa</p>
              <strong className={styles.overviewValue}>
                {nextMission ? `+${nextMission.pointsReward} pontos` : "Tudo coletado"}
              </strong>
              <p className={styles.overviewText}>Entra automaticamente ao concluir.</p>
            </div>
          </article>
          <article className={styles.overviewCard}>
            <span className={styles.overviewIcon}><Heart /></span>
            <div>
              <p className={styles.overviewLabel}>Próximo nível</p>
              <strong className={styles.overviewValue}>{nextLevelName ?? "Aura"}</strong>
              <p className={styles.overviewText}>
                {nextLevelName ? `${pointsToNextLevel} pontos restantes.` : "Você chegou ao topo."}
              </p>
            </div>
          </article>
        </section>

        <section className={styles.tabsSection}>
          <Tabs defaultValue="discover">
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="discover" className={styles.tabsTrigger}>
                Descobrir <span>{discoveryMissions.length}</span>
              </TabsTrigger>
              <TabsTrigger value="evolve" className={styles.tabsTrigger}>
                Evoluir <span>{evolutionMissions.length}</span>
              </TabsTrigger>
              <TabsTrigger value="achieve" className={styles.tabsTrigger}>
                Conquistar <span>{achievementMissions.length}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className={styles.tabsContent}>
              <MissionCollection
                eyebrow="Primeiros passos"
                title="Descubra o seu ritual"
                description="Ações leves para começar a sua história no clube."
                missions={discoveryMissions}
              />
            </TabsContent>
            <TabsContent value="evolve" className={styles.tabsContent}>
              <MissionCollection
                eyebrow="Sua evolução"
                title="Cultive novas escolhas"
                description="Missões para transformar favoritos em uma jornada completa."
                missions={evolutionMissions}
              />
            </TabsContent>
            <TabsContent value="achieve" className={styles.tabsContent}>
              <MissionCollection
                eyebrow="Grandes conquistas"
                title="Faça o seu jardim florescer"
                description="Marcos especiais para quem explora cada parte da experiência."
                missions={achievementMissions}
              />
            </TabsContent>
          </Tabs>
        </section>

        <section className={styles.pointsGuide}>
          <div className={styles.pointsGuideIntro}>
            <p className={styles.collectionEyebrow}>Como funciona</p>
            <h2>Todo toque faz a diferença.</h2>
            <p>Seus pontos entram automaticamente enquanto você explora a loja.</p>
          </div>
          <div className={styles.pointsGuideList}>
            <span><Eye /> Produto descoberto <strong>+8</strong></span>
            <span><Sparkles /> Categoria visitada <strong>+12</strong></span>
            <span><ShoppingCart /> Item escolhido <strong>+4</strong></span>
            <span><ShoppingBag /> Pedido concluído <strong>pontos extras</strong></span>
          </div>
        </section>

        <section className={styles.ctaCard}>
          <BeautyFlower className={styles.ctaFlower} />
          <div>
            <p className={styles.ctaEyebrow}>Jardim da comunidade</p>
            <h2 className={styles.ctaTitle}>Veja como a sua jornada floresce.</h2>
            <p className={styles.ctaText}>
              Acompanhe sua posição e conheça as clientes que também estão
              colecionando descobertas.
            </p>
          </div>
          <Button asChild className={styles.ctaPrimary}>
            <Link to={routes.ranking}>
              Ver jardim da comunidade <ArrowRight className={styles.actionIcon} />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
