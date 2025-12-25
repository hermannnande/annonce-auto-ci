import { motion } from 'motion/react';
import { ExternalLink, Eye, MapPin, Calendar } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

interface VehicleCardMiniProps {
  listing: {
    id: string;
    title: string;
    brand: string;
    model: string;
    price: number;
    year: number;
    images: string[];
    location?: string;
    status: string;
    views?: number;
  };
}

export function VehicleCardMini({ listing }: VehicleCardMiniProps) {
  const navigate = useNavigate();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Disponible', color: 'bg-green-500' },
      sold: { label: 'Vendu', color: 'bg-red-500' },
      pending: { label: 'En attente', color: 'bg-yellow-500' },
      archived: { label: 'Archivé', color: 'bg-gray-500' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleViewListing = () => {
    // Ouvrir l'annonce dans un nouvel onglet
    window.open(`/annonces/${listing.id}`, '_blank');
  };

  const handleCardClick = () => {
    // Naviguer vers l'annonce dans le même onglet
    navigate(`/annonces/${listing.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card 
        className="p-3 bg-gradient-to-br from-gray-50 to-white border-2 border-[#FACC15]/20 hover:border-[#FACC15]/40 transition-all cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex gap-3">
          {/* Image */}
          <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
            {listing.images?.[0] ? (
              <img
                src={listing.images[0]}
                alt={`${listing.brand} ${listing.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Calendar className="w-6 h-6" />
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-1 right-1">
              {getStatusBadge(listing.status)}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className="font-bold text-[#0F172A] text-sm truncate mb-1">
              {listing.brand} {listing.model}
            </h4>

            {/* Price */}
            <p className="text-[#FACC15] font-bold text-lg mb-1">
              {formatPrice(listing.price)}
            </p>

            {/* Details */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {listing.year}
              </span>
              {listing.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {listing.location}
                </span>
              )}
              {listing.views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {listing.views}
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Empêcher la propagation au card
                handleViewListing();
              }}
              className="text-[#FACC15] hover:text-[#FBBF24] hover:bg-[#FACC15]/10 h-8 w-8 p-0"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

