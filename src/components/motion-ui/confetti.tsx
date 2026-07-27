import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type CSSProperties,
} from "react";

type ConfettiParticle = {
  id: number;
  angle: number;
  distance: number;
  rotation: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
};

export type ConfettiHandle = {
  burst: () => void;
};

type ConfettiProps = {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
};

const COLORS = [
  "#f43f5e",
  "#fb7185",
  "#f59e0b",
  "#fbbf24",
  "#2dd4bf",
  "#38bdf8",
  "#a78bfa",
];

const layerStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  overflow: "visible",
  pointerEvents: "none",
  zIndex: 3,
};

export const Confetti = forwardRef<ConfettiHandle, ConfettiProps>(
  ({ particleCount = 40, spread = 110, startVelocity = 24 }, ref) => {
    const [particles, setParticles] = useState<ConfettiParticle[]>([]);

    useImperativeHandle(ref, () => ({
      burst() {
        const nextParticles = Array.from({ length: particleCount }, (_, index) => {
          const normalized = particleCount <= 1 ? 0.5 : index / (particleCount - 1);
          const angle = -90 - spread / 2 + normalized * spread;
          const velocity = startVelocity * (0.7 + Math.random() * 0.9);

          return {
            id: Date.now() + index,
            angle,
            distance: 90 + velocity * 3 + Math.random() * 28,
            rotation: -220 + Math.random() * 440,
            size: 8 + Math.random() * 8,
            color: COLORS[index % COLORS.length],
            duration: 700 + Math.random() * 450,
            delay: Math.random() * 80,
          };
        });

        setParticles(nextParticles);
      },
    }));

    useEffect(() => {
      if (particles.length === 0) return;

      const timeout = window.setTimeout(() => {
        setParticles([]);
      }, Math.max(...particles.map((particle) => particle.duration + particle.delay)) + 120);

      return () => window.clearTimeout(timeout);
    }, [particles]);

    return (
      <span aria-hidden="true" style={layerStyle}>
        {particles.map((particle) => {
          const radians = (particle.angle * Math.PI) / 180;
          const x = Math.cos(radians) * particle.distance;
          const y = Math.sin(radians) * particle.distance;

          return (
            <span
              key={particle.id}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: particle.size,
                height: particle.size * 0.6,
                marginLeft: -particle.size / 2,
                marginTop: -particle.size / 2,
                borderRadius: 999,
                background: particle.color,
                opacity: 0,
                transform: "translate3d(0, 0, 0) rotate(0deg) scale(0.6)",
                animationName: "tdm-confetti-burst",
                animationDuration: `${particle.duration}ms`,
                animationDelay: `${particle.delay}ms`,
                animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                animationFillMode: "forwards",
                ["--tdm-confetti-x" as string]: `${x}px`,
                ["--tdm-confetti-y" as string]: `${y}px`,
                ["--tdm-confetti-rotate" as string]: `${particle.rotation}deg`,
              }}
            />
          );
        })}
        <style>
          {`
            @keyframes tdm-confetti-burst {
              0% {
                opacity: 0;
                transform: translate3d(0, 0, 0) rotate(0deg) scale(0.6);
              }
              12% {
                opacity: 1;
              }
              100% {
                opacity: 0;
                transform: translate3d(var(--tdm-confetti-x), var(--tdm-confetti-y), 0)
                  rotate(var(--tdm-confetti-rotate)) scale(1);
              }
            }
          `}
        </style>
      </span>
    );
  },
);

Confetti.displayName = "Confetti";
