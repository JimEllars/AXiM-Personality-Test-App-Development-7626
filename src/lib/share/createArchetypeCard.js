const COLORS = {
  background: '#07111f',
  backgroundStart: '#102c3b',
  mint: '#62e5c5',
  muted: '#78909a',
  body: '#a4b7be'
};

function wrapText(context, text, maxWidth, maxLines = 4) {
  const words = String(text || '').split(/\s+/);
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;

    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });

  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

function fitText(context, text, maxWidth, initialSize, minimumSize) {
  let size = initialSize;

  while (
    size > minimumSize &&
    context.measureText(text).width > maxWidth
  ) {
    size -= 2;
    context.font = `800 ${size}px Manrope, sans-serif`;
  }

  return size;
}

function drawOrbit(context, centerX, centerY) {
  context.fillStyle = 'rgba(98, 229, 197, 0.08)';
  context.beginPath();
  context.arc(centerX, centerY, 190, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = 'rgba(98, 229, 197, 0.32)';
  context.lineWidth = 2;

  [125, 170].forEach((radius) => {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.stroke();
  });

  context.fillStyle = COLORS.mint;
  context.font = '500 64px Georgia, serif';
  context.textAlign = 'center';
  context.fillText('θ', centerX, centerY + 22);

  context.textAlign = 'left';
}

export function createArchetypeCard({
  archetype,
  title,
  description,
  strongestFunction,
  strongestName
}) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas is unavailable in this browser.');
  }

  const width = 1200;
  const height = 760;
  const scale = 2;

  canvas.width = width * scale;
  canvas.height = height * scale;
  context.scale(scale, scale);

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, COLORS.backgroundStart);
  gradient.addColorStop(0.55, COLORS.background);
  gradient.addColorStop(1, '#0a1d2b');

  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = 'rgba(98, 229, 197, 0.28)';
  context.lineWidth = 2;
  context.strokeRect(28, 28, width - 56, height - 56);

  context.fillStyle = COLORS.mint;
  context.font = '700 23px Manrope, sans-serif';
  context.fillText('AXiM / PERSONAL DEVELOPMENT', 74, 92);

  context.fillStyle = COLORS.muted;
  context.font = '600 16px Manrope, sans-serif';
  context.fillText('MY COGNITIVE ARCHETYPE', 74, 158);

  const displayArchetype = archetype || 'PROFILE';
  context.font = '800 104px Manrope, sans-serif';
  fitText(context, displayArchetype, 620, 104, 54);

  const archetypeGradient = context.createLinearGradient(74, 190, 620, 290);
  archetypeGradient.addColorStop(0, '#ffffff');
  archetypeGradient.addColorStop(1, COLORS.mint);
  context.fillStyle = archetypeGradient;
  context.fillText(displayArchetype, 74, 278);

  context.fillStyle = COLORS.mint;
  context.font = '600 28px Manrope, sans-serif';
  context.fillText(title || 'Your Cognitive Profile', 78, 336);

  context.fillStyle = COLORS.body;
  context.font = '400 21px DM Sans, sans-serif';

  wrapText(context, description, 560).forEach((line, index) => {
    context.fillText(line, 74, 397 + index * 32);
  });

  drawOrbit(context, 980, 338);

  context.fillStyle = '#a9bbc2';
  context.font = '600 18px Manrope, sans-serif';
  context.textAlign = 'center';
  context.fillText(strongestFunction || '—', 980, 515);

  context.fillStyle = COLORS.muted;
  context.font = '400 16px DM Sans, sans-serif';
  context.fillText(strongestName || 'Cognitive flexibility', 980, 545);

  context.textAlign = 'left';
  context.fillText('axim.us.com', 74, 682);

  return canvas.toDataURL('image/png');
}

export function downloadDataUrl(dataUrl, fileName) {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}