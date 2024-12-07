import { FC } from "react";
import { MilestonesPanel } from "./MilestonesPanel";
import { ChatArea } from "./ChatArea";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const MergeSortLayout: FC = () => {
  return (
    <motion.div
      className="flex h-screen"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <AnimatePresence mode="wait">
        <motion.aside
          className="w-[320px] border-r border-gray-200 bg-gray-50 p-4"
          variants={contentVariants}
          transition={{ delay: 0.2 }}
        >
          <MilestonesPanel />
        </motion.aside>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.main
          className="flex-1 overflow-hidden"
          variants={contentVariants}
          transition={{ delay: 0.4 }}
        >
          <ChatArea />
        </motion.main>
      </AnimatePresence>
    </motion.div>
  );
};
