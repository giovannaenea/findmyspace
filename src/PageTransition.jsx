import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './PageTransition.css';

/**
 * Plays a single slide-in animation when the route changes.
 * No exit animation, no key swap — just add the class, let it play, remove it.
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const [animClass, setAnimClass] = useState('');

  useEffect(() => {
    if (location.pathname === prevPathRef.current) return;

    const prevDepth = prevPathRef.current.split('/').filter(Boolean).length;
    const nextDepth = location.pathname.split('/').filter(Boolean).length;
    const cls = nextDepth < prevDepth ? 'pt-enter-back' : 'pt-enter-forward';

    prevPathRef.current = location.pathname;
    setAnimClass(cls);

    // Remove the class after the animation finishes so it can retrigger next nav
    const t = setTimeout(() => setAnimClass(''), 220);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div className={`page-transition ${animClass}`}>
      {children}
    </div>
  );
};

export default PageTransition;