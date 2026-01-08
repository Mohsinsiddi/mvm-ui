import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { box: 'w-8 h-8', text: 'text-lg', letter: 'text-sm' },
    md: { box: 'w-10 h-10', text: 'text-xl', letter: 'text-base' },
    lg: { box: 'w-14 h-14', text: 'text-2xl', letter: 'text-xl' },
  }

  return (
    <Link to="/" className="flex items-center gap-3 group">
      <motion.div
        className={`${sizes[size].box} rounded-xl bg-gradient-to-br from-cyber via-neon to-glow flex items-center justify-center relative overflow-hidden`}
        animate={{
          boxShadow: [
            '0 0 20px rgba(123, 44, 191, 0.5)',
            '0 0 40px rgba(157, 78, 221, 0.6)',
            '0 0 20px rgba(123, 44, 191, 0.5)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay: 1,
          }}
        />
        <span className={`${sizes[size].letter} font-bold text-white relative z-10`}>M</span>
      </motion.div>
      
      {showText && (
        <div className="flex flex-col">
          <motion.span 
            className={`${sizes[size].text} font-bold glow-text`}
            whileHover={{ scale: 1.02 }}
          >
            MVM
          </motion.span>
          <span className="text-xs text-mist -mt-1 hidden sm:block">Explorer</span>
        </div>
      )}
    </Link>
  )
}
