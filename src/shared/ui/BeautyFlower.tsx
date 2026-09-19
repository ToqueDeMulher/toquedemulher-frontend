import type { SVGProps } from "react";

/** A small decorative asterisk motif, always hidden from assistive technology. */
export function BeautyFlower(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="9"
      strokeLinecap="round"
      {...props}
      aria-hidden="true"
      focusable="false"
    >
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <line
          key={angle}
          x1="50"
          y1="50"
          x2="50"
          y2="8"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
    </svg>
  );
}
