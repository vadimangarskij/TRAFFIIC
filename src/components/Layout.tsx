import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from './BottomNav';

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto pb-20"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      
      <BottomNav />
    </div>
  );
}
