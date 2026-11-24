import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <>
      <h2>Wie speichert ein Computer ein Bild?</h2>
      <p>
        Ein Bildschirm besteht aus sehr vielen kleinen Kästchen, den <strong>Pixeln</strong>.
        Der Computer muss also entscheiden, welche Farbe jedes dieser Kästchen bekommt. Genau
        das probierst du zuerst selbst aus.
      </p>
      <div className="cardGrid">
        <section className="card">
          <h3>1. Bild als Code</h3>
          <p>
            Jedes Pixel bekommt einen Buchstaben. Probiere aus, wie aus einer Zeichenkette ein
            Bild wird – und umgekehrt.
          </p>
          <Link to="/code">Zum Ausprobieren →</Link>
        </section>
        <section className="card">
          <h3>2. Bild nachbauen</h3>
          <p>
            Über ein Foto ist ein grobes Raster gelegt. Male die Kästchen mit den wenigen
            vorgegebenen Farben so aus, dass das Bild erkennbar wird.
          </p>
          <Link to="/pixel">Zum Raster →</Link>
        </section>
        <section className="card">
          <h3>3. Zoom-Quiz</h3>
          <p>
            Zwei Bilder sehen gleich aus – bis du hineinzoomst. Finde heraus, welches die
            Vektorgrafik ist.
          </p>
          <Link to="/quiz">Zum Quiz →</Link>
        </section>
        <section className="card">
          <h3>4. Merksatz</h3>
          <p>Was du dir zu Vektor- und Pixelgrafiken merken solltest.</p>
          <Link to="/merksatz">Zusammenfassung →</Link>
        </section>
      </div>
    </>
  );
}
