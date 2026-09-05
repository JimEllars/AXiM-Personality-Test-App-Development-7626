import React from 'react';
import './ThetaTrendCharts.css';

function formatDate(value, index) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return `Attempt ${index + 1}`;

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric'
  }).format(date);
}

function makePoints(values, min, max, width, height) {
  const horizontalPadding = 8;
  const verticalPadding = 12;
  const chartWidth = width - horizontalPadding * 2;
  const chartHeight = height - verticalPadding * 2;
  const range = max - min || 1;

  return values.map((item, index) => {
    let value = Number(item.value);
    if (isNaN(value)) value = 0;
    const x =
      horizontalPadding +
      (values.length === 1
        ? chartWidth / 2
        : (index / (values.length - 1)) * chartWidth);
    const y = verticalPadding + ((max - value) / range) * chartHeight;

    return {
      x,
      y,
      value,
      date: item.date
    };
  });
}

function TrendLineChart({ values, min, max, color, label }) {
  const width = 520;
  const height = 150;
  const points = makePoints(values, min, max, width, height);
  const path = points
    .map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <svg
      className="trend-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
    >
      {[0, 0.5, 1].map((position) => {
        const y = 12 + position * (height - 24);

        return (
          <line
            key={position}
            x1="8"
            x2={width - 8}
            y1={y}
            y2={y}
            className="trend-grid-line"
          />
        );
      })}

      <path d={path} className="trend-line" style={{ stroke: color }} />

      {points.map((point, index) => (
        <circle
          key={`${point.x}-${index}`}
          cx={point.x}
          cy={point.y}
          r="4"
          className="trend-point"
          style={{ fill: color }}
        >
          <title>
            {formatDate(point.date, index)}: {point.value.toFixed(2)}
          </title>
        </circle>
      ))}
    </svg>
  );
}

export default TrendLineChart;