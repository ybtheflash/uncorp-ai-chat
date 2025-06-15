import * as React from "react";
import FaviconSmirk from "./favicon";

export default function Head() {
  // Render the SVG as a favicon using a data URL
  // This is a workaround for Next.js/React apps to have a dynamic SVG favicon
  // (for full theme support, further logic may be needed)
  const svgString = encodeURIComponent(
    `<?xml version='1.0' encoding='UTF-8'?><svg width='32' height='32' viewBox='0 0 407 402' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='203.5' cy='201' r='199.5' fill='url(%23smirk-bg)' stroke='url(%23smirk-stroke)' stroke-width='4'/><path d='M326.5 246.5C332.614 239.492 350.058 222.498 337.032 223.499C323.146 232.236 313.151 240.049 299.5 246.5C245.811 271.873 186.211 279.112 94.4246 266.598C80.1861 267.596 82 285 94.4246 289.5C203.177 305.774 272.274 278.711 277 277C291.803 271.641 320.169 253.758 326.5 246.5Z' fill='url(%23smirk-mouth)'/><ellipse cx='137' cy='168' rx='24' ry='20' fill='url(%23smirk-eye1)' stroke='url(%23smirk-eye1-stroke)' stroke-width='4'/><ellipse cx='263' cy='168' rx='24' ry='20' fill='url(%23smirk-eye2)' stroke='url(%23smirk-eye2-stroke)' stroke-width='4'/><defs><linearGradient id='smirk-bg' x1='220' y1='-65' x2='116' y2='439' gradientUnits='userSpaceOnUse'><stop offset='0.03' stop-color='%23D96F02'/><stop offset='0.36' stop-color='%23EFC280'/><stop offset='1' stop-color='%23D96F02'/></linearGradient><radialGradient id='smirk-stroke' cx='0' cy='0' r='1' gradientTransform='translate(203.5 201) rotate(90) scale(201 203.5)' gradientUnits='userSpaceOnUse'><stop stop-color='%23EE9500'/><stop offset='1' stop-color='%235C4D33'/></radialGradient><linearGradient id='smirk-mouth' x1='341' y1='195.5' x2='239.793' y2='446.078' gradientUnits='userSpaceOnUse'><stop stop-color='%23C54D00'/><stop offset='0.79' stop-color='%23772E00'/><stop offset='1' stop-color='%235F2500'/></linearGradient><linearGradient id='smirk-eye1' x1='137' y1='148' x2='137' y2='188' gradientUnits='userSpaceOnUse'><stop offset='0.19' stop-color='%23905604'/><stop offset='0.36' stop-color='%23AA6906'/><stop offset='1' stop-color='%235E3300'/></linearGradient><radialGradient id='smirk-eye1-stroke' cx='0' cy='0' r='1' gradientTransform='translate(137 168) rotate(90) scale(20 24)' gradientUnits='userSpaceOnUse'><stop stop-color='%23EE9500'/><stop offset='1' stop-color='%235C4D33'/></radialGradient><linearGradient id='smirk-eye2' x1='263' y1='148' x2='263' y2='188' gradientUnits='userSpaceOnUse'><stop offset='0.19' stop-color='%23905604'/><stop offset='0.36' stop-color='%23AA6906'/><stop offset='1' stop-color='%235E3300'/></linearGradient><radialGradient id='smirk-eye2-stroke' cx='0' cy='0' r='1' gradientTransform='translate(263 168) rotate(90) scale(20 24)' gradientUnits='userSpaceOnUse'><stop stop-color='%23EE9500'/><stop offset='1' stop-color='%235C4D33'/></radialGradient></defs></svg>`
  );
  const dataUrl = `data:image/svg+xml,${svgString}`;

  return (
    <>
      <link rel="icon" type="image/svg+xml" href={dataUrl} />
      {/* fallback for browsers that don't support SVG favicons */}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <title>UnCorp AI Chat</title>
      <meta
        name="description"
        content="A secure, personal chat interface for Gemini 1.5 Pro"
      />
    </>
  );
}
