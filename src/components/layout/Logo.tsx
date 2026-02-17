import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { box: 'w-8 h-8', text: 'text-lg', sub: 'text-[9px]', letter: 'text-sm', stroke: 2 },
    md: { box: 'w-10 h-10', text: 'text-xl', sub: 'text-[10px]', letter: 'text-base', stroke: 2.5 },
    lg: { box: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs', letter: 'text-xl', stroke: 3 },
  }

  const s = sizes[size]

  return (
    <Link to="/" className="flex items-center gap-3 group">
      <motion.div
        className={`${s.box} rounded-xl bg-gradient-to-br from-[#0A0118] to-[#120228] border border-cyber/30 flex items-center justify-center relative overflow-hidden`}
        animate={{
          boxShadow: [
            '0 0 15px rgba(123, 44, 191, 0.4)',
            '0 0 30px rgba(157, 78, 221, 0.5)',
            '0 0 15px rgba(123, 44, 191, 0.4)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Geometric M as SVG */}
        <svg viewBox="0 0 100 100" className="w-[65%] h-[65%] relative z-10">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7B2CBF"/>
              <stop offset="50%" stopColor="#9D4EDD"/>
              <stop offset="100%" stopColor="#E040FB"/>
            </linearGradient>
            <linearGradient id="logoAccent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#E040FB" stopOpacity="0.6"/>
            </linearGradient>
          </defs>
          <polyline points="22,72 22,28 50,42 78,28 78,72"
            fill="none" stroke="url(#logoGrad)" strokeWidth={s.stroke * 2.5} strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="50" y1="42" x2="50" y2="72"
            stroke="url(#logoAccent)" strokeWidth={s.stroke * 1.5} strokeLinecap="round"/>
          <circle cx="22" cy="72" r="2.5" fill="#00D4FF" opacity="0.9"/>
          <circle cx="78" cy="72" r="2.5" fill="#E040FB" opacity="0.9"/>
          <circle cx="50" cy="42" r="2.5" fill="white" opacity="0.9"/>
        </svg>
      </motion.div>

      {showText && (
        <div className="flex flex-col">
          <motion.span
            className={`${s.text} font-bold glow-text tracking-wide`}
            whileHover={{ scale: 1.02 }}
          >
            Mohsin
          </motion.span>
          <span className={`${s.sub} text-mist -mt-1 tracking-widest uppercase`}>Explorer</span>
        </div>
      )}
    </Link>
  )
}
