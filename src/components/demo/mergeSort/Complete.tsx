import { FC } from "react";
import { useDemoStore } from "../../../lib/store/demoStore";
import { BodyLarge, H1 } from "../../ui/Typography";
import { clsx } from "clsx";
import { ArrowIcon } from "../Introduction";
import { motion } from "framer-motion";
import { MotionDiv, containerAnimation, itemAnimation } from "../../ui/Motion";

export const Complete: FC = () => {
  const { send } = useDemoStore();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <MotionDiv
        className="w-full max-w-4xl mx-auto p-8 md:p-12 lg:p-16"
        {...containerAnimation}
      >
        <MotionDiv
          {...itemAnimation}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <H1 className="text-8xl md:text-9xl lg:text-[10rem] mb-4 font-serif tracking-tight">
            Thanks!
          </H1>
        </MotionDiv>

        <MotionDiv
          {...itemAnimation}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <BodyLarge className="max-w-3xl mb-16">
            <br />
            Next, we&apos;ll take you to a demo of an LLM{" "}
            <em>taught to teach</em> mergeSort using a constructivist approach.
            <br />
            <br />
            We would prefer not to reveal how! Your interpretation of
            &quot;how&quot; is more interesting.{" "}
          </BodyLarge>
        </MotionDiv>

        <MotionDiv
          className="mt-8 flex justify-end"
          {...itemAnimation}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.button
            onClick={() => send({ type: "CONTINUE" })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={clsx(
              "px-10 py-5 rounded-lg",
              "font-sans font-medium text-xl",
              "bg-primary text-primary-foreground",
              "transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "flex items-center"
            )}
          >
            Continue to Demo
            <ArrowIcon />
          </motion.button>
        </MotionDiv>
      </MotionDiv>
    </div>
  );
};
