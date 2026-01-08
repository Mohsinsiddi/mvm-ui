import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  color?: 'cyber' | 'electric' | 'success' | 'warning'
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  color = 'cyber' 
}: StatsCardProps) {
  const colors = {
    cyber: 'from-cyber to-neon',
    electric: 'from-electric to-ice',
    success: 'from-success to-emerald-400',
    warning: 'from-warning to-amber-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-mist text-sm">{title}</p>
          <motion.p 
            key={value}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold mt-1 text-ghost"
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className="text-xs text-mist mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colors[color]} opacity-80 group-hover:opacity-100 transition-opacity`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  )
}
