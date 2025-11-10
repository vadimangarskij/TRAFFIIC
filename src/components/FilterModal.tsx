import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, SortAsc } from 'lucide-react';

interface Filters {
  minPrice: number;
  maxPrice: number;
  dateRange: string;
  sortBy: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function FilterModal({ isOpen, onClose, filters, onFiltersChange }: FilterModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
          >
            <div className="glass-strong rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Фильтры</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-3">
                    <DollarSign className="w-4 h-4 text-primary-400" />
                    Цена
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => onFiltersChange({ ...filters, minPrice: Number(e.target.value) })}
                      placeholder="От"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                               focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => onFiltersChange({ ...filters, maxPrice: Number(e.target.value) })}
                      placeholder="До"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                               focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Calendar className="w-4 h-4 text-accent-400" />
                    Период
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'all', label: 'Все' },
                      { value: 'today', label: 'Сегодня' },
                      { value: 'week', label: 'Неделя' },
                      { value: 'month', label: 'Месяц' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => onFiltersChange({ ...filters, dateRange: option.value })}
                        className={`py-3 rounded-xl font-medium transition-all ${
                          filters.dateRange === option.value
                            ? 'gradient-primary text-white'
                            : 'glass hover:bg-white/20'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-3">
                    <SortAsc className="w-4 h-4 text-green-400" />
                    Сортировка
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white 
                             focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="date">По дате</option>
                    <option value="price-asc">Цена: по возрастанию</option>
                    <option value="price-desc">Цена: по убыванию</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    onFiltersChange({
                      minPrice: 0,
                      maxPrice: 10000,
                      dateRange: 'all',
                      sortBy: 'date',
                    });
                  }}
                  className="flex-1 py-3 glass rounded-xl font-medium hover:bg-white/20 transition-colors"
                >
                  Сбросить
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 gradient-primary rounded-xl font-medium shadow-lg"
                >
                  Применить
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
