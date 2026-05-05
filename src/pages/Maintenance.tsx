import { Hammer, Clock, Mail } from 'lucide-react';
import { motion } from 'motion/react';

interface MaintenanceProps {
  message?: string;
  downtime?: string;
  supportEmail?: string;
}

export default function Maintenance({ 
  message = "System is currently under scheduled maintenance.", 
  downtime = "Soon", 
  supportEmail = "support@gatimusic.com" 
}: MaintenanceProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Hammer size={80} className="text-[#ccff00] animate-bounce" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-display uppercase font-bold px-2 py-0.5 rounded-full">
              Live
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-display uppercase tracking-tighter text-white mb-4">
          Under Maintenance
        </h1>
        
        <p className="text-gray-400 font-sans text-lg mb-8 leading-relaxed">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-[#111] border border-[#333] p-4">
            <div className="flex items-center justify-center gap-2 text-[#ccff00] mb-1">
              <Clock size={16} />
              <span className="text-[10px] font-display uppercase tracking-widest font-bold">Estimated</span>
            </div>
            <div className="text-white text-xl font-display font-medium">{downtime}</div>
          </div>
          <div className="bg-[#111] border border-[#333] p-4 text-left">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Mail size={16} />
              <span className="text-[10px] font-display uppercase tracking-widest font-bold">Inquiries</span>
            </div>
            <div className="text-white text-[10px] font-mono truncate">{supportEmail}</div>
          </div>
        </div>

        <p className="text-[10px] font-display uppercase tracking-widest text-gray-600">
          We apologize for the inconvenience. Internal systems remain operational for admins.
        </p>
      </motion.div>
    </div>
  );
}
