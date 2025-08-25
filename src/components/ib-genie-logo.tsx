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
      <title>IBGenie Logo</title>
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 2a10 10 0 1 0-1.41-1.41" />
      <path d="m15.5 6.5 3 3" />
      <path d="m8.5 17.5 3 3" />
      <path d="M12 8a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4Z" />
    </svg>
  );
}
