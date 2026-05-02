import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import PremiumLoader from './components/PremiumLoader';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const SmartLink = lazy(() => import('./pages/artist/SmartLink'));

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
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
            const data = userDoc.data();
            setUserData(data);
            setRole(data.role || 'artist');
          } else {
            setRole('artist'); // Default
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user role", error);
          setRole('artist');
          setLoading(false);
        });
      } else {
        if (roleUnsub) roleUnsub();
        setRole(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (roleUnsub) roleUnsub();
    };
  }, []);

  if (loading) {
    return <PremiumLoader />;
  }

  return (
    <Router>
      <Suspense fallback={<PremiumLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={user ? <Navigate to={role === 'admin' ? "/admin" : "/dashboard"} replace /> : <LoginPage />} />
          <Route path="/dashboard/*" element={user && role !== 'admin' ? <Dashboard user={user} userData={userData} /> : <Navigate to="/login" replace />} />
          <Route path="/admin/*" element={user && role === 'admin' ? <AdminPanel user={user} userData={userData} /> : <Navigate to="/login" replace />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPage />} />
          <Route path="/release/:id" element={<SmartLink />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
