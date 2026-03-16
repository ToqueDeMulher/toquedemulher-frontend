import { Crown, Medal, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { useAuth } from "@/shared/contexts/auth-context";
import { useGamification } from "@/shared/contexts/gamification-context";
import {
  LEVELS,
  getLevelByPoints,
} from "@/features/gamification/lib/gamification-config";
import { routes } from "@/shared/lib/routes";
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

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <Crown className={styles.heroBadgeIcon} />
          </div>
          <h1 className={styles.heroTitle}>Ranking de beleza</h1>
          <p className={styles.heroText}>
            Veja quem está liderando o Beauty Club e acompanhe a sua evolução.
          </p>
        </section>

        {isLoggedIn && (
          <section className={styles.meCard}>
            <div className={styles.meCardHeader}>
              <div className={styles.meIdentity}>
                <span className={styles.avatar}>
                  {(user?.name?.charAt(0) ?? "?").toUpperCase()}
                </span>
                <div>
                  <p className={styles.meName}>{user?.name ?? "Você"}</p>
                  <p className={styles.meMeta}>
                    {myRank ? `Posição #${myRank}` : "Você ainda não entrou no ranking"}
                  </p>
                </div>
              </div>

              <Badge
                className={`${styles.levelBadge} ${currentLevel.badgeClassName} ${currentLevel.textClassName}`}
              >
                {levelName}
              </Badge>
            </div>

            <div className={styles.meStats}>
              <div className={styles.meStatBlock}>
                <span className={styles.meStatLabel}>Pontos totais</span>
                <strong className={styles.meStatValue}>
                  {totalPoints.toLocaleString("pt-BR")}
                </strong>
              </div>

              <div className={styles.meProgress}>
                <div className={styles.meProgressHeader}>
                  <span>Próximo nível</span>
                  <span>
                    {nextLevelName
                      ? `${pointsToNextLevel} pts restantes`
                      : "Nível máximo"}
                  </span>
                </div>
                <Progress value={progressToNextLevel} className={styles.progressBar} />
              </div>
            </div>
          </section>
        )}

        {podium.length >= 3 && (
          <section className={styles.podiumSection}>
            <div className={styles.podiumCardSecondary}>
              <div className={styles.podiumAvatarSecondary}>
                {podium[1]?.name.charAt(0).toUpperCase()}
              </div>
              <p className={styles.podiumName}>{podium[1]?.name}</p>
              <p className={styles.podiumPoints}>
                {podium[1]?.totalPoints.toLocaleString("pt-BR")} pts
              </p>
              <div className={styles.podiumBaseSecondary}>2</div>
            </div>

            <div className={styles.podiumCardPrimary}>
              <Crown className={styles.podiumCrown} />
              <div className={styles.podiumAvatarPrimary}>
                {podium[0]?.name.charAt(0).toUpperCase()}
              </div>
              <p className={styles.podiumNamePrimary}>{podium[0]?.name}</p>
              <p className={styles.podiumPointsPrimary}>
                {podium[0]?.totalPoints.toLocaleString("pt-BR")} pts
              </p>
              <div className={styles.podiumBasePrimary}>1</div>
            </div>

            <div className={styles.podiumCardSecondary}>
              <div className={styles.podiumAvatarThird}>
                {podium[2]?.name.charAt(0).toUpperCase()}
              </div>
              <p className={styles.podiumName}>{podium[2]?.name}</p>
              <p className={styles.podiumPoints}>
                {podium[2]?.totalPoints.toLocaleString("pt-BR")} pts
              </p>
              <div className={styles.podiumBaseThird}>3</div>
            </div>
          </section>
        )}

        <section className={styles.board}>
          <div className={styles.boardHeader}>
            <h2 className={styles.boardTitle}>
              <Medal className={styles.boardTitleIcon} />
              Classificação geral
            </h2>
          </div>

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
                  <div className={styles.boardRank}>
                    {entry.rank <= 3 ? (
                      <span className={styles.boardMedal}>
                        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                      </span>
                    ) : (
                      <span className={styles.boardRankNumber}>#{entry.rank}</span>
                    )}
                  </div>

                  <div className={styles.boardIdentity}>
                    <span className={styles.boardAvatar}>
                      {entry.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div className={styles.boardNameRow}>
                        <p className={styles.boardName}>{entry.name}</p>
                        {entry.isCurrentUser && (
                          <Badge className={styles.youBadge}>Você</Badge>
                        )}
                      </div>
                      <Badge
                        className={`${styles.entryLevelBadge} ${level.badgeClassName} ${level.textClassName}`}
                      >
                        {entry.levelName}
                      </Badge>
                    </div>
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
          <div className={styles.levelGuideHeader}>
            <h2 className={styles.levelGuideTitle}>Guia de níveis</h2>
            <p className={styles.levelGuideText}>
              Quanto mais ativa for sua jornada, maior o seu status no clube.
            </p>
          </div>

          <div className={styles.levelGrid}>
            {LEVELS.map((level) => (
              <article
                key={level.level}
                className={`${styles.levelCard} ${
                  level.level === currentLevel.level ? styles.levelCardActive : ""
                }`}
              >
                <Crown className={styles.levelIcon} style={{ color: level.accentColor }} />
                <strong className={styles.levelName}>{level.name}</strong>
                <span className={styles.levelPoints}>
                  {level.minPoints.toLocaleString("pt-BR")} pts
                </span>
              </article>
            ))}
          </div>
        </section>

        {!isLoggedIn && (
          <section className={styles.loginPrompt}>
            <div>
              <p className={styles.loginPromptEyebrow}>Entre para aparecer aqui</p>
              <h2 className={styles.loginPromptTitle}>Salve seu progresso no ranking</h2>
              <p className={styles.loginPromptText}>
                Faça login para acompanhar sua posição, guardar seus pontos e desbloquear missões.
              </p>
            </div>

            <div className={styles.loginPromptActions}>
              <Button asChild className={styles.loginPromptPrimary}>
                <Link to={routes.login}>
                  <Sparkles className={styles.loginPromptIcon} />
                  Fazer login
                </Link>
              </Button>
              <Button asChild variant="outline" className={styles.loginPromptSecondary}>
                <Link to={routes.missions}>
                  <Trophy className={styles.loginPromptIcon} />
                  Ver missões
                </Link>
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
