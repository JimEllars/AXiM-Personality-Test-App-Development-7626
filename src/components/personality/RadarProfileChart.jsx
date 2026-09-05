import React from 'react';
import { FUNCTION_KEYS } from '../../data/questionBank';

const SIZE = 360;
const CENTER = SIZE / 2;
const RADIUS = 128;

function point(index, radius) {
  const angle = index * Math.PI * 2 / FUNCTION_KEYS.length - Math.PI / 2;
  return `${CENTER + Math.cos(angle) * radius},${CENTER + Math.sin(angle) * radius}`;
}

function RadarProfileChart({ scores }) {
  const rings = [0.25, 0.5, 0.75, 1];
  const profile = FUNCTION_KEYS.map((key, index) => {
    const normalized = Math.max(0.12, Math.min(1, (scores[key] + 4) / 8));
    return point(index, RADIUS * normalized);
  }).join(' ');

  return (
    <div className="radar-wrap">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Eight-function radar profile">
        <defs>
          <linearGradient id="radarFill" x1="0" x2="1">
            <stop offset="0" stopColor="#50e3c2" stopOpacity=".55" />
            <stop offset="1" stopColor="#67a8ff" stopOpacity=".35" />
          </linearGradient>
        </defs>
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={FUNCTION_KEYS.map((_, index) => point(index, RADIUS * ring)).join(' ')}
            className="radar-ring"
          />
        ))}
        {FUNCTION_KEYS.map((key, index) => (
          <g key={key}>
            <line x1={CENTER} y1={CENTER} x2={point(index, RADIUS).split(',')[0]} y2={point(index, RADIUS).split(',')[1]} />
            <text
              x={point(index, RADIUS + 28).split(',')[0]}
              y={point(index, RADIUS + 28).split(',')[1]}
            >
              {key}
            </text>
          </g>
        ))}
        <polygon points={profile} className="radar-profile" />
        {profile.split(' ').map((coordinates, index) => (
          <circle
            key={FUNCTION_KEYS[index]}
            cx={coordinates.split(',')[0]}
            cy={coordinates.split(',')[1]}
            r="4"
          />
        ))}
      </svg>
    </div>
  );
}

export default RadarProfileChart;