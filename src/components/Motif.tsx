import { useEffect, useRef } from 'react';
import type { Shape } from '../config/site';
import { drawShapes } from '../lib/graphics';

type Props = {
  shapes: Shape[];
  mode: 'vector' | 'pixel';
  resolution: number;
};

export default function Motif({ shapes, mode, resolution }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mode !== 'pixel') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, resolution, resolution);
    const scale = resolution / 100;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    drawShapes(ctx, shapes);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [shapes, mode, resolution]);

  if (mode === 'vector') {
    return (
      <svg className="motif" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {shapes.map((shape, i) => {
          if (shape.kind === 'rect') {
            return (
              <rect
                key={i}
                x={shape.x}
                y={shape.y}
                width={shape.w}
                height={shape.h}
                fill={shape.fill}
              />
            );
          }
          if (shape.kind === 'circle') {
            return <circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} fill={shape.fill} />;
          }
          return (
            <polygon
              key={i}
              points={shape.points.map((p) => p.join(',')).join(' ')}
              fill={shape.fill}
            />
          );
        })}
      </svg>
    );
  }

  return <canvas ref={canvasRef} className="motif motifPixel" />;
}
