import * as React from "react";

// This component renders the smirk logo SVG, with theme-aware coloring via CSS variables
export function FaviconSmirk({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 407 402"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle
        cx="203.5"
        cy="201"
        r="199.5"
        fill="url(#smirk-bg)"
        stroke="url(#smirk-stroke)"
        strokeWidth="4"
      />
      <path
        d="M326.5 246.5C332.614 239.492 350.058 222.498 337.032 223.499C323.146 232.236 313.151 240.049 299.5 246.5C245.811 271.873 186.211 279.112 94.4246 266.598C80.1861 267.596 82 285 94.4246 289.5C203.177 305.774 272.274 278.711 277 277C291.803 271.641 320.169 253.758 326.5 246.5Z"
        fill="url(#smirk-mouth)"
      />
      <ellipse
        cx="137"
        cy="168"
        rx="24"
        ry="20"
        fill="url(#smirk-eye1)"
        stroke="url(#smirk-eye1-stroke)"
        strokeWidth="4"
      />
      <ellipse
        cx="263"
        cy="168"
        rx="24"
        ry="20"
        fill="url(#smirk-eye2)"
        stroke="url(#smirk-eye2-stroke)"
        strokeWidth="4"
      />
      <defs>
        <linearGradient id="smirk-bg" x1="220" y1="-65" x2="116" y2="439" gradientUnits="userSpaceOnUse">
          <stop offset="0.03" stopColor="var(--smirk-bg1, #D96F02)" />
          <stop offset="0.36" stopColor="var(--smirk-bg2, #EFC280)" />
          <stop offset="1" stopColor="var(--smirk-bg1, #D96F02)" />
        </linearGradient>
        <radialGradient id="smirk-stroke" cx="0" cy="0" r="1" gradientTransform="translate(203.5 201) rotate(90) scale(201 203.5)" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--smirk-stroke1, #EE9500)" />
          <stop offset="1" stopColor="var(--smirk-stroke2, #5C4D33)" />
        </radialGradient>
        <linearGradient id="smirk-mouth" x1="341" y1="195.5" x2="239.793" y2="446.078" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--smirk-mouth1, #C54D00)" />
          <stop offset="0.79" stopColor="var(--smirk-mouth2, #772E00)" />
          <stop offset="1" stopColor="var(--smirk-mouth3, #5F2500)" />
        </linearGradient>
        <linearGradient id="smirk-eye1" x1="137" y1="148" x2="137" y2="188" gradientUnits="userSpaceOnUse">
          <stop offset="0.19" stopColor="var(--smirk-eye1-1, #905604)" />
          <stop offset="0.36" stopColor="var(--smirk-eye1-2, #AA6906)" />
          <stop offset="1" stopColor="var(--smirk-eye1-3, #5E3300)" />
        </linearGradient>
        <radialGradient id="smirk-eye1-stroke" cx="0" cy="0" r="1" gradientTransform="translate(137 168) rotate(90) scale(20 24)" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--smirk-eye1-s1, #EE9500)" />
          <stop offset="1" stopColor="var(--smirk-eye1-s2, #5C4D33)" />
        </radialGradient>
        <linearGradient id="smirk-eye2" x1="263" y1="148" x2="263" y2="188" gradientUnits="userSpaceOnUse">
          <stop offset="0.19" stopColor="var(--smirk-eye2-1, #905604)" />
          <stop offset="0.36" stopColor="var(--smirk-eye2-2, #AA6906)" />
          <stop offset="1" stopColor="var(--smirk-eye2-3, #5E3300)" />
        </linearGradient>
        <radialGradient id="smirk-eye2-stroke" cx="0" cy="0" r="1" gradientTransform="translate(263 168) rotate(90) scale(20 24)" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--smirk-eye2-s1, #EE9500)" />
          <stop offset="1" stopColor="var(--smirk-eye2-s2, #5C4D33)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default FaviconSmirk;
