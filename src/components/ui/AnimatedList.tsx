import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: {},
  visible: (staggerDelay: number) => ({
    transition: { staggerChildren: staggerDelay },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.15, ease: "easeOut" },
  },
};

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  /** Delay between each child's entrance in seconds. Default: 0.04 */
  staggerDelay?: number;
}

export function AnimatedList({
  children,
  className,
  staggerDelay = 0.04,
}: AnimatedListProps) {
  const content = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    return (
      <motion.div variants={itemVariants} key={child.key}>
        {child}
      </motion.div>
    );
  });

  return (
    <motion.div
      className={cn(className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={staggerDelay}
    >
      {content}
    </motion.div>
  );
}
