'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface HoverScaleProps {
  children: ReactNode
  scale?: number
  duration?: number
}

export function HoverScale({ children, scale = 1.05, duration = 0.2 }: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ duration }}
    >
      {children}
    </motion.div>
  )
}

interface HoverLiftProps {
  children: ReactNode
  lift?: number
  duration?: number
}

export function HoverLift({ children, lift = -5, duration = 0.3 }: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: lift }}
      transition={{ duration }}
    >
      {children}
    </motion.div>
  )
}

interface HoverGlowProps {
  children: ReactNode
  color?: string
  intensity?: number
}

export function HoverGlow({ children, color = '#22c55e', intensity = 0.3 }: HoverGlowProps) {
  return (
    <motion.div
      whileHover={{
        boxShadow: `0 0 30px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

interface PulseProps {
  children: ReactNode
  duration?: number
  scale?: number
}

export function Pulse({ children, duration = 2, scale = 1.1 }: PulseProps) {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}

interface FloatProps {
  children: ReactNode
  duration?: number
  distance?: number
}

export function Float({ children, duration = 3, distance = 20 }: FloatProps) {
  return (
    <motion.div
      animate={{
        y: [-distance, distance, -distance],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}

interface RotateProps {
  children: ReactNode
  duration?: number
  direction?: 'clockwise' | 'counterclockwise'
}

export function Rotate({ children, duration = 10, direction = 'clockwise' }: RotateProps) {
  return (
    <motion.div
      animate={{
        rotate: direction === 'clockwise' ? 360 : -360,
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {children}
    </motion.div>
  )
}

interface WiggleProps {
  children: ReactNode
  duration?: number
  angle?: number
}

export function Wiggle({ children, duration = 0.5, angle = 5 }: WiggleProps) {
  return (
    <motion.div
      animate={{
        rotate: [-angle, angle, -angle, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}

interface ShakeProps {
  children: ReactNode
  duration?: number
  distance?: number
}

export function Shake({ children, duration = 0.5, distance = 10 }: ShakeProps) {
  return (
    <motion.div
      animate={{
        x: [-distance, distance, -distance, distance, 0],
      }}
      transition={{
        duration,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}

interface BounceProps {
  children: ReactNode
  duration?: number
  height?: number
}

export function Bounce({ children, duration = 1, height = 20 }: BounceProps) {
  return (
    <motion.div
      animate={{
        y: [0, -height, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}

interface GlowProps {
  children: ReactNode
  color?: string
  intensity?: number
  duration?: number
}

export function Glow({ children, color = '#22c55e', intensity = 0.3, duration = 2 }: GlowProps) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 20px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
          `0 0 40px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
          `0 0 20px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
        ],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}

interface GradientShiftProps {
  children: ReactNode
  duration?: number
  colors?: string[]
}

export function GradientShift({ 
  children, 
  duration = 3, 
  colors = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b'] 
}: GradientShiftProps) {
  return (
    <motion.div
      animate={{
        background: [
          `linear-gradient(45deg, ${colors[0]}, ${colors[1]})`,
          `linear-gradient(45deg, ${colors[1]}, ${colors[2]})`,
          `linear-gradient(45deg, ${colors[2]}, ${colors[3]})`,
          `linear-gradient(45deg, ${colors[3]}, ${colors[0]})`,
        ],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {children}
    </motion.div>
  )
}

interface MorphingShapeProps {
  children: ReactNode
  duration?: number
  shapes?: string[]
}

export function MorphingShape({ 
  children, 
  duration = 2, 
  shapes = ['50%', '0%', '50%', '100%'] 
}: MorphingShapeProps) {
  return (
    <motion.div
      animate={{
        borderRadius: shapes,
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}

interface TypewriterProps {
  text: string
  speed?: number
  delay?: number
  className?: string
}

export function Typewriter({ text, speed = 100, delay = 0, className = '' }: TypewriterProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <motion.span
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: text.length * speed / 1000, ease: "linear" }}
        style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
      >
        {text}
      </motion.span>
    </motion.div>
  )
}

interface CounterProps {
  from: number
  to: number
  duration?: number
  delay?: number
  className?: string
}

export function Counter({ from, to, duration = 2, delay = 0, className = '' }: CounterProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <motion.span
        initial={{ value: from }}
        animate={{ value: to }}
        transition={{ duration, ease: "easeOut" }}
        style={{ display: 'inline-block' }}
      >
        {(value: number) => Math.round(value)}
      </motion.span>
    </motion.div>
  )
}

interface ParallaxProps {
  children: ReactNode
  offset?: number
  speed?: number
}

export function Parallax({ children, offset = 50, speed = 0.5 }: ParallaxProps) {
  return (
    <motion.div
      style={{
        y: offset * speed,
      }}
    >
      {children}
    </motion.div>
  )
}

interface MagneticProps {
  children: ReactNode
  strength?: number
}

export function Magnetic({ children, strength = 0.3 }: MagneticProps) {
  return (
    <motion.div
      whileHover={{
        scale: 1 + strength,
        transition: { duration: 0.3 }
      }}
      whileTap={{
        scale: 1 - strength,
        transition: { duration: 0.1 }
      }}
    >
      {children}
    </motion.div>
  )
}
