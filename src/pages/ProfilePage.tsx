import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Ticket, Settings, LogOut, Crown, QrCode } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode';
import { useState, useEffect } from 'react';

export function ProfilePage() {
  const { user } = useAuthStore();
  const [qrDataUrl, setQrDataUrl] = useState('');

  const { data: tickets = [] } = useQuery({
    queryKey: ['user-tickets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, events(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (user) {
      QRCode.toDataURL(user.id, { width: 200 }).then(setQrDataUrl);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Profile Header */}
      <div className="glass-strong rounded-3xl p-6 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="relative">
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt={user.first_name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
            )}
            {user.role !== 'user' && (
              <div className="absolute -bottom-1 -right-1 p-1.5 glass rounded-full">
                <Crown className="w-4 h-4 text-yellow-400" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">
              {user.first_name} {user.last_name}
            </h1>
            {user.username && (
              <p className="text-primary-400 mb-2">@{user.username}</p>
            )}
            <div className="inline-block px-3 py-1 glass rounded-full text-sm">
              {getRoleLabel(user.role)}
            </div>
          </div>
        </div>

        {/* QR Code */}
        {qrDataUrl && (
          <div className="glass rounded-2xl p-4 flex flex-col items-center">
            <QrCode className="w-5 h-5 mb-2 text-primary-400" />
            <p className="text-sm text-gray-400 mb-3">Мой QR-код</p>
            <img src={qrDataUrl} alt="User QR" className="w-32 h-32 rounded-xl" />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-strong rounded-2xl p-4 text-center">
          <Ticket className="w-6 h-6 mx-auto mb-2 text-accent-400" />
          <p className="text-2xl font-bold">{tickets.length}</p>
          <p className="text-sm text-gray-400">Билетов</p>
        </div>
        <div className="glass-strong rounded-2xl p-4 text-center">
          <Crown className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-400">Уровень</p>
        </div>
      </div>

      {/* Tickets History */}
      <div className="glass-strong rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary-400" />
          История билетов
        </h2>

        <div className="space-y-3">
          {tickets.length === 0 ? (
            <p className="text-center text-gray-400 py-4">У вас пока нет билетов</p>
          ) : (
            tickets.map((ticket: any) => (
              <motion.div
                key={ticket.id}
                whileHover={{ scale: 1.02 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold">{ticket.events?.title}</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ticket.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : ticket.status === 'used'
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {getTicketStatusLabel(ticket.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  Билет №{ticket.ticket_number}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Settings */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        className="w-full glass-strong rounded-2xl p-4 flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="font-medium">Настройки</span>
        </div>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.98 }}
        className="w-full glass-strong rounded-2xl p-4 flex items-center justify-between text-red-400"
      >
        <div className="flex items-center gap-3">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Выйти</span>
        </div>
      </motion.button>
    </div>
  );
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    user: 'Пользователь',
    promoter: 'Промоутер',
    manager: 'Менеджер',
    admin: 'Администратор',
  };
  return labels[role] || role;
}

function getTicketStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Активен',
    used: 'Использован',
    cancelled: 'Отменен',
    refunded: 'Возвращен',
  };
  return labels[status] || status;
}
