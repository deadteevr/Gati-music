import { collection, query, where, getDocs, doc, setDoc, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Generates a unique referral code based on the artist's name
 */
export const generateReferralCode = async (name: string): Promise<string> => {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
  const prefix = (cleanName ? cleanName.slice(0, 4) : 'GATI').toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  const code = `${prefix}${random}`;
  
  // Check if exists
  const q = query(collection(db, 'users'), where('referralCode', '==', code));
  const snap = await getDocs(q);
  
  if (!snap.empty) {
    return generateReferralCode(name);
  }
  
  // Also check public registry
  const qPub = query(collection(db, 'referralCodes'), where('code', '==', code));
  const snapPub = await getDocs(qPub);
  if (!snapPub.empty) {
    return generateReferralCode(name);
  }
  
  return code;
};

/**
 * Saves a referral code to both the user doc and the public registry
 */
export const saveReferralCode = async (uid: string, code: string) => {
  await updateDoc(doc(db, 'users', uid), { referralCode: code });
  // Public registry for non-auth lookups
  await setDoc(doc(db, 'referralCodes', code), { 
    uid, 
    code,
    createdAt: serverTimestamp() 
  });
};

/**
 * Links a new user to a referral if they used a code during the request
 */
export const linkReferralIfApplicable = async (newUserUid: string, email: string, referralCode?: string) => {
  if (!referralCode) return;

  // Find the referrer using the public registry
  const q = query(collection(db, 'referralCodes'), where('code', '==', referralCode.toUpperCase()));
  const snap = await getDocs(q);

  if (snap.empty) return;

  const referrerData = snap.docs[0].data();
  const referrerUid = referrerData.uid;

  // Create the referral document
  await addDoc(collection(db, 'referrals'), {
    referrerUid,
    refereeUid: newUserUid,
    refereeEmail: email,
    status: 'pending',
    hasUploaded: false,
    hasPaid: false,
    createdAt: serverTimestamp()
  });

  // Notify referrer
  await addDoc(collection(db, 'notifications'), {
    uid: referrerUid,
    message: `New Referral: An artist you invited (${email}) has joined Gati! Your reward will unlock once they release a song and upgrade their plan.`,
    read: false,
    createdAt: serverTimestamp()
  });
};

/**
 * Checks for referral milestones and grants rewards
 */
export const updateReferralProgress = async (refereeUid: string, type: 'upload' | 'payment') => {
  const q = query(collection(db, 'referrals'), where('refereeUid', '==', refereeUid), where('status', '==', 'pending'));
  const snap = await getDocs(q);

  if (snap.empty) return;

  const referralDoc = snap.docs[0];
  const referralData = referralDoc.data();
  const referrerUid = referralData.referrerUid;

  const update: any = {};
  if (type === 'upload') update.hasUploaded = true;
  if (type === 'payment') update.hasPaid = true;

  await updateDoc(doc(db, 'referrals', referralDoc.id), update);

  // Re-fetch to check if both are true
  const updatedData = { ...referralData, ...update };
  if (updatedData.hasUploaded && updatedData.hasPaid) {
    // Mark as successful
    await updateDoc(doc(db, 'referrals', referralDoc.id), { status: 'successful' });

    // Notification for successful referral
    await addDoc(collection(db, 'notifications'), {
      uid: referrerUid,
      type: 'referral_success',
      message: `Referral Milestone: Your invitee (${updatedData.refereeEmail}) has completed their first release! You've earned a Free Song Release reward.`,
      read: false,
      createdAt: serverTimestamp()
    });

    // EVERY SUCCESSFUL REFERRAL GRANTS A FREE SONG
    await addDoc(collection(db, 'rewards'), {
      uid: referrerUid,
      type: 'free_song',
      status: 'active',
      referralId: referralDoc.id,
      earnedAt: serverTimestamp()
    });

    // Check successful count for referrer for additional milestones
    const qCount = query(collection(db, 'referrals'), where('referrerUid', '==', referrerUid), where('status', '==', 'successful'));
    const countSnap = await getDocs(qCount);
    const count = countSnap.size;

    // Additional Milestone for 5 Referrals
    if (count === 5) {
      await addDoc(collection(db, 'rewards'), {
        uid: referrerUid,
        type: 'free_plan_month',
        status: 'active',
        earnedAt: serverTimestamp()
      });
      await addDoc(collection(db, 'notifications'), {
        uid: referrerUid,
        type: 'milestone_unlocked',
        message: `Legendary Status! You've reached 5 successful referrals and unlocked 1 Month of Free Unlimited Distribution!`,
        read: false,
        createdAt: serverTimestamp()
      });
    }
  }
};

/**
 * Consumes a reward (marks it as used)
 */
export const consumeReward = async (rewardId: string) => {
  await updateDoc(doc(db, 'rewards', rewardId), {
    status: 'used',
    usedAt: serverTimestamp()
  });
};
