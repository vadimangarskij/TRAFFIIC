import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Ticket, Percent } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function PromoterPage() {
  const { user } = useAuthStore();

  const { data: promotions = [] } = useQuery({
    queryKey: ['promotions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*, events(*)')
        .eq('promoter_id', user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const totalSales = promotions.reduce((sum: number, p: any) => sum + (p.total_sales || 0), 0);
  const totalCommission = promotions.reduce((sum: number, p: any) => sum + (p.total_commission || 0), 0);
  const totalTickets = promotions.reduce((sum: number, p: any) => sum + (p.tickets_sold || 0), 0);

  const chartData = promotions.slice(0, 7).map((p: any) => ({
    name: p.events?.title?.substring(0, 10) || 'Event',
    sales: p.total_sales || 0,
  }));

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Промоутер</h1>
        <p className="text-gray-400">Ваша статистика продаж</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-center gap-2 text-primary-400 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm text-gray-400">Продажи</span>
          </div>
          <p className="text-2xl font-bold">{totalSales.toFixed(0)} ₽</p>
        </div>

        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <Percent className="w-5 h-5" />
            <span className="text-sm text-gray-400">Комиссия</span>
          </div>
          <p className="text-2xl font-bold">{totalCommission.toFixed(0)} ₽</p>
        </div>

        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-center gap-2 text-accent-400 mb-2">
            <Ticket className="w-5 h-5" />
            <span className="text-sm text-gray-400">Билетов</span>
          </div>
          <p className="text-2xl font-bold">{totalTickets}</p>
        </div>

        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm text-gray-400">События</span>
          </div>
          <p className="text-2xl font-bold">{promotions.length}</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="glass-strong rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">График продаж</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
              />
              <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Promotions List */}
      <div className="glass-strong rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Мои продвижения</h2>
        <div className="space-y-3">
          {promotions.length === 0 ? (
            <p className="text-center text-gray-400 py-4">У вас пока нет активных продвижений</p>
          ) : (
            promotions.map((promo: any) => (
              <div key={promo.id} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold">{promo.events?.title}</p>
                  <span className="px-2 py-1 glass rounded-full text-xs">
                    {promo.commission_rate}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-400">
                  <div>
                    <p className="text-xs">Продажи</p>
                    <p className="font-medium text-white">{promo.total_sales?.toFixed(0)} ₽</p>
                  </div>
                  <div>
                    <p className="text-xs">Комиссия</p>
                    <p className="font-medium text-green-400">{promo.total_commission?.toFixed(0)} ₽</p>
                  </div>
                  <div>
                    <p className="text-xs">Билетов</p>
                    <p className="font-medium text-white">{promo.tickets_sold}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
