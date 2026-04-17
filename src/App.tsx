import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let roleUnsub: () => void;

    const authUnsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // SUPER ADMIN OVERRIDE: ALWAYS FORCE ADMIN ROUTING FOR OWNER
        if (currentUser.email === 'deadteevr@gmail.com') {
           setRole('admin');
           setLoading(false);
           
           // Silently fix the DB in the background so it matches
           setDoc(doc(db, 'users', currentUser.uid), { 
             role: 'admin',
             email: currentUser.email,
             name: currentUser.displayName || 'Ghewar'
           }, { merge: true }).catch(console.error);
           
           return;
        }

        // Standard user flow
        roleUnsub = onSnapshot(doc(db, 'users', currentUser.uid), (userDoc) => {
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else {
            setRole('artist'); // Default
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user role", error);
          setLoading(false);
        });
      } else {
        if (roleUnsub) roleUnsub();
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (roleUnsub) roleUnsub();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-[#ccff00] flex items-center justify-center font-display text-2xl font-bold">
        GATI IS LOADING...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? <Navigate to={role === 'admin' ? "/admin" : "/dashboard"} replace /> : <LoginPage />} />
        <Route path="/dashboard/*" element={user && role !== 'admin' ? <Dashboard user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/admin/*" element={user && role === 'admin' ? <AdminPanel user={user} /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
