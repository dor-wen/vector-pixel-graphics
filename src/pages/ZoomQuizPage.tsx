import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { quizItems } from '../config/site';
import Motif from '../components/Motif';

type Offset = { x: number; y: number };

export default function ZoomQuizPage() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<'A' | 'B' | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const paneRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; origin: Offset } | null>(null);

  const item = quizItems[index];
  const vectorPane = item.vectorIsFirst ? 'A' : 'B';
  const panes: Array<{ label: 'A' | 'B'; mode: 'vector' | 'pixel' }> = item.vectorIsFirst
    ? [
        { label: 'A', mode: 'vector' },
        { label: 'B', mode: 'pixel' },
      ]
    : [
        { label: 'A', mode: 'pixel' },
        { label: 'B', mode: 'vector' },
      ];

  useEffect(() => {
    setAnswer(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [index]);

  function clampOffset(next: Offset, level: number): Offset {
    const pane = paneRef.current;
    if (!pane) return next;
    const rect = pane.getBoundingClientRect();
    const maxX = (rect.width * (level - 1)) / 2;
    const maxY = (rect.height * (level - 1)) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }

  function changeZoom(level: number) {
    setZoom(level);
    setOffset((prev) => clampOffset(prev, level));
  }

  const transform = `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`;
  const answeredCorrectly = answer !== null && answer === vectorPane;

  return (
    <div>
      <h2>Welches Bild ist die Vektorgrafik?</h2>
      <p className="hint">
        Ziehe den Regler nach rechts, um in beide Bilder hineinzuzoomen. Mit dem Finger oder der
        Maus kannst du im Bild verschieben, was du siehst.
      </p>

      <label className="sliderRow">
        <span>Zoom: {zoom.toFixed(1)}×</span>
        <input
          type="range"
          min={1}
          max={12}
          step={0.5}
          value={zoom}
          onChange={(event) => changeZoom(Number(event.target.value))}
        />
      </label>

      <div
        className="zoomStage"
        onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
          drag.current = { x: event.clientX, y: event.clientY, origin: offset };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
          const current = drag.current;
          if (!current) return;
          setOffset(
            clampOffset(
              {
                x: current.origin.x + (event.clientX - current.x),
                y: current.origin.y + (event.clientY - current.y),
              },
              zoom,
            ),
          );
        }}
        onPointerUp={(event: ReactPointerEvent<HTMLDivElement>) => {
          drag.current = null;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        {panes.map((pane, paneIndex) => (
          <div
            className="zoomPane"
            key={pane.label}
            ref={paneIndex === 0 ? paneRef : undefined}
          >
            <div className="zoomClip">
              <div className="zoomInner" style={{ transform }}>
                <Motif shapes={item.shapes} mode={pane.mode} resolution={item.resolution} />
              </div>
            </div>
            <span className="paneBadge">{pane.label}</span>
          </div>
        ))}
      </div>

      <div className="controls">
        <button
          type="button"
          className="btn primary"
          onClick={() => setAnswer('A')}
          disabled={answer !== null}
        >
          Bild A
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => setAnswer('B')}
          disabled={answer !== null}
        >
          Bild B
        </button>
        <button type="button" className="btn" onClick={() => changeZoom(1)}>
          Zoom zurücksetzen
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => setIndex((index + 1) % quizItems.length)}
        >
          Nächstes Motiv
        </button>
      </div>

      {answer !== null && (
        <div className={`result${answeredCorrectly ? '' : ' is-low'}`}>
          <p>
            <strong>{answeredCorrectly ? 'Richtig!' : 'Nicht ganz.'}</strong> Die Vektorgrafik
            ist Bild {vectorPane} ({item.title}).
          </p>
          <p>{item.explanation}</p>
        </div>
      )}
    </div>
  );
}
