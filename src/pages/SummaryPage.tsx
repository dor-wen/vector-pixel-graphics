import { quizItems } from '../config/site';
import Motif from '../components/Motif';

const house = quizItems[0];

export default function SummaryPage() {
  return (
    <>
      <h2>Merksatz</h2>
      <p>
        Ein <strong>Pixelbild</strong> speichert für jedes Kästchen eine Farbe. Ein{' '}
        <strong>Vektorbild</strong> speichert stattdessen die Formen selbst – als Rechteck,
        Kreis oder Linie mit Zahlenwerten.
      </p>

      <div className="compareGrid">
        <figure className="card">
          <div className="figureBox">
            <Motif shapes={house.shapes} mode="vector" resolution={house.resolution} />
          </div>
          <figcaption>
            <strong>Vektorgrafik</strong>
            <br />
            beliebig vergrößerbar, Kanten bleiben glatt
          </figcaption>
        </figure>
        <figure className="card">
          <div className="figureBox">
            <Motif shapes={house.shapes} mode="pixel" resolution={100} />
          </div>
          <figcaption>
            <strong>Pixelgrafik</strong>
            <br />
            feste Kästchen, beim Vergrößern werden sie sichtbar
          </figcaption>
        </figure>
      </div>

      <table className="compareTable">
        <thead>
          <tr>
            <th scope="col">Eigenschaft</th>
            <th scope="col">Pixelgrafik</th>
            <th scope="col">Vektorgrafik</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Aufbau</th>
            <td>Raster aus farbigen Kästchen</td>
            <td>Formen mit Zahlen beschrieben</td>
          </tr>
          <tr>
            <th scope="row">Vergrößern</th>
            <td>wird grob und blockig</td>
            <td>bleibt scharf</td>
          </tr>
          <tr>
            <th scope="row">Dateigröße</th>
            <td>wächst mit der Bildgröße</td>
            <td>meist klein</td>
          </tr>
          <tr>
            <th scope="row">Typische Beispiele</th>
            <td>Foto, Screenshot</td>
            <td>Logo, Straßenkarte, Schrift</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
