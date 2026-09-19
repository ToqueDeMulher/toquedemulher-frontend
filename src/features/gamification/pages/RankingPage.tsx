import { ArrowRight, Crown, Flower2, Medal, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { BeautyFlower } from "@/shared/ui/BeautyFlower";
import { routes } from "@/app/router/paths";
import { useAuth } from "@/features/auth/context/auth-context";
import { useGamification } from "@/features/gamification/context/gamification-context";
import {
  LEVELS,
  getLevelByPoints,
} from "@/features/gamification/lib/gamification-config";
import styles from "./RankingPage.module.css";

export function RankingPage() {
  const { isLoggedIn, user } = useAuth();
  const {
    leaderboard,
    levelName,
    myRank,
    nextLevelName,
    pointsToNextLevel,
    progressToNextLevel,
    totalPoints,
  } = useGamification();

  const podium = leaderboard.slice(0, 3);
  const currentLevel = getLevelByPoints(totalPoints);
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <BeautyFlower className={styles.heroFlower} />
          <p className={styles.heroEyebrow}>
            <Flower2 /> Jardim da comunidade
          </p>
          <h1 className={styles.heroTitle}>Cada jornada floresce de um jeito.</h1>
          <p className={styles.heroText}>
            Acompanhe as clientes que mais exploram o Beauty Club e celebre a
            sua evolução, no seu próprio ritmo.
          </p>
          <div className={styles.heroNote}>
            <Sparkles /> Pontos vêm de descobertas, missões e pedidos concluídos.
          </div>
        </section>

        {isLoggedIn && (
          <section className={styles.meCard}>
            <div className={styles.meIdentity}>
              <span className={styles.avatar}>
                {(user?.name?.charAt(0) ?? "?").toUpperCase()}
              </span>
              <div>
                <p className={styles.meEyebrow}>Sua posição no jardim</p>
                <h2 className={styles.meName}>{user?.name ?? "Você"}</h2>
                <p className={styles.meMeta}>
                  {myRank ? `Você está em #${myRank}` : "Seu primeiro ponto coloca você no ranking"}
                </p>
              </div>
            </div>

            <div className={styles.mePoints}>
              <span>Pontos acumulados</span>
              <strong>{totalPoints.toLocaleString("pt-BR")}</strong>
            </div>

            <div className={styles.meProgress}>
              <div className={styles.meProgressHeader}>
                <span className={styles.currentLevel}>{levelName}</span>
                <span>
                  {nextLevelName
                    ? `${pointsToNextLevel} pontos até ${nextLevelName}`
                    : "Nível Aura alcançado"}
                </span>
              </div>
              <Progress value={progressToNextLevel} className={styles.progressBar} />
            </div>
          </section>
        )}

        {podium.length >= 3 && (
          <section className={styles.podiumSection} aria-label="Destaques da comunidade">
            <header className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Destaques do mês</p>
                <h2 className={styles.sectionTitle}>Quem está florescendo</h2>
              </div>
              <p className={styles.sectionText}>Uma celebração das jornadas mais ativas.</p>
            </header>

            <div className={styles.podiumGrid}>
              {podiumOrder.map((entry) => {
                if (!entry) return null;
                const isWinner = entry.rank === 1;
                return (
                  <article
                    key={entry.id}
                    className={`${styles.podiumCard} ${isWinner ? styles.podiumCardWinner : ""}`}
                  >
                    {isWinner && <Crown className={styles.podiumCrown} />}
                    <span className={styles.podiumPosition}>{entry.rank}º lugar</span>
                    <span className={styles.podiumAvatar}>
                      {entry.name.charAt(0).toUpperCase()}
                    </span>
                    <h3 className={styles.podiumName}>{entry.name}</h3>
                    <p className={styles.podiumLevel}>{entry.levelName}</p>
                    <strong className={styles.podiumPoints}>
                      {entry.totalPoints.toLocaleString("pt-BR")} <small>pts</small>
                    </strong>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section className={styles.board}>
          <header className={styles.boardHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Beauty Club</p>
              <h2 className={styles.boardTitle}>
                <Medal className={styles.boardTitleIcon} />
                Classificação da comunidade
              </h2>
            </div>
            <span className={styles.boardCount}>{leaderboard.length} jornadas</span>
          </header>

          <div className={styles.boardList}>
            {leaderboard.map((entry) => {
              const level = LEVELS.find((item) => item.level === entry.level) ?? LEVELS[0]!;

              return (
                <div
                  key={entry.id}
                  className={`${styles.boardRow} ${
                    entry.isCurrentUser ? styles.boardRowCurrent : ""
                  }`}
                >
                  <span className={styles.boardRank}>#{entry.rank}</span>
                  <span className={styles.boardAvatar}>
                    {entry.name.charAt(0).toUpperCase()}
                  </span>
                  <div className={styles.boardIdentity}>
                    <div className={styles.boardNameRow}>
                      <p className={styles.boardName}>{entry.name}</p>
                      {entry.isCurrentUser && <span className={styles.youBadge}>Você</span>}
                    </div>
                    <span
                      className={styles.entryLevel}
                      style={{ color: level.accentColor }}
                    >
                      {entry.levelName}
                    </span>
                  </div>
                  <div className={styles.boardPoints}>
                    <strong>{entry.totalPoints.toLocaleString("pt-BR")}</strong>
                    <span>pontos</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.levelGuide}>
          <header className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Sua evolução</p>
              <h2 className={styles.sectionTitle}>Os seis momentos da jornada</h2>
            </div>
            <p className={styles.sectionText}>Cada nível marca um novo capítulo no clube.</p>
          </header>

          <div className={styles.levelGrid}>
            {LEVELS.map((level, index) => (
              <article
                key={level.level}
                className={`${styles.levelCard} ${
                  level.level === currentLevel.level ? styles.levelCardActive : ""
                }`}
              >
                <div className={styles.levelCardTop}>
                  <span className={styles.levelNumber}>0{index + 1}</span>
                  <Crown className={styles.levelIcon} style={{ color: level.accentColor }} />
                </div>
                <strong className={styles.levelName}>{level.name}</strong>
                <span className={styles.levelPoints}>
                  a partir de {level.minPoints.toLocaleString("pt-BR")} pts
                </span>
                <p className={styles.levelBenefit}>{level.benefit}</p>
                {level.level === currentLevel.level && isLoggedIn && (
                  <span className={styles.currentBadge}>Seu momento</span>
                )}
              </article>
            ))}
          </div>
        </section>

        {!isLoggedIn && (
          <section className={styles.loginPrompt}>
            <BeautyFlower className={styles.loginFlower} />
            <div>
              <p className={styles.loginPromptEyebrow}>Seu lugar está esperando</p>
              <h2 className={styles.loginPromptTitle}>Comece a sua jornada no jardim.</h2>
              <p className={styles.loginPromptText}>
                Entre para guardar seus pontos, avançar pelos níveis e aparecer
                entre as clientes mais ativas.
              </p>
            </div>
            <div className={styles.loginPromptActions}>
              <Button asChild className={styles.loginPromptPrimary}>
                <Link to={routes.login}>
                  Entrar no clube <ArrowRight className={styles.loginPromptIcon} />
                </Link>
              </Button>
              <Button asChild variant="outline" className={styles.loginPromptSecondary}>
                <Link to={routes.missions}>
                  <Trophy className={styles.loginPromptIcon} /> Ver missões
                </Link>
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
