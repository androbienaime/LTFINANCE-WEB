import { useState, useEffect, useRef } from 'react';
import { I } from '../lib/icons';
import Brand from './Brand';
import { NAV } from '../lib/nav';

export default function Header({ theme, setTheme, onMenu }) {
  const [sc, setSc] = useState(false), [act, setAct] = useState('#top'), [lang, setLang] = useState('FR'), bar = useRef(null);
  useEffect(() => {
    const f = () => {
      setSc(scrollY > 20);
      const h = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.width = Math.max(120, h > 0 ? scrollY / h * innerWidth : 0) + 'px';
      let cur = '#top';
      NAV.forEach(([, id]) => { const el = id === '#top' ? null : document.querySelector(id); if (el && el.getBoundingClientRect().top < 200) cur = id; });
      setAct(cur);
    };
    f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f);
  }, []);
  return (
    <header className={'hdr' + (sc ? ' s' : '')} id="top">
      <div className="c row">
        <Brand />
        <div className="quick">
          <div className="lang">{['FR', 'HT'].map(l => <button key={l} className={lang === l ? 'on' : ''} onClick={() => setLang(l)}>{l}</button>)}</div>
          <div className="theme" role="group" aria-label="Thème">
            <button className={theme === 'light' ? 'on' : ''} onClick={() => setTheme('light')} aria-label="Thème clair"><I n="sun" /></button>
            <button className={theme === 'dark' ? 'on' : ''} onClick={() => setTheme('dark')} aria-label="Thème sombre"><I n="moon" /></button>
          </div>
          <a className="btn b1 sm" href="#connexion">Ouvrir un compte</a>
          <a className="btn b2 sm" href="#connexion">Se connecter</a>
        </div>
        <button className="burger" onClick={onMenu} aria-label="Ouvrir le menu"><I n="menu" /></button>
      </div>
      <nav className="c nav" aria-label="Navigation principale" style={{ maxWidth: 'none' }}>{NAV.map(([n, h]) => <a key={n} href={h} className={act === h ? 'on' : ''}>{n}</a>)}</nav>
      <div className="bar" ref={bar} />
    </header>
  );
}
