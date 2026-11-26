import { useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import type { PublicAnnouncementMessage } from "@/features/store-content/types/announcement";
import styles from "./AnnouncementBar.module.css";

const repetitions = Array.from({ length: 4 }, (_, index) => index);

type AnnouncementBarProps = {
  messages: PublicAnnouncementMessage[];
  preview?: boolean;
};

export function AnnouncementBar({ messages, preview = false }: AnnouncementBarProps) {
  const [paused, setPaused] = useState(false);

  if (messages.length === 0) return null;

  const renderChunk = (duplicate: boolean) => (
    <div className={styles.marqueeChunk} aria-hidden={duplicate || undefined}>
      {repetitions.flatMap((repeat) =>
        messages.map((message, messageIndex) => {
          const hidden = duplicate || repeat > 0;
          return (
            <Link
              key={`${repeat}-${message.id}`}
              to={message.destination}
              className={styles.marqueeItem}
              data-repeat={hidden || undefined}
              aria-hidden={hidden || undefined}
              tabIndex={hidden ? -1 : undefined}
              onClick={preview ? (event) => event.preventDefault() : undefined}
            >
              {message.text}
              {messageIndex < messages.length - 1 ? (
                <span className={styles.separator} aria-hidden="true">•</span>
              ) : null}
            </Link>
          );
        }),
      )}
    </div>
  );

  return (
    <section className={styles.promoBar} aria-label={preview ? "Pré-visualização da faixa de avisos" : "Avisos da loja"}>
      <div className={styles.marqueeWrap}>
        <div className={styles.marqueeViewport}>
          <div className={styles.marqueeTrack} data-paused={paused} aria-live="off">
            {renderChunk(false)}
            {renderChunk(true)}
          </div>
        </div>
        <button
          type="button"
          className={styles.marqueeToggle}
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? "Retomar animação" : "Pausar animação"}
          aria-pressed={paused}
        >
          {paused ? <Play size={11} /> : <Pause size={11} />}
        </button>
      </div>
    </section>
  );
}

