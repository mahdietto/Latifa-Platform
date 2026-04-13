import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";

const GameLoadingScreen = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-lg"
  >
    <motion.div
      animate={{
        rotate: [0, -15, 15, -15, 0],
        scale: [1, 1.2, 1, 1.2, 1],
      }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <Gamepad2 className="w-20 h-20 text-primary" />
    </motion.div>
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-6 font-display text-xl font-bold text-foreground"
    >
      Chargement du jeu...
    </motion.p>
    <motion.div
      className="mt-4 w-48 h-1.5 bg-muted rounded-full overflow-hidden"
    >
      <motion.div
        className="h-full bg-primary rounded-full"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
    </motion.div>
  </motion.div>
);

export default GameLoadingScreen;
