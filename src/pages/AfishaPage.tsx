import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import Fuse from 'fuse.js';
import { supabase } from '@/lib/supabase';
import { EventCard } from '@/components/EventCard';
import { FilterModal } from '@/components/FilterModal';

const categories = [
  { id: 'all', label: 'Все' },
  { id: 'concert', label: 'Концерты' },
  { id: 'party', label: 'Вечеринки' },
  { id: 'festival', label: 'Фестивали' },
  { id: 'exhibition', label: 'Выставки' },
  { id: 'sport', label: 'Спорт' },
  { id: 'theater', label: 'Театр' },
];

export function AfishaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    dateRange: 'all',
    sortBy: 'date',
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .gt('available_seats', 0)
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const fuse = useMemo(
    () =>
      new Fuse(events, {
        keys: ['title', 'description', 'venue_name', 'category'],
        threshold: 0.3,
      }),
    [events]
  );

  const filteredEvents = useMemo(() => {
    let result = events;

    if (searchQuery) {
      result = fuse.search(searchQuery).map((r) => r.item);
    }

    if (selectedCategory !== 'all') {
      result = result.filter((e) => e.category === selectedCategory);
    }

    result = result.filter(
      (e) => e.price >= filters.minPrice && e.price <= filters.maxPrice
    );

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      if (filters.dateRange === 'today') {
        filterDate.setHours(23, 59, 59, 999);
      } else if (filters.dateRange === 'week') {
        filterDate.setDate(filterDate.getDate() + 7);
      } else if (filters.dateRange === 'month') {
        filterDate.setMonth(filterDate.getMonth() + 1);
      }

      result = result.filter((e) => {
        const eventDate = new Date(e.date);
        return eventDate >= now && eventDate <= filterDate;
      });
    }

    if (filters.sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [events, searchQuery, selectedCategory, filters, fuse]);

  return (
    <div className="min-h-full">
      {/* Header with glassmorphism */}
      <div className="sticky top-0 z-40 safe-top">
        <div className="glass-strong border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск событий..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                         text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 
                         focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(true)}
              className="p-3 glass rounded-xl hover:bg-white/20 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Horizontal category scroll */}
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'gradient-primary text-white shadow-lg'
                      : 'glass text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {cat.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Events grid */}
      <div className="px-4 py-6">
        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass rounded-2xl h-80 animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" 
                   style={{ backgroundSize: '1000px 100%' }} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">События не найдены</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4"
          >
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}
