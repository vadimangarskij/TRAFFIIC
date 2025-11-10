import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

interface BookingModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ event, isOpen, onClose }: BookingModalProps) {
  const { user } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const total = event.price * quantity;

  const handleBook = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc('book_tickets', {
        p_event_id: event.id,
        p_user_id: user.id,
        p_quantity: quantity,
        p_total_amount: total,
      });

      if (error) throw error;

      alert(`Билеты забронированы! ID заказа: ${data.order_id}`);
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      alert('Ошибка при бронировании');
    } finally {
      setIsProcessing(false);
    }
  };

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
            <div className="glass-strong rounded-t-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Бронирование</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="glass rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-400 mb-1">Событие</p>
                <p className="font-bold text-lg mb-3">{event.title}</p>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Цена за билет</span>
                  <span className="font-bold text-xl">{event.price.toFixed(0)} ₽</span>
                </div>
              </div>

              <div className="glass rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-400 mb-3">Количество билетов</p>
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 glass rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </motion.button>

                  <div className="px-8 py-3 glass rounded-xl">
                    <span className="text-2xl font-bold">{quantity}</span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuantity(Math.min(event.available_seats, quantity + 1))}
                    className="p-3 glass rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="glass rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Итого</span>
                  <span className="text-3xl font-bold text-gradient">
                    {total.toFixed(0)} ₽
                  </span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleBook}
                disabled={isProcessing}
                className="w-full py-4 gradient-primary rounded-2xl font-bold text-lg shadow-xl
                         hover:shadow-2xl transition-shadow disabled:opacity-50 flex items-center 
                         justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {isProcessing ? 'Обработка...' : 'Забронировать'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
