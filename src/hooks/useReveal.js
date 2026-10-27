import { useEffect } from 'react';

export default function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('v'); io.unobserve(e.target); } }), { threshold: .15 });
    document.querySelectorAll('.rv,.stp,.pg,.curve').forEach(n => io.observe(n));
    return () => io.disconnect();
  }, []);
}
