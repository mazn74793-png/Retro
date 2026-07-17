/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface RetroLogoProps {
  className?: string;
  light?: boolean;
}

export const RetroLogo: React.FC<RetroLogoProps> = ({ className = 'w-48 h-auto', light = false }) => {
  const primaryColor = light ? '#FFFFFF' : '#000000';
  const secondaryColor = light ? '#CCCCCC' : '#444444';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 350"
      className={className}
      id="retro-eg-logo"
    >
      <defs>
        {/* Sleek drop shadow filter for retro punch */}
        <filter id="retro-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="2" stdDeviation="0" floodColor={light ? '#000000' : '#CCCCCC'} floodOpacity="0.8" />
        </filter>
      </defs>

      <g transform="translate(20, 10)">
        {/* Background orbit ellipse - back portion */}
        <path
          d="M 120,180 C 120,230 400,230 440,160 C 460,120 400,100 360,100"
          fill="none"
          stroke={primaryColor}
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Dynamic sweeping orbit - front portion */}
        <path
          d="M 520,150 C 520,70 140,50 90,140 C 70,180 120,210 180,210"
          fill="none"
          stroke={primaryColor}
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Top Sparkling Star (4-point star) */}
        <path
          d="M 310,40 Q 310,75 275,75 Q 310,75 310,110 Q 310,75 345,75 Q 310,75 310,40"
          fill={primaryColor}
        />

        {/* Bottom Sparkling Star (4-point star) */}
        <path
          d="M 280,225 Q 280,255 250,255 Q 280,255 280,285 Q 280,255 310,255 Q 280,255 280,225"
          fill={primaryColor}
        />

        {/* Main Brand Text: "RETRO" in thick, stylized italic serif */}
        <text
          x="300"
          y="180"
          fontFamily="'Georgia', 'Times New Roman', serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="92"
          letterSpacing="1"
          fill={primaryColor}
          textAnchor="middle"
          filter="url(#retro-shadow)"
        >
          RETRO
        </text>

        {/* Secondary Subtitle: "STREETWEAR" spaced out */}
        <text
          x="300"
          y="225"
          fontFamily="'Inter', 'Space Grotesk', sans-serif"
          fontWeight="800"
          fontSize="22"
          letterSpacing="11"
          fill={primaryColor}
          textAnchor="middle"
        >
          STREETWEAR
        </text>

        {/* Small "EST. 2024" or EG badge */}
        <text
          x="440"
          y="225"
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="700"
          fontSize="11"
          fill={secondaryColor}
        >
          EG
        </text>
      </g>
    </svg>
  );
};
