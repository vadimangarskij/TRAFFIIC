import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Clock, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function VacanciesPage() {
  const [selectedType, setSelectedType] = useState('all');

  const { data: vacancies = [], isLoading } = useQuery({
    queryKey: ['vacancies', selectedType],
    queryFn: async () => {
      let query = supabase
        .from('vacancies')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (selectedType !== 'all') {
        query = query.eq('role_type', selectedType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const types = [
    { id: 'all', label: 'Все' },
    { id: 'promoter', label: 'Промоутер' },
    { id: 'manager', label: 'Менеджер' },
    { id: 'staff', label: 'Персонал' },
    { id: 'security', label: 'Охрана' },
  ];

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Вакансии</h1>
        <p className="text-gray-400">Найдите работу в индустрии развлечений</p>
      </div>

      {/* Type filter */}
      <div className="overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {types.map((type) => (
            <motion.button
              key={type.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                selectedType === type.id
                  ? 'gradient-primary text-white shadow-lg'
                  : 'glass text-gray-300 hover:bg-white/20'
              }`}
            >
              {type.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Vacancies */}
      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="glass rounded-2xl h-40 animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent"
              style={{ backgroundSize: '1000px 100%' }}
            />
          ))
        ) : vacancies.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">Вакансии не найдены</p>
          </div>
        ) : (
          vacancies.map((vacancy: any, index: number) => (
            <motion.div
              key={vacancy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="glass-strong rounded-2xl p-5 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{vacancy.title}</h3>
                  {vacancy.company_name && (
                    <p className="text-primary-400 text-sm mb-2">{vacancy.company_name}</p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Briefcase className="w-4 h-4 text-accent-400" />
                  <span>{getRoleTypeLabel(vacancy.role_type)}</span>
                </div>
                {vacancy.location && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="truncate">{vacancy.location}</span>
                  </div>
                )}
                {vacancy.salary_min && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <span>от {vacancy.salary_min.toFixed(0)} ₽</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>{getEmploymentTypeLabel(vacancy.employment_type)}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function getRoleTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    promoter: 'Промоутер',
    manager: 'Менеджер',
    staff: 'Персонал',
    security: 'Охрана',
    technical: 'Технический',
  };
  return labels[type] || type;
}

function getEmploymentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    full_time: 'Полная',
    part_time: 'Частичная',
    project: 'Проект',
    one_time: 'Разовая',
  };
  return labels[type] || type;
}
