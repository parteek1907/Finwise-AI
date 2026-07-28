import { db } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { User } from '../store/useAppStore';

export interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  avatar: string;
  rank?: number;
  isUser?: boolean; // Set dynamically on client
}

/**
 * Pushes the local user's XP and profile info to the global Firestore leaderboard
 */
export const syncUserXp = async (user: User) => {
  // Only sync users with a real Firebase Auth UID
  if (!user.id || user.id.startsWith('user_')) return;

  try {
    const userRef = doc(db, 'users', user.id);
    
    await setDoc(userRef, {
      name: user.name || 'Anonymous Learner',
      xp: user.xp,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Anonymous')}&background=19533B&color=fff`,
      lastActive: new Date().toISOString()
    }, { merge: true });
    
  } catch (error) {
    console.error('Failed to sync user XP to leaderboard:', error);
  }
};

/**
 * Subscribes to the top 50 users on the global leaderboard.
 * Returns an unsubscribe function.
 */
export const subscribeToLeaderboard = (onUpdate: (users: LeaderboardUser[]) => void) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('xp', 'desc'), limit(50));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const leaderboard: LeaderboardUser[] = [];
    
    snapshot.forEach((doc) => {
      // Filter out legacy local/anonymous IDs. We only want real authenticated Firebase UIDs.
      if (doc.id.startsWith('user_')) return;

      const data = doc.data();
      leaderboard.push({
        id: doc.id,
        name: data.name,
        xp: data.xp || 0,
        avatar: data.avatar,
      });
    });

    // Assign ranks based on sorted order from Firebase
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    onUpdate(rankedLeaderboard);
  }, (error) => {
    console.error('Error listening to leaderboard:', error);
  });

  return unsubscribe;
};
