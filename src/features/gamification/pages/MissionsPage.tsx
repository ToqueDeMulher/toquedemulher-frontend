import {
  Award,
  Calendar,
  Eye,
  LogIn,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { routes } from "@/app/router/paths";
import { useAuth } from "@/features/auth/context/auth-context";
import {
  useGamification,
  type GamificationMission,
} from "@/features/gamification/context/gamification-context";
import styles from "./MissionsPage.module.css";

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className={styles.missionIconSvg} />,
  Eye: <Eye className={styles.missionIconSvg} />,
  ShoppingCart: <ShoppingCart className={styles.missionIconSvg} />,
  ShoppingBag: <ShoppingBag className={styles.missionIconSvg} />,
  Target: <Target className={styles.missionIconSvg} />,
  Trophy: <Trophy className={styles.missionIconSvg} />,
};

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
      <div className={styles.missionHeader}>
        <span
          className={`${styles.missionIconWrap} ${
            mission.completed ? styles.missionIconWrapCompleted : ""
          }`}
        >
          {mission.completed ? <Award className={styles.missionIconSvg} /> : ICON_MAP[mission.icon]}
        </span>

        <div className={styles.missionBody}>
          <div className={styles.missionTitleRow}>
            <div>
              <h3 className={styles.missionTitle}>{mission.title}</h3>
              <p className={styles.missionDescription}>{mission.description}</p>
            </div>
            <Badge
              className={
                mission.completed ? styles.completedBadge : styles.rewardBadge
              }
            >
              {mission.completed ? "Concluída" : `+${mission.pointsReward} pts`}
            </Badge>
          </div>

          {!mission.completed && (
            <>
              <div className={styles.progressHeader}>
                <span>Progresso</span>
                <span>{mission.progressLabel}</span>
              </div>
              <Progress value={progressPercent} className={styles.progressBar} />
            </>
          )}

          <div className={styles.missionActions}>
            <Button asChild variant={mission.completed ? "outline" : "default"} size="sm">
              <Link to={mission.ctaRoute}>{mission.ctaLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
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
    totalPoints,
  } = useGamification();

  if (!isLoggedIn) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <section className={styles.loginCard}>
            <span className={styles.loginIconWrap}>
              <Target className={styles.loginIcon} />
            </span>
            <h1 className={styles.loginTitle}>Faça login para liberar as missões</h1>
            <p className={styles.loginText}>
              Entre na sua conta para acompanhar progresso, pontos e subir no ranking.
            </p>
            <Button asChild className={styles.loginButton}>
              <Link to={routes.login}>
                <LogIn className={styles.loginButtonIcon} />
                Fazer login
              </Link>
            </Button>
          </section>
        </div>
      </div>
    );
  }

  const dailyMissions = missions.filter((mission) => mission.type === "daily");
  const weeklyMissions = missions.filter((mission) => mission.type === "weekly");
  const specialMissions = missions.filter((mission) => mission.type === "special");

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div>
            <div className={styles.heroEyebrow}>
              <Zap className={styles.heroEyebrowIcon} />
              Beauty Club
            </div>
            <h1 className={styles.heroTitle}>Missões da sua jornada</h1>
            <p className={styles.heroText}>
              Complete desafios simples para acumular pontos, subir de nível e manter
              seu perfil em destaque.
            </p>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStatCard}>
              <span className={styles.heroStatLabel}>Pontos</span>
              <strong className={styles.heroStatValue}>
                {totalPoints.toLocaleString("pt-BR")}
              </strong>
            </div>
            <div className={styles.heroStatCard}>
              <span className={styles.heroStatLabel}>Nível atual</span>
              <strong className={styles.heroStatValue}>{levelName}</strong>
            </div>
            <div className={styles.heroStatCard}>
              <span className={styles.heroStatLabel}>Concluídas</span>
              <strong className={styles.heroStatValue}>{completedMissionsCount}</strong>
            </div>
          </div>
        </section>

        <section className={styles.overviewGrid}>
          <article className={styles.overviewCard}>
            <p className={styles.overviewLabel}>Meta ativa</p>
            <strong className={styles.overviewValue}>
              {missions.filter((mission) => !mission.completed).length} em andamento
            </strong>
            <p className={styles.overviewText}>
              Continue navegando pelo catálogo para completar as próximas.
            </p>
          </article>

          <article className={styles.overviewCard}>
            <p className={styles.overviewLabel}>Próximo nível</p>
            <strong className={styles.overviewValue}>
              {nextLevelName ?? "Nível máximo"}
            </strong>
            <p className={styles.overviewText}>
              {nextLevelName
                ? `Faltam ${pointsToNextLevel} pontos para avançar.`
                : "Você já desbloqueou o topo do Beauty Club."}
            </p>
          </article>

          <article className={styles.overviewCard}>
            <p className={styles.overviewLabel}>Próximo passo</p>
            <strong className={styles.overviewValue}>Finalize um pedido</strong>
            <p className={styles.overviewText}>
              Checkout concluído é o atalho mais rápido para ganhar muitos pontos.
            </p>
          </article>
        </section>

        <section className={styles.tabsSection}>
          <Tabs defaultValue="daily">
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="daily" className={styles.tabsTrigger}>
                <Zap className={styles.tabsIcon} />
                Diárias
              </TabsTrigger>
              <TabsTrigger value="weekly" className={styles.tabsTrigger}>
                <Calendar className={styles.tabsIcon} />
                Semanais
              </TabsTrigger>
              <TabsTrigger value="special" className={styles.tabsTrigger}>
                <Trophy className={styles.tabsIcon} />
                Especiais
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className={styles.tabsContent}>
              <div className={styles.missionList}>
                {dailyMissions.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="weekly" className={styles.tabsContent}>
              <div className={styles.missionList}>
                {weeklyMissions.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="special" className={styles.tabsContent}>
              <div className={styles.missionList}>
                {specialMissions.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className={styles.ctaCard}>
          <div>
            <p className={styles.ctaEyebrow}>Suba no ranking</p>
            <h2 className={styles.ctaTitle}>Sua próxima compra vale mais do que o carrinho</h2>
            <p className={styles.ctaText}>
              Cada pedido concluído acelera seu progresso e melhora sua posição entre as
              clientes mais ativas.
            </p>
          </div>

          <div className={styles.ctaActions}>
            <Button asChild className={styles.ctaPrimary}>
              <Link to={routes.home}>Continuar comprando</Link>
            </Button>
            <Button asChild variant="outline" className={styles.ctaSecondary}>
              <Link to={routes.ranking}>Ver ranking</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
