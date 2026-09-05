import React from 'react';
import { FUNCTION_KEYS } from '../../data/questionBank';

const SIZE = 400; // Increased viewBox size to prevent clipping
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
    <div className="radar-wrap" style={{ width: '100%', height: 'auto', display: 'flex', justifyContent: 'center' }}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="Eight-function radar profile"
        style={{ maxWidth: '100%', maxHeight: '400px' }}
      >
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
            fill="none"
            stroke="#e2e8f0"
          />
        ))}
        {FUNCTION_KEYS.map((key, index) => {
          const textPoint = point(index, RADIUS + 40); // Increased label offset
          const [x, y] = textPoint.split(',');
          return (
            <g key={key}>
              <line
                x1={CENTER}
                y1={CENTER}
                x2={point(index, RADIUS).split(',')[0]}
                y2={point(index, RADIUS).split(',')[1]}
                stroke="#e2e8f0"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#4a5568"
                fontSize="14px"
                fontWeight="bold"
              >
                {key}
              </text>
            </g>
          );
        })}
        <polygon points={profile} className="radar-profile" fill="url(#radarFill)" stroke="#4f46e5" strokeWidth="2" />
        {profile.split(' ').map((coordinates, index) => (
          <circle
            key={FUNCTION_KEYS[index]}
            cx={coordinates.split(',')[0]}
            cy={coordinates.split(',')[1]}
            r="4"
            fill="#4f46e5"
          />
        ))}
      </svg>
    </div>
  );
}

export default RadarProfileChart;
