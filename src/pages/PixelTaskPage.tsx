import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { pixelTaskConfig } from '../config/site';
import { computeTarget } from '../lib/graphics';

const { columns, rows, palette, imageSrc, fallbackTarget } = pixelTaskConfig;
const CELL_COUNT = columns * rows;

function readFallbackTarget(): number[] {
  const cells: number[] = [];
  for (let r = 0; r < rows; r += 1) {
    const line = fallbackTarget[r] ?? '';
    for (let c = 0; c < columns; c += 1) {
      cells.push(Number(line[c] ?? 0));
    }
  }
  return cells;
}

export default function PixelTaskPage() {
  const [cells, setCells] = useState<number[]>(() => new Array(CELL_COUNT).fill(-1));
  const [selected, setSelected] = useState(0);
  const [target, setTarget] = useState<number[] | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [reveal, setReveal] = useState(0);
  const [checked, setChecked] = useState(false);
  const painting = useRef(false);

  useEffect(() => {
    let cancelled = false;
    computeTarget(imageSrc, columns, rows, palette).then((result) => {
      if (cancelled) return;
      setTarget(result ?? readFallbackTarget());
      setHasImage(result !== null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const stop = () => {
      painting.current = false;
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, []);

  function paint(index: number) {
    setCells((prev) => {
      if (prev[index] === selected) return prev;
      const next = prev.slice();
      next[index] = selected;
      return next;
    });
    setChecked(false);
  }

  function paintAt(x: number, y: number) {
    const hit = document.elementFromPoint(x, y);
    const cell = hit instanceof HTMLElement ? hit.closest<HTMLElement>('[data-cell]') : null;
    if (!cell) return;
    const index = Number(cell.dataset.cell);
    if (!Number.isNaN(index)) paint(index);
  }

  const stats = useMemo(() => {
    if (!target) return null;
    const wrong: number[] = [];
    let correct = 0;
    let filled = 0;
    cells.forEach((value, index) => {
      if (value >= 0) filled += 1;
      if (value === target[index]) correct += 1;
      else wrong.push(index);
    });
    return { correct, filled, total: cells.length, wrong };
  }, [cells, target]);

  const wrongSet = useMemo(() => new Set(stats?.wrong ?? []), [stats]);
  const gridStyle = { '--cols': columns, '--rows': rows } as CSSProperties;

  return (
    <>
      <h2>Bild mit wenigen Farben nachbauen</h2>
      <p className="hint">
        Wähle unten eine Farbe und tippe oder ziehe über die Kästchen. Du kannst pro Kästchen
        nur eine Farbe setzen – entscheide dich für die, die am besten passt.
      </p>

      <div className="palette" role="group" aria-label="Farbpalette">
        {palette.map((color, index) => (
          <button
            key={color}
            type="button"
            className="paletteSwatch"
            style={{ background: color }}
            aria-label={`Farbe ${index + 1}`}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          />
        ))}
      </div>

      {hasImage ? (
        <label className="sliderRow">
          <span>Vorlage einblenden</span>
          <input
            type="range"
            min={0}
            max={100}
            value={reveal}
            onChange={(event) => setReveal(Number(event.target.value))}
          />
        </label>
      ) : (
        <p className="hint">
          Noch kein Foto hinterlegt: Lege ein Bild unter <code>public/bilder/vorlage.jpg</code>{' '}
          ab. Bis dahin wird ein Ersatzmuster mit Farbbändern verwendet.
        </p>
      )}

      <div
        className="pixelStage"
        onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
          painting.current = true;
          paintAt(event.clientX, event.clientY);
        }}
        onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
          if (painting.current) paintAt(event.clientX, event.clientY);
        }}
      >
        <div className="pixelGrid" style={gridStyle}>
          {cells.map((value, index) => {
            const classes = ['pixelCell'];
            if (value < 0) classes.push('is-empty');
            if (checked && wrongSet.has(index)) classes.push('is-wrong');
            return (
              <button
                key={index}
                type="button"
                data-cell={index}
                className={classes.join(' ')}
                style={value < 0 ? undefined : { background: palette[value] }}
                aria-label={`Zeile ${Math.floor(index / columns) + 1}, Spalte ${
                  (index % columns) + 1
                }`}
                onClick={() => paint(index)}
              />
            );
          })}
        </div>
        {hasImage && (
          <img
            className="revealImage"
            src={imageSrc}
            alt=""
            style={{ opacity: reveal / 100 }}
          />
        )}
      </div>

      <div className="controls">
        <button type="button" className="btn primary" onClick={() => setChecked(true)}>
          Prüfen
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setCells(new Array(CELL_COUNT).fill(-1));
            setChecked(false);
          }}
        >
          Alles löschen
        </button>
        <button
          type="button"
          className="btn"
          disabled={!target}
          onClick={() => {
            if (target) {
              setCells(target.slice());
              setChecked(true);
            }
          }}
        >
          Lösung zeigen
        </button>
      </div>

      {checked && stats && (
        <div className={`result${stats.wrong.length > 0 ? ' is-low' : ''}`}>
          <p>
            <strong>{Math.round((stats.correct / stats.total) * 100)} %</strong> der Kästchen
            stimmen mit der Vorlage überein ({stats.correct} von {stats.total}).
          </p>
          <p className="hint">
            {stats.filled < stats.total
              ? `${stats.total - stats.filled} Kästchen sind noch leer – sie zählen als falsch.`
              : 'Alle Kästchen sind bemalt.'}{' '}
            Rot umrandete Kästchen weichen ab.
          </p>
        </div>
      )}
    </>
  );
}
