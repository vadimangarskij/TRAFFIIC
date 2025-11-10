import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  venue_name: string;
  venue_address: string;
  price: number;
  available_seats: number;
  image_url?: string;
}

export function EventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.date);

  return (
    <Link to={`/event/${event.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="glass rounded-2xl overflow-hidden group"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full gradient-primary opacity-30" />
          )}
          <div className="absolute inset-0 gradient-overlay" />
          
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 glass-strong rounded-full text-xs font-medium">
              {getCategoryLabel(event.category)}
            </span>
          </div>

          {/* Price */}
          <div className="absolute top-3 right-3">
            <div className="px-3 py-1 glass-strong rounded-full text-sm font-bold">
              {event.price === 0 ? 'Бесплатно' : `${event.price.toFixed(0)} ₽`}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
            {event.title}
          </h3>

          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-400" />
              <span>
                {format(eventDate, 'd MMMM, HH:mm', { locale: ru })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent-400" />
              <span className="line-clamp-1">{event.venue_name}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-1 text-green-400">
                <Ticket className="w-4 h-4" />
                <span className="font-medium">{event.available_seats} мест</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    concert: 'Концерт',
    party: 'Вечеринка',
    festival: 'Фестиваль',
    exhibition: 'Выставка',
    sport: 'Спорт',
    theater: 'Театр',
    cinema: 'Кино',
    other: 'Другое',
  };
  return labels[category] || category;
}
