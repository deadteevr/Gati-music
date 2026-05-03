import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, RotateCcw, ArrowLeft, X } from 'lucide-react';

interface ErrorState {
  isOpen: boolean;
  message: string;
  onRetry?: () => void;
  showGoBack?: boolean;
}

interface ErrorContextType {
  showError: (message: string, onRetry?: () => void, showGoBack?: boolean) => void;
  hideError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function useGlobalError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within an ErrorProvider');
  }
  return context;
}

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [error, setError] = useState<ErrorState>({ isOpen: false, message: '' });
  const navigate = useNavigate();

  const showError = useCallback((message: string, onRetry?: () => void, showGoBack: boolean = true) => {
    setError({ isOpen: true, message, onRetry, showGoBack });
  }, []);

  // Handle global errors
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      showError(event.message || "An unexpected error occurred.");
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      let message = "An unexpected error occurred.";
      const reason = event.reason;
      
      if (reason instanceof Error) {
        message = reason.message;
        // Check if it's a Firestore error JSON string
        if (message.startsWith('{')) {
          try {
            const parsed = JSON.parse(message);
            message = parsed.userFriendlyMessage || parsed.error;
          } catch {
            // Not JSON or parsing failed
          }
        }
      } else if (typeof reason === 'string') {
        message = reason;
      }
      
      showError(message);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [showError]);

  const hideError = useCallback(() => {
    setError(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideError();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [hideError]);

  return (
    <ErrorContext.Provider value={{ showError, hideError }}>
      {children}
      <AnimatePresence>
        {error.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={hideError}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              id="error-overlay"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#111] border border-[#333] p-8 shadow-2xl"
              id="global-error-modal"
            >
              <button 
                onClick={hideError}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                id="close-error-modal"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                  <AlertCircle className="text-red-500" size={32} />
                </div>
                
                <h2 className="text-2xl font-display uppercase tracking-tighter text-white mb-2">
                  Something went wrong
                </h2>
                
                <p className="text-gray-400 font-sans mb-8 leading-relaxed">
                  {error.message}
                </p>

                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={() => {
                      if (error.onRetry) error.onRetry();
                      hideError();
                    }}
                    className="w-full bg-[#ccff00] text-black font-display font-bold py-4 uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
                    id="error-retry-btn"
                  >
                    <RotateCcw size={18} />
                    Try Again
                  </button>
                  
                  {error.showGoBack && (
                    <button
                      onClick={() => {
                        navigate(-1);
                        hideError();
                      }}
                      className="w-full bg-transparent border border-[#333] text-white font-display font-bold py-4 uppercase tracking-widest hover:bg-[#222] transition-all flex items-center justify-center gap-2"
                      id="error-back-btn"
                    >
                      <ArrowLeft size={18} />
                      Go Back
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ErrorContext.Provider>
  );
};
