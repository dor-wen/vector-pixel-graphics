import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import { siteConfig } from './config/site';
import HomePage from './pages/HomePage';
import PixelTaskPage from './pages/PixelTaskPage';
import ZoomQuizPage from './pages/ZoomQuizPage';
import SummaryPage from './pages/SummaryPage';
import EncodingPage from './pages/EncodingPage';

export default function App() {
  return (
    <HashRouter>
      <header className="siteHeader">
        <h1>{siteConfig.title}</h1>
        <p className="subtitle">{siteConfig.subtitle}</p>
        <nav className="siteNav">
          <NavLink to="/" end>
            Start
          </NavLink>
          <NavLink to="/pixel">Pixel-Raster</NavLink>
          <NavLink to="/quiz">Zoom-Quiz</NavLink>
          <NavLink to="/merksatz">Merksatz</NavLink>
          <NavLink to="/code">Bild als Code</NavLink>
        </nav>
      </header>
      <main className="siteMain">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pixel" element={<PixelTaskPage />} />
          <Route path="/quiz" element={<ZoomQuizPage />} />
          <Route path="/merksatz" element={<SummaryPage />} />
          <Route path="/code" element={<EncodingPage />} />
        </Routes>
      </main>
    </HashRouter>
  );
}
