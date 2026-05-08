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
const RefundPage = lazy(() => import('./pages/RefundPage'));
const SmartLink = lazy(() => import('./pages/artist/SmartLink'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const RequestAccount = lazy(() => import('./pages/RequestAccount'));
const LabelPanel = lazy(() => import('./pages/LabelPanel'));

import { ErrorProvider } from './components/ErrorProvider';
import { handleFirestoreError, OperationType } from './firebase';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalSettings, setGlobalSettings] = useState<any>(null);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        setGlobalSettings(snap.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global', false);
    });

    return () => unsubSettings();
  }, []);

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

  const isInternalUser = role === 'admin';
  const isGlobalMaintenance = globalSettings?.maintenanceMode && 
     (!globalSettings?.maintenancePages || globalSettings?.maintenancePages.length === 0);
  
  const isDashboardMaintenance = globalSettings?.maintenanceMode && 
     globalSettings?.maintenancePages?.includes('Artist-Panel');

  return (
    <Router>
      <ErrorProvider>
        <Suspense fallback={<PremiumLoader />}>
          {isGlobalMaintenance && !isInternalUser ? (
             <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin/*" element={user && role === 'admin' ? <AdminPanel user={user} userData={userData} /> : <Navigate to="/login" replace />} />
                <Route path="*" element={<Maintenance 
                  message={globalSettings.maintenanceMessage} 
                  downtime={globalSettings.maintenanceDowntime} 
                  supportEmail={globalSettings.supportEmail} 
                />} />
             </Routes>
          ) : (
            <Routes>
              <Route path="/" element={globalSettings?.maintenanceMode && globalSettings?.maintenancePages?.includes('Landing') && !isInternalUser ? 
                <Maintenance 
                  message={globalSettings.maintenanceMessage} 
                  downtime={globalSettings.maintenanceDowntime} 
                  supportEmail={globalSettings.supportEmail} 
                /> : <LandingPage />} />
              <Route path="/login" element={user ? <Navigate to={role === 'admin' ? "/admin" : (['label_owner', 'label_manager'].includes(role!) ? "/label" : "/dashboard")} replace /> : <LoginPage />} />
              <Route path="/dashboard/*" element={user && role !== 'admin' ? 
                (isDashboardMaintenance ? 
                  <Maintenance 
                    message={globalSettings.maintenanceMessage} 
                    downtime={globalSettings.maintenanceDowntime} 
                    supportEmail={globalSettings.supportEmail} 
                  /> : <Dashboard user={user} userData={userData} globalSettings={globalSettings} />)
                : <Navigate to="/login" replace />} />
              <Route path="/label/*" element={user && ['label_owner', 'label_manager', 'admin'].includes(role!) ? 
                <LabelPanel user={user} userData={userData} globalSettings={globalSettings} /> : 
                <Navigate to="/login" replace />} />
              <Route path="/admin/*" element={user && role === 'admin' ? <AdminPanel user={user} userData={userData} /> : <Navigate to="/login" replace />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPage />} />
              <Route path="/refund-policy" element={<RefundPage />} />
              <Route path="/release/:id" element={<SmartLink />} />
              <Route path="/request-account" element={<RequestAccount />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </Suspense>
      </ErrorProvider>
    </Router>
  );
}
