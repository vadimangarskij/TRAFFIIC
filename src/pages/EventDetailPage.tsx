import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, MapPin, Ticket, Users,
  Share2, Heart, Info
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { supabase } from '@/lib/supabase';
import { BookingModal } from '@/components/BookingModal';

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 animate-pulse">
          <div className="w-48 h-48 bg-white/10 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Событие не найдено</p>
      </div>
    );
  }

  const eventDate = new Date(event.date);

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Image */}
      <div className="relative h-80">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full gradient-primary opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />

        {/* Back button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-3 glass-strong rounded-xl safe-top"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2 safe-top">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-3 glass-strong rounded-xl"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="p-3 glass-strong rounded-xl"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="px-4 -mt-20 relative z-10">
        {/* Title Card */}
        <div className="glass-strong rounded-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">{event.title}</h1>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="glass rounded-xl p-3">
              <div className="flex items-center gap-2 text-primary-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs text-gray-400">Дата</span>
              </div>
              <p className="font-medium">
                {format(eventDate, 'd MMMM', { locale: ru })}
              </p>
              <p className="text-sm text-gray-400">
                {format(eventDate, 'HH:mm')}
              </p>
            </div>

            <div className="glass rounded-xl p-3">
              <div className="flex items-center gap-2 text-accent-400 mb-1">
                <Ticket className="w-4 h-4" />
                <span className="text-xs text-gray-400">Цена</span>
              </div>
              <p className="font-medium text-xl">
                {event.price === 0 ? 'Бесплатно' : `${event.price.toFixed(0)} ₽`}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 glass rounded-xl">
            <div className="flex items-center gap-2 text-green-400">
              <Users className="w-5 h-5" />
              <span className="font-medium">{event.available_seats} мест доступно</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="glass-strong rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary-400" />
            О событии
          </h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">
            {event.description || 'Описание события скоро появится...'}
          </p>
        </div>

        {/* Location */}
        <div className="glass-strong rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent-400" />
            Место проведения
          </h2>
          <p className="font-medium mb-1">{event.venue_name}</p>
          <p className="text-gray-400 text-sm">{event.venue_address}</p>
        </div>

        {/* Book Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowBooking(true)}
          className="w-full py-4 gradient-primary rounded-2xl font-bold text-lg shadow-xl
                   hover:shadow-2xl transition-shadow"
        >
          Забронировать билет
        </motion.button>
      </div>

      <BookingModal
        event={event}
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
      />
    </div>
  );
}
