import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Heart, 
  User, 
  Briefcase,
  TrendingUp,
  Shield
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { path: '/afisha', icon: Calendar, label: 'Афиша' },
  { path: '/tinder', icon: Heart, label: 'Знакомства' },
  { path: '/vacancies', icon: Briefcase, label: 'Вакансии' },
  { path: '/profile', icon: User, label: 'Профиль' },
];

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuthStore();

  const showPromoter = user?.role === 'promoter' || user?.role === 'manager' || user?.role === 'admin';
  const showAdmin = user?.role === 'admin';

  const items = [
    ...navItems,
    ...(showPromoter ? [{ path: '/promoter', icon: TrendingUp, label: 'Продажи' }] : []),
    ...(showAdmin ? [{ path: '/admin', icon: Shield, label: 'Админ' }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 safe-bottom z-50">
      <div className="glass-strong border-t border-white/10">
        <div className="flex items-center justify-around px-2 py-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center p-2 min-w-[60px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 gradient-primary rounded-xl opacity-20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <Icon 
                  className={`w-6 h-6 mb-1 transition-colors ${
                    isActive ? 'text-primary-400' : 'text-gray-400'
                  }`}
                />
                <span 
                  className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
