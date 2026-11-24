import type { Shape } from '../config/site';

export function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  const int = Number.parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

export function nearestPaletteIndex(
  rgb: [number, number, number],
  palette: string[],
): number {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  palette.forEach((hex, index) => {
    const [r, g, b] = hexToRgb(hex);
    const distance =
      (r - rgb[0]) ** 2 + (g - rgb[1]) ** 2 + (b - rgb[2]) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

/** Zeichnet Formen im Koordinatenraum 0..100 auf einen bereits skalierten Kontext. */
export function drawShapes(
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
): void {
  for (const shape of shapes) {
    ctx.fillStyle = shape.fill;
    ctx.beginPath();
    if (shape.kind === 'rect') {
      ctx.rect(shape.x, shape.y, shape.w, shape.h);
    } else if (shape.kind === 'circle') {
      ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
    } else {
      shape.points.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
    }
    ctx.fill();
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Bild nicht ladbar: ${src}`));
    img.src = src;
  });
}

/**
 * Verkleinert das Foto auf das Raster und ordnet jeder Zelle die
 * nächstliegende Palettenfarbe zu. Gibt null zurück, wenn kein Bild da ist.
 */
export async function computeTarget(
  src: string,
  columns: number,
  rows: number,
  palette: string[],
): Promise<number[] | null> {
  const img = await loadImage(src).catch(() => null);
  if (!img) return null;

  const canvas = document.createElement('canvas');
  canvas.width = columns;
  canvas.height = rows;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, columns, rows);

  try {
    const { data } = ctx.getImageData(0, 0, columns, rows);
    const target: number[] = [];
    for (let i = 0; i < columns * rows; i += 1) {
      const offset = i * 4;
      target.push(
        nearestPaletteIndex(
          [data[offset], data[offset + 1], data[offset + 2]],
          palette,
        ),
      );
    }
    return target;
  } catch {
    // Canvas durch fremde Quelle gesperrt (CORS)
    return null;
  }
}
