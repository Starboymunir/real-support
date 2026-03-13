"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MovingItemProps {
  active: boolean;
  className?: string;
  layoutId?: string;
}

export function MovingItem(props: MovingItemProps) {
  let { active } = props;
  return active ? (
    <motion.div
      layout
      layoutId={props.layoutId ?? "MovingItem"}
      transition={{
        type: "spring",
        duration: 0.2,
        stiffness: 500,
        damping: 30,
      }}
      className={cn(
        "h-[1px] rounded-full bg-primary inline-block z-10 absolute bottom-0  left-0 right-0 mx-3",
        props.className,
      )}
    />
  ) : (
    <span></span>
  );
}
