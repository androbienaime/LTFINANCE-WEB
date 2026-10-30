import { Link, useLocation } from 'react-router-dom';
import LOGO from '../assets/images/logo.png';

const Brand = () => {
  const { pathname } = useLocation();
  return (
    <Link className="brand" to="/" onClick={() => pathname === '/' && window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <img src={LOGO} alt="" />
      <span><b>LT FINANCE</b><small>Le partenaire de vos ambitions.</small></span>
    </Link>
  );
};

export default Brand;