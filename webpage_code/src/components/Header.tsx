
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="w-full p-6 absolute top-0 left-0 z-10">
      <Link to="/" className="flex items-center">
        <h2 className="text-trivia-pink font-display text-2xl font-semibold tracking-tight hover:opacity-80 transition-opacity">
          SweeTrivia
        </h2>
      </Link>
    </header>
  );
};

export default Header;
