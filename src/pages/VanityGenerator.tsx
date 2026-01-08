import { motion } from 'framer-motion'

export default function VanityGenerator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-ghost">VanityGenerator</h1>
      <div className="card">
        <p className="text-mist">This page is under construction.</p>
      </div>
    </motion.div>
  )
}
