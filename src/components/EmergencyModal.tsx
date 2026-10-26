import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleX, Phone, MapPin, Clock, Navigation, Shield } from "lucide-react";
import { toast } from "sonner";

interface EmergencyModalProps {
  open: boolean;
  onClose: () => void;
}

const COUNTDOWN_SECONDS = 10;
const EMERGENCY_NUMBER = "112";

export function EmergencyModal({ open, onClose }: EmergencyModalProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isCalling, setIsCalling] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset modal state when opened
  useEffect(() => {
    if (open) {
      setCountdown(COUNTDOWN_SECONDS);
      setIsCalling(false);
      setIsCancelled(false);
    }
  }, [open]);

  // Countdown logic
  useEffect(() => {
    if (!open || isCalling || isCancelled) return;

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          handleEmergencyCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, isCalling, isCancelled]);

  const handleEmergencyCall = useCallback(() => {
    setIsCalling(true);
    window.location.href = `tel:${EMERGENCY_NUMBER}`;
    toast.error(`Open phone dialler: ${EMERGENCY_NUMBER}`, {
      description: "Complete the call in your phone app. FloodGuard cannot confirm that a call connected.",
      duration: 5000,
    });
  }, []);

  const handleCancel = useCallback(() => {
    setIsCancelled(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    toast("Emergency call cancelled", {
      icon: "✓",
      duration: 3000,
    });
    onClose();
  }, [onClose]);

  const handleQuickCall = useCallback(() => {
    handleEmergencyCall();
  }, [handleEmergencyCall]);

  const handleSendLocation = useCallback(() => {
    toast("Location sharing initiated", {
      description: "Automatic location sharing is not connected. Tell the operator your location during the call.",
      icon: "📍",
      duration: 4000,
    });
  }, []);

  // Progress percentage
  const progress = ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={isCalling ? undefined : handleCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Emergency SOS"
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
              {/* Red alert bar */}
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#D90429] via-[#ef233c] to-[#D90429]" />

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D90429]/10">
                    <TriangleAlertIcon className="h-5 w-5 text-[#D90429]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                      Emergency SOS
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Use your phone to contact emergency services
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  aria-label="Close emergency modal"
                >
                  <CircleX className="h-5 w-5" />
                </button>
              </div>

              {/* Countdown Section */}
              <div className="px-6 py-6">
                {!isCalling && !isCancelled ? (
                  <>
                    <div className="mb-4 text-center">
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Opening emergency dialler in
                      </p>
                      <motion.p
                        key={countdown}
                        initial={{ scale: 1.3, opacity: 0.6 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl font-black text-[#D90429]"
                      >
                        {countdown}
                      </motion.p>
                      <p className="text-sm text-zinc-400 dark:text-zinc-500">
                        seconds
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <motion.div
                        className="h-full rounded-full bg-[#D90429]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "linear" }}
                      />
                    </div>

                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleQuickCall}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#D90429] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#ef233c] active:scale-[0.98]"
                      >
                        <Phone className="h-4 w-4" />
                        Call Now
                      </button>
                      <button
                        onClick={handleSendLocation}
                        className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-100 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        <MapPin className="h-4 w-4" />
                        Share Location
                      </button>
                    </div>

                    {/* Cancel button */}
                    <button
                      onClick={handleCancel}
                      className="mt-4 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-500 transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      Cancel Emergency
                    </button>
                  </>
                ) : isCalling ? (
                  <>
                    {/* Calling state */}
                    <div className="py-4 text-center">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#D90429]/10"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Phone className="h-10 w-10 text-[#D90429]" />
                        </motion.div>
                      </motion.div>
                      <p className="text-lg font-bold text-zinc-900 dark:text-white">
                        Dial {EMERGENCY_NUMBER} on your phone
                      </p>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Complete the call in your phone app. No dispatch is confirmed.
                      </p>
                    </div>

                    {/* Quick info cards */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        onClick={handleSendLocation}
                        className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        <Navigation className="h-4 w-4" />
                        Share Location
                      </button>
                      <button
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-500 transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      >
                        <CircleX className="h-4 w-4" />
                        Dismiss
                      </button>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-2 border-t border-zinc-100 px-6 py-3 dark:border-zinc-800">
                <Shield className="h-3.5 w-3.5 text-zinc-400" />
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Your location is shared only with emergency services
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TriangleAlertIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21.73 18a2 2 0 0 0-1.732-3H3.988a2 2 0 0 0-1.732 3l7.022 12a2 2 0 0 0 3.464 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}