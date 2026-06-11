'use client';

import { cn } from '@/lib/utils';
import { Undo2 } from 'lucide-react';
import { useEffect, useState, type FC, type ReactNode } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import useMeasure from 'react-use-measure';

export interface TimedUndoActionProps {
  initialSeconds?: number;
  deleteLabel?: string;
  undoLabel?: string;
  icon?: ReactNode;
  onConfirm?: () => void;
  compact?: boolean;
  /** Controlled mode: external isDeleting state */
  isDeleting?: boolean;
  /** Controlled mode: external countdown value */
  countDown?: number;
  /** Controlled mode: called when user clicks to toggle */
  onToggle?: () => void;
}

export const TimedUndoAction: FC<TimedUndoActionProps> = ({
  initialSeconds = 10,
  deleteLabel = 'Delete Account',
  undoLabel = 'Cancel Delete',
  icon,
  onConfirm,
  compact = false,
  isDeleting: controlledIsDeleting,
  countDown: controlledCountDown,
  onToggle,
}) => {
  const isControlled = controlledIsDeleting !== undefined;

  const [uncontrolledIsDeleting, setUncontrolledIsDeleting] = useState(false);
  const [uncontrolledCountDown, setUncontrolledCountDown] = useState(initialSeconds);
  const [ref, bounds] = useMeasure({ offsetSize: true });

  const isDeleting = isControlled ? controlledIsDeleting! : uncontrolledIsDeleting;
  const countDown = isControlled ? (controlledCountDown ?? initialSeconds) : uncontrolledCountDown;

  const handleClick = () => {
    if (isControlled) {
      onToggle?.();
    } else {
      setUncontrolledIsDeleting((prev) => {
        const next = !prev;
        if (next) setUncontrolledCountDown(initialSeconds);
        return next;
      });
    }
  };

  // Uncontrolled: tick the countdown
  useEffect(() => {
    if (isControlled || !uncontrolledIsDeleting) return;
    const id = setInterval(() => {
      setUncontrolledCountDown((p) => Math.max(0, p - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isControlled, uncontrolledIsDeleting]);

  // Uncontrolled: fire onConfirm when countdown hits 0
  useEffect(() => {
    if (isControlled || !uncontrolledIsDeleting || uncontrolledCountDown > 0) return;
    setUncontrolledIsDeleting(false);
    setUncontrolledCountDown(initialSeconds);
    onConfirm?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled, uncontrolledIsDeleting, uncontrolledCountDown]);

  return (
    <div className="flex items-center font-sans">
      <div className="flex flex-col items-center justify-center will-change-transform">
        <MotionConfig
          transition={{
            type: 'spring',
            stiffness: 250,
            damping: 22,
          }}
        >
          <motion.div
            className={cn(
              'relative flex cursor-pointer items-center justify-start overflow-hidden rounded-full border border-red-500 bg-transparent transition-colors duration-300 hover:bg-red-500/5 dark:border-red-400 dark:hover:bg-red-400/5',
              compact && 'w-36 h-9',
              isDeleting && 'bg-red-500/10 border-red-500/20 hover:bg-red-500/10 dark:bg-red-500/20 dark:border-red-500/10 dark:hover:bg-red-500/20',
            )}
            animate={compact ? undefined : {
              width: bounds.width > 0 ? bounds.width : 'auto',
            }}
            onClick={handleClick}
          >
            <div
              className={cn(
                'flex items-center gap-2',
                compact ? 'w-full h-full px-1.5' : 'px-6 py-3',
                compact ? (isDeleting ? 'justify-between' : 'justify-center') : 'justify-center',
              )}
              ref={ref}
            >
              <AnimatePresence mode="popLayout">
                {isDeleting && (
                  <motion.div
                    className={cn(
                      "rounded-full bg-red-500 flex items-center justify-center shrink-0",
                      compact ? "w-6 h-6" : "p-2"
                    )}
                    initial={{ opacity: 0, filter: 'blur(2px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(2px)' }}
                  >
                    {icon ?? <Undo2 className={cn(compact ? "size-3.5" : "size-5", "text-white")} />}
                  </motion.div>
                )}
              </AnimatePresence>
 
              <div className="flex items-center justify-center gap-2">
                <AnimatedText
                  text={isDeleting ? undoLabel : deleteLabel}
                  className={cn(
                    'z-10 font-medium',
                    compact ? 'text-sm' : 'text-lg',
                    'text-red-500 dark:text-red-400',
                  )}
                />
              </div>
 
              <AnimatePresence mode="popLayout">
                {isDeleting && (
                  <motion.div
                    className={cn(
                      "flex items-center justify-center rounded-full bg-red-500 text-neutral-50 tabular-nums shrink-0",
                      compact ? "w-6 h-6 text-xs" : "px-3 py-1 text-neutral-50"
                    )}
                    initial={{ opacity: 0, filter: 'blur(2px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(2px)' }}
                  >
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={countDown}
                        className={compact ? 'text-[11px]' : 'text-lg'}
                        initial={{ opacity: 0, y: -20, filter: 'blur(2px)', scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                        exit={{ opacity: 0, y: 20, filter: 'blur(2px)', scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 20, mass: 1 }}
                      >
                        {countDown}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </MotionConfig>
      </div>
    </div>
  );
};

function AnimatedText({
  text,
  className,
  delayStep = 0.014,
}: {
  text: string;
  className?: string;
  delayStep?: number;
}) {
  const chars = text.split('');

  return (
    <span className={className} style={{ display: 'inline-flex' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={text} style={{ display: 'inline-flex ', willChange: 'transform' }}>
          {chars.map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: 10, opacity: 0, scale: 0.5, filter: 'blur(2px)' }}
              animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ y: -10, opacity: 0, scale: 0.5, filter: 'blur(2px)' }}
              transition={{ type: 'spring', stiffness: 240, damping: 16, mass: 1.2, delay: i * delayStep }}
              style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : undefined }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default TimedUndoAction;
