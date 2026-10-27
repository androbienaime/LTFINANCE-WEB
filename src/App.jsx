import { useState, useEffect } from 'react';
import useReveal from './hooks/useReveal';
import Header from './components/Header';
import Menu from './components/Menu';
import Hero from './components/Hero';
import Solutions from './components/Solutions';
import Why from './components/Why';
import Edu from './components/Edu';
import How from './components/How';
import Projects from './components/Projects';
import Commit from './components/Commit';
import Faq from './components/Faq';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useReveal();
  return (<><Header theme={theme} setTheme={setTheme} onMenu={() => setOpen(true)} /><Menu open={open} onClose={() => setOpen(false)} />
    <main><Hero /><Solutions /><Why /><Edu /><How /><Projects /><Commit /><Faq /><Contact /></main><Footer theme={theme} /></>);
}
