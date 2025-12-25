import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle } from 'lucide-react';

export function MobileNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-3 h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-1 ${
            isActive('/') ? 'text-[#FACC15]' : 'text-gray-600'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Accueil</span>
        </Link>

        <Link
          to="/annonces"
          className={`flex flex-col items-center justify-center gap-1 ${
            isActive('/annonces') || location.pathname.startsWith('/annonces/')
              ? 'text-[#FACC15]'
              : 'text-gray-600'
          }`}
        >
          <Search className="w-6 h-6" />
          <span className="text-xs">Rechercher</span>
        </Link>

        <Link
          to="/publier"
          className={`flex flex-col items-center justify-center gap-1 ${
            isActive('/publier') ? 'text-[#FACC15]' : 'text-gray-600'
          }`}
        >
          <PlusCircle className="w-6 h-6" />
          <span className="text-xs">Publier</span>
        </Link>
      </div>
    </div>
  );
}
