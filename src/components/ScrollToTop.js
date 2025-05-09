import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {  // function 대신 화살표 함수로 변경
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;