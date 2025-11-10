import { useQuery } from '@tanstack/react-query';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Loader } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore, User } from '@/store/authStore';

const fetchNextUser = async (currentUserId: string | undefined): Promise<User | null> => {
  if (!currentUserId) return null;

  // Get IDs of users we've already swiped
  const { data: swipedUsers, error: swipedError } = await supabase
    .from('matches')
    .select('receiver_id')
    .eq('sender_id', currentUserId);

  if (swipedError) throw swipedError;
  const swipedIds = swipedUsers.map(u => u.receiver_id);
  const excludeIds = [...swipedIds, currentUserId];

  // Fetch one random user that's not in the exclude list.
  // This is a simplified approach. For true randomness at scale, a database function would be better.
  const { data: nextUser, error: nextUserError } = await supabase
    .from('users')
    .select('*')
    .not('id', 'in', `(${excludeIds.join(',')})`)
    .limit(1)
    .single();

  if (nextUserError) {
    if (nextUserError.code === 'PGRST116') { // No rows found
      return null;
    }
    throw nextUserError;
  }
  return nextUser;
};

export function TinderPage() {
  const { user } = useAuthStore();
  
  const { data: currentUser, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['next-tinder-user', user?.id],
    queryFn: () => fetchNextUser(user?.id),
    enabled: !!user,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  const handleSwipe = async (direction: 'like' | 'dislike') => {
    if (!currentUser || !user) return;

    if (direction === 'like') {
      await supabase.from('matches').insert({
        sender_id: user.id,
        receiver_id: currentUser.id,
        status: 'pending',
      });
    } else {
       await supabase.from('matches').insert({
        sender_id: user.id,
        receiver_id: currentUser.id,
        status: 'disliked',
      });
    }

    refetch(); // Fetch the next user
  };

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      handleSwipe('like');
    } else if (info.offset.x < -100) {
      handleSwipe('dislike');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader className="w-16 h-16 animate-spin text-primary-500" />
        </div>
      );
    }

    if (!currentUser) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <Heart className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Это все!</h2>
            <p className="text-gray-400 text-lg">Новые пользователи скоро появятся. Загляните позже!</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-gradient">
          Знакомства на событиях
        </h1>

        <div className="relative w-full h-[500px]">
          {isFetching ? (
             <div className="absolute inset-0 flex items-center justify-center">
               <Loader className="w-12 h-12 animate-spin text-primary-500" />
             </div>
          ) : (
            <motion.div
              key={currentUser.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
              style={{ x, rotate, opacity }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              className="absolute w-full h-full cursor-grab active:cursor-grabbing"
            >
              <div className="glass-strong rounded-3xl overflow-hidden h-full shadow-2xl">
                <div className="relative h-3/5">
                  {currentUser.photo_url ? (
                    <img src={currentUser.photo_url} alt={currentUser.first_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full gradient-primary opacity-30" />
                  )}
                  <div className="absolute inset-0 gradient-overlay" />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{currentUser.first_name} {currentUser.last_name}</h2>
                  {currentUser.username && <p className="text-primary-400 mb-3">@{currentUser.username}</p>}
                  {currentUser.bio && <p className="text-gray-300 mb-4 line-clamp-2">{currentUser.bio}</p>}
                  {currentUser.interests && currentUser.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {currentUser.interests.map((interest: string) => (
                        <span key={interest} className="px-3 py-1 glass rounded-full text-sm">{interest}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex justify-center gap-6 mt-8">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleSwipe('dislike')} className="p-6 glass-strong rounded-full shadow-xl hover:shadow-2xl transition-shadow">
            <X className="w-8 h-8 text-red-400" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleSwipe('like')} className="p-6 glass-strong rounded-full shadow-xl hover:shadow-2xl transition-shadow">
            <Heart className="w-8 h-8 text-green-400" />
          </motion.button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {renderContent()}
    </div>
  );
}
