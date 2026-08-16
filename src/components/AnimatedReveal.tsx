import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

interface AnimatedRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
}

export const AnimatedReveal: React.FC<AnimatedRevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.6,
}) => {
  const getOffset = () => {
    switch (direction) {
      case 'up':
        return { y: 28, x: 0 };
      case 'down':
        return { y: -28, x: 0 };
      case 'left':
        return { y: 16, x: 0 }; // Evita deslocamento horizontal que quebra mobile
      case 'right':
        return { y: 16, x: 0 }; // Evita deslocamento horizontal que quebra mobile
      default:
        return { x: 0, y: 0 };
    }
  };

  const offset = getOffset();

  return (
    <motion.div
      initial={{
        opacity: 0,
        filter: 'blur(4px)',
        scale: 0.98,
        ...offset,
      }}
      whileInView={{
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        x: 0,
        y: 0,
      }}
      viewport={{
        once: false,
        amount: 0.1,
        margin: "0px 0px -40px 0px"
      }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Curva de aceleração estilo Apple / Linear
      }}
      className={`w-full max-w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

