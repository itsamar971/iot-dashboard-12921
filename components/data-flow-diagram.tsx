"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export default function DataFlowDiagram() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true)
          setHasAnimated(true)
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [hasAnimated])

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border-safety-green/20 hover:border-safety-green">
      <h2 className="text-xl font-semibold font-manrope mb-4">Data Flow Diagram</h2>
      <p className="text-muted-foreground mb-6 font-space-grotesk">
        This diagram illustrates how sensor data flows through our system to calculate the AQI value.
      </p>

      <div ref={ref} className="relative h-[300px] w-full bg-muted/30 rounded-lg overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 800 300" className="absolute inset-0">
          {/* Nodes */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Sensors */}
            <rect x="50" y="120" width="120" height="60" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
            <text
              x="110"
              y="155"
              textAnchor="middle"
              fill="#334155"
              fontFamily="Manrope"
              fontSize="14"
              fontWeight="600"
            >
              Sensors
            </text>

            {/* Microcontroller */}
            <rect x="250" y="120" width="120" height="60" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
            <text
              x="310"
              y="155"
              textAnchor="middle"
              fill="#334155"
              fontFamily="Manrope"
              fontSize="14"
              fontWeight="600"
            >
              Microcontroller
            </text>

            {/* Cloud */}
            <rect x="450" y="120" width="120" height="60" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
            <text
              x="510"
              y="155"
              textAnchor="middle"
              fill="#334155"
              fontFamily="Manrope"
              fontSize="14"
              fontWeight="600"
            >
              Cloud
            </text>

            {/* ML Model */}
            <rect x="650" y="120" width="120" height="60" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
            <text
              x="710"
              y="155"
              textAnchor="middle"
              fill="#334155"
              fontFamily="Manrope"
              fontSize="14"
              fontWeight="600"
            >
              ML Model → AQI
            </text>
          </motion.g>

          {/* Connection Lines */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <line x1="170" y1="150" x2="250" y2="150" stroke="#94a3b8" strokeWidth="2" />
            <line x1="370" y1="150" x2="450" y2="150" stroke="#94a3b8" strokeWidth="2" />
            <line x1="570" y1="150" x2="650" y2="150" stroke="#94a3b8" strokeWidth="2" />
          </motion.g>

          {/* Animated Pulses */}
          {isVisible && (
            <>
              <motion.circle
                cx="0"
                cy="150"
                r="4"
                fill="#90EE90"
                initial={{ x: 170 }}
                animate={{ x: 250 }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  ease: "linear",
                  delay: 0.2,
                }}
              />
              <motion.circle
                cx="0"
                cy="150"
                r="4"
                fill="#90EE90"
                initial={{ x: 370 }}
                animate={{ x: 450 }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  ease: "linear",
                  delay: 0.7,
                }}
              />
              <motion.circle
                cx="0"
                cy="150"
                r="4"
                fill="#90EE90"
                initial={{ x: 570 }}
                animate={{ x: 650 }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  ease: "linear",
                  delay: 1.2,
                }}
              />
            </>
          )}
        </svg>
      </div>

      <div className="mt-6 text-sm text-muted-foreground font-space-grotesk">
        <p>The data flow process:</p>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Sensors collect raw gas concentration data</li>
          <li>Microcontroller processes and normalizes readings</li>
          <li>Data is sent to the cloud for storage and analysis</li>
          <li>ML model applies weighting factors to calculate final AQI</li>
        </ol>
      </div>
    </Card>
  )
}

