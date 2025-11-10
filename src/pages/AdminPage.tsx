import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users, Calendar, Ticket, DollarSign, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b'];

export function AdminPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_stats');
      if (error) throw error;
      return data;
    },
  });

  const chartData = [
    { name: 'Пользователи', value: stats?.total_users || 0 },
    { name: 'События', value: stats?.total_events || 0 },
    { name: 'Билеты', value: stats?.total_tickets_sold || 0 },
  ];

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Админ-панель</h1>
        <p className="text-gray-400">Общая статистика платформы</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-center gap-2 text-primary-400 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm text-gray-400">Пользователи</span>
          </div>
          <p className="text-3xl font-bold">{stats?.total_users || 0}</p>
        </div>

        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-center gap-2 text-accent-400 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm text-gray-400">События</span>
          </div>
          <p className="text-3xl font-bold">{stats?.total_events || 0}</p>
        </div>

        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <Ticket className="w-5 h-5" />
            <span className="text-sm text-gray-400">Билетов продано</span>
          </div>
          <p className="text-3xl font-bold">{stats?.total_tickets_sold || 0}</p>
        </div>

        <div className="glass-strong rounded-2xl p-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm text-gray-400">Выручка</span>
          </div>
          <p className="text-2xl font-bold">{stats?.total_revenue?.toFixed(0) || 0} ₽</p>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-strong rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Распределение</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Stats */}
      <div className="glass-strong rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Дополнительно</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 glass rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary-400" />
              <span>Активные события</span>
            </div>
            <span className="font-bold">{stats?.active_events || 0}</span>
          </div>

          <div className="flex items-center justify-between p-3 glass rounded-xl">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-accent-400" />
              <span>Ожидающие заявки</span>
            </div>
            <span className="font-bold">{stats?.pending_applications || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
