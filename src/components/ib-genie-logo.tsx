
import type { SVGProps } from "react";

export function IbGenieLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <defs>
        <linearGradient id="sparkle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} /> 
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
        </linearGradient>
      </defs>
      <title>IBGenie Logo</title>
      <path d="M10 3L8 8L3 10L8 12L10 17L12 12L17 10L12 8L10 3Z" fill="url(#sparkle-gradient)" stroke="none" />
      <path d="M18 6L17.5 7.5L16 8L17.5 8.5L18 10L18.5 8.5L20 8L18.5 7.5L18 6Z" fill="url(#sparkle-gradient)" stroke="none" />
      <path d="M6 18L6.5 16.5L8 16L6.5 15.5L6 14L5.5 15.5L4 16L5.5 16.5L6 18Z" fill="url(#sparkle-gradient)" stroke="none" />
    </svg>
  );
}
