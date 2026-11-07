import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { EmergencyModal } from "./EmergencyModal";

export function EmergencySOSButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleOpen = useCallback(() => {
    setIsPressed(true);
    setIsModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
    setIsPressed(false);
  }, []);

  return (
    <>
      {/* Hero Section SOS */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D90429] via-[#ef233c] to-[#D90429] opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15),transparent_70%)]" />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[70dvh] px-6 py-20 text-center">
          {/* Warning badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm"
          >
            <TriangleAlert className="h-4 w-4" />
            <span>Emergency Response</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="mb-3 text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Need Help Now?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="mb-8 max-w-md text-lg text-white/80"
          >
            Open your phone dialler to contact emergency services. FloodGuard cannot confirm a connected call or dispatch.
          </motion.p>

          {/* SOS Button - Hero */}
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.45, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="group relative flex h-40 w-40 flex-col items-center justify-center rounded-full
              bg-white font-black text-3xl tracking-widest text-[#D90429]
              shadow-[0_0_0_0_rgba(255,255,255,0.7)]
              transition-all duration-300
              hover:shadow-[0_0_0_8px_rgba(255,255,255,0.3)]
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
            aria-label="Press for emergency help"
          >
            {/* Pulsing ring */}
            <motion.span
              className="absolute inset-0 rounded-full border-4 border-white/60"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
            <motion.span
              className="absolute inset-0 rounded-full border border-white/10"
              animate={{
                scale: [1, 1.45, 1],
                opacity: [0.2, 0, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
            <span className="relative z-10 mb-1">SOS</span>
            <span className="relative z-10 text-xs font-semibold tracking-normal text-[#D90429]/70">
              PRESS HERE
            </span>
          </motion.button>
        </div>
      </section>

      {/* Floating FAB - Bottom Right */}
      <AnimatePresence>
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 flex-col items-center justify-center
            rounded-full bg-[#D90429] text-white shadow-2xl
            ring-4 ring-[#D90429]/30
            hover:bg-[#ef233c]
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
          aria-label="Emergency SOS"
        >
          <TriangleAlert className="h-6 w-6" />
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-white/50"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.button>
      </AnimatePresence>

      {/* Emergency Modal */}
      <EmergencyModal open={isModalOpen} onClose={handleClose} />
    </>
  );
}