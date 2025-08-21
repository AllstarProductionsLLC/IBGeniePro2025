import type { SVGProps } from "react";

export function IbGenieLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>IBGenie Logo</title>
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 2a10 10 0 1 0-1.41-1.41" />
      <path d="M12 8a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4Z" />
      <path d="M10 12h.01" />
      <path d="M14 12h.01" />
    </svg>
  );
}
