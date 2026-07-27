import { Moon, Sun } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useTheme } from "@/app/providers/theme/theme-context";
import styles from "./ThemeSwitcher.module.css";

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const nextThemeLabel = theme === "dark" ? "modo claro" : "modo escuro";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={styles.switcher}
      onClick={toggleTheme}
      role="switch"
      aria-label={`Alternar para modo ${nextThemeLabel}`}
      aria-checked={theme === "dark"}
    >
      <span className={styles.iconTrack} aria-hidden="true">
        <Sun className={`${styles.icon} ${theme === "light" ? styles.iconActive : ""}`} />
        <Moon className={`${styles.icon} ${theme === "dark" ? styles.iconActive : ""}`} />
      </span>
    </Button>
  );
}
