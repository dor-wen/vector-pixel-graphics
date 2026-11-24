import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { encodingConfig, encodingTasks } from '../config/site';
import type { EncodingColor, EncodingTask } from '../config/site';
import { normalizeCode, paintCell, readableTextColor, splitRows } from '../lib/encoding';

const { palette, columns: FREE_COLUMNS, rows: FREE_ROWS, starterRows } = encodingConfig;
const STARTER_CODE = starterRows.join('');
const ALPHABET = palette.map((color) => color.letter).join('');
const COLOR_BY_LETTER = new Map<string, EncodingColor>(
  palette.map((color) => [color.letter, color]),
);

/** Kleine, nicht bedienbare Vorschau eines Zielbildes (nur Farben, keine Buchstaben). */
function MiniPicture({ rows, label }: { rows: string[]; label: string }) {
  const columns = rows[0].length;
  const style = { '--cols': columns, '--rows': rows.length } as CSSProperties;
  return (
    <div
      className="pixelGrid miniPicture"
      style={style}
      role="img"
      aria-label={label}
    >
      {rows.map((line, r) =>
        line.split('').map((letter, c) => (
          <span
            key={`${r}-${c}`}
            className="pixelCell"
            style={{ background: COLOR_BY_LETTER.get(letter)?.value ?? '#fff' }}
          />
        )),
      )}
    </div>
  );
}

export default function EncodingPage() {
  const [mode, setMode] = useState('free');
  const [code, setCode] = useState(STARTER_CODE);
  const [selected, setSelected] = useState(palette[0].letter);
  const [checked, setChecked] = useState(false);
  const [showResult, setShowResult] = useState(0);
  const painting = useRef(false);

  const task = encodingTasks.find((entry) => entry.id === mode) ?? null;
  const columns = task ? task.rows[0].length : FREE_COLUMNS;
  const rows = task ? task.rows.length : FREE_ROWS;
  const cellCount = columns * rows;
  const solution = task ? task.rows.join('') : null;

  const cells = useMemo(
    () => Array.from({ length: cellCount }, (_, index) => code[index] ?? ''),
    [code, cellCount],
  );

  const wrongSet = useMemo(() => {
    if (!solution) return new Set<number>();
    const wrong = new Set<number>();
    for (let index = 0; index < cellCount; index += 1) {
      if ((code[index] ?? '') !== solution[index]) wrong.add(index);
    }
    return wrong;
  }, [code, solution, cellCount]);

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
    setCode((prev) => paintCell(prev, index, selected, cellCount));
    setChecked(false);
  }

  function paintAt(x: number, y: number) {
    const hit = document.elementFromPoint(x, y);
    const cell = hit instanceof HTMLElement ? hit.closest<HTMLElement>('[data-cell]') : null;
    if (!cell) return;
    const index = Number(cell.dataset.cell);
    if (!Number.isNaN(index)) paint(index);
  }

  function startFree() {
    setMode('free');
    setCode(STARTER_CODE);
    setChecked(false);
    setShowResult(0);
  }

  function startTask(next: EncodingTask) {
    setMode(next.id);
    setCode('');
    setChecked(false);
    setShowResult(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const complete = code.length === cellCount;
  const correct = cellCount - wrongSet.size;
  const gridStyle = { '--cols': columns, '--rows': rows } as CSSProperties;

  const pictureGrid = (
    <div className="pixelGrid" style={gridStyle}>
      {cells.map((letter, index) => {
        const color = COLOR_BY_LETTER.get(letter);
        const classes = ['pixelCell', 'codeCell'];
        if (!color) classes.push('is-empty');
        if (checked && wrongSet.has(index)) classes.push('is-wrong');
        return (
          <button
            key={index}
            type="button"
            data-cell={index}
            className={classes.join(' ')}
            style={
              color
                ? { background: color.value, color: readableTextColor(color.value) }
                : undefined
            }
            aria-label={`Zeile ${Math.floor(index / columns) + 1}, Spalte ${
              (index % columns) + 1
            }: ${color ? color.name : 'leer'}`}
            onClick={() => paint(index)}
          >
            {color ? letter : '·'}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <h2>Bild als Code</h2>
      <p>
        Der Computer speichert ein Bild nicht als Bild, sondern als lange Kette von Zeichen:
        für jedes Pixel genau ein Buchstabe. Er liest diese Kette zeilenweise – erst die
        oberste Reihe von links nach rechts, dann die nächste. Das Zeichen an Position{' '}
        <code>zeile × {columns} + spalte</code> (gezählt ab 0) gehört also zum Pixel in dieser
        Zeile und Spalte.
      </p>
      <p className="hint">
        Klicke in das Raster oder tippe direkt in das Code-Feld – beides bleibt synchron. Mit
        gedrückter Maustaste kannst du auch über mehrere Kästchen malen.
      </p>

      <div className="legend" role="group" aria-label="Farblegende">
        {palette.map((color) => (
          <button
            key={color.letter}
            type="button"
            className="legendSwatch"
            style={{ background: color.value, color: readableTextColor(color.value) }}
            aria-pressed={selected === color.letter}
            aria-label={`${color.letter} = ${color.name}`}
            onClick={() => setSelected(color.letter)}
          >
            <span className="legendLetter">{color.letter}</span>
            <span className="legendName">{color.name}</span>
          </button>
        ))}
      </div>

      {task && (
        <div className="taskBanner">
          <div className="taskBannerText">
            <h3>Aufgabe: {task.title}</h3>
            <p className="hint">{task.hint}</p>
            <p className="hint">
              Schreibe den Code für das gezeigte Bild. Dein eigenes Ergebnis bleibt zuerst
              versteckt – mit dem Regler unter dem Raster kannst du es einblenden. Groß- oder
              Kleinschreibung ist egal.
            </p>
          </div>
          <figure className="taskBannerFigure">
            <MiniPicture rows={task.rows} label={`Vorschau des gesuchten Bildes: ${task.title}`} />
            <figcaption>Das gesuchte Bild</figcaption>
          </figure>
          <button type="button" className="btn" onClick={startFree}>
            Zurück zum freien Malen
          </button>
        </div>
      )}

      <div className="encodingLayout">
        <section className="encodingPane">
          <h3>Dein Bild</h3>
          <div className="resultPreview">
            <div
              className="pixelStage"
              style={
                task
                  ? {
                      opacity: showResult / 100,
                      pointerEvents: showResult === 0 ? 'none' : undefined,
                    }
                  : undefined
              }
              onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) => {
                painting.current = true;
                paintAt(event.clientX, event.clientY);
              }}
              onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
                if (painting.current) paintAt(event.clientX, event.clientY);
              }}
            >
              {pictureGrid}
            </div>
            {task && showResult === 0 && (
              <span className="resultPreviewMark" aria-hidden="true">
                ?
              </span>
            )}
          </div>
          {task && (
            <label className="revealControl">
              <span>Eigenes Bild einblenden</span>
              <input
                type="range"
                min={0}
                max={100}
                value={showResult}
                onChange={(event) => setShowResult(Number(event.target.value))}
              />
            </label>
          )}
        </section>

        <section className="encodingPane">
          <h3>Dein Code</h3>
          <textarea
            className="codeInput"
            value={code}
            rows={Math.min(6, Math.max(3, rows))}
            spellCheck={false}
            autoCapitalize="characters"
            autoCorrect="off"
            aria-label="Code des Bildes"
            placeholder="Hier entsteht dein Code …"
            onChange={(event) => {
              setCode(normalizeCode(event.target.value, ALPHABET, cellCount));
              setChecked(false);
            }}
          />
          <p
            className={`codeCounter${complete ? ' is-ok' : ' is-warn'}`}
            role="status"
          >
            {complete
              ? `${cellCount} / ${cellCount} Zeichen – der Code ist vollständig.`
              : `Ich erwarte ${cellCount} Zeichen (${columns}×${rows}). Du hast ${code.length}.`}
          </p>
          <pre className="codeRows" aria-hidden="true">
            {splitRows(code, columns, rows).join('\n')}
          </pre>
          <p className="hint">
            Zeilenansicht: ein <code>·</code> steht für ein Pixel, das noch keinen Buchstaben
            hat.
          </p>
        </section>
      </div>

      {task ? (
        <div className="controls">
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              setChecked(true);
              setShowResult(100);
            }}
          >
            Prüfen
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setCode(solution ?? '');
              setChecked(true);
              setShowResult(100);
            }}
          >
            Lösung zeigen
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setCode('');
              setChecked(false);
              setShowResult(0);
            }}
          >
            Leeren
          </button>
        </div>
      ) : (
        <div className="controls">
          <button type="button" className="btn" onClick={() => setCode('')}>
            Alles leeren
          </button>
          <button type="button" className="btn" onClick={() => setCode(STARTER_CODE)}>
            Startbild
          </button>
          <span className="hint">
            {columns}×{rows} Pixel = {cellCount} Zeichen
          </span>
        </div>
      )}

      {task && checked && (
        <div className={`result${wrongSet.size > 0 ? ' is-low' : ''}`}>
          <p>
            <strong>{Math.round((correct / cellCount) * 100)} %</strong> der Kästchen stimmen
            mit dem gesuchten Bild überein ({correct} von {cellCount}).
          </p>
          <p className="hint">
            {wrongSet.size === 0
              ? 'Perfekt – dein Code erzeugt genau dieses Bild.'
              : 'Rot umrandete Kästchen weichen ab. Vergleiche sie mit der Vorlage und achte auf die Zeilenreihenfolge.'}
          </p>
        </div>
      )}

      <h2>Aufgaben</h2>
      <p className="hint">
        Jede Aufgabe zeigt ein Bild aus 5×5 Pixeln. Schreibe den passenden Code dafür. Wie dein
        eigener Code aussieht, bleibt zunächst verborgen – du kannst es bei Bedarf einblenden.
      </p>
      <div className="cardGrid">
        {encodingTasks.map((entry, index) => (
          <section className="card" key={entry.id}>
            <h3>
              {index + 1}. {entry.title}
            </h3>
            <MiniPicture rows={entry.rows} label={`Vorschau: ${entry.title}`} />
            <p className="hint">
              {entry.rows[0].length}×{entry.rows.length} Pixel
            </p>
            <button type="button" className="btn" onClick={() => startTask(entry)}>
              Code schreiben
            </button>
          </section>
        ))}
      </div>
    </>
  );
}
