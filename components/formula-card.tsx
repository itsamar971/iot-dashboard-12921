"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const weightingFactors = [
  {
    gas: "CO₂",
    weight: 0.3,
    description: "Carbon dioxide is weighted at 30% due to its impact on cognitive function and overall air quality.",
  },
  {
    gas: "PM2.5",
    weight: 0.25,
    description:
      "Fine particulate matter is weighted at 25% due to its significant respiratory and cardiovascular health impacts.",
  },
  {
    gas: "VOC",
    weight: 0.2,
    description:
      "Volatile organic compounds are weighted at 20% due to their role in indoor air pollution and potential health effects.",
  },
  {
    gas: "CO",
    weight: 0.15,
    description:
      "Carbon monoxide is weighted at 15% due to its toxicity and potential for causing headaches and dizziness.",
  },
  {
    gas: "NO₂",
    weight: 0.1,
    description:
      "Nitrogen dioxide is weighted at 10% due to its respiratory effects and role as an indicator of outdoor pollution.",
  },
]

export default function FormulaCard() {
  const [hoveredFactor, setHoveredFactor] = useState<string | null>(null)

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border-safety-green/20 hover:border-safety-green">
      <h2 className="text-xl font-semibold font-manrope mb-4">Formula Breakdown</h2>
      <p className="text-muted-foreground mb-6 font-space-grotesk">
        Our AQI calculation uses a weighted approach that combines individual gas scores with their respective
        importance factors.
      </p>

      <div className="bg-safety-green/10 p-4 rounded-md mb-6 border border-safety-green/30">
        <div className="font-manrope text-lg text-center mb-2 font-bold">
          AQI = (Individual Gas Scores) × Weighting Factors
        </div>
        <div className="font-fira-code text-sm text-center text-muted-foreground">AQI = Σ(Gas_Score_i × Weight_i)</div>
      </div>

      <h3 className="text-lg font-semibold font-manrope mb-3">Weighting Factors</h3>
      <p className="text-muted-foreground mb-4 font-space-grotesk">
        Hover over each factor to see its contribution to the overall AQI calculation.
      </p>

      <TooltipProvider>
        <div className="space-y-3">
          {weightingFactors.map((factor) => (
            <Tooltip key={factor.gas}>
              <TooltipTrigger asChild>
                <div
                  className={`p-3 rounded-md flex justify-between items-center cursor-pointer transition-colors ${
                    hoveredFactor === factor.gas ? "bg-safety-green/20" : "bg-muted hover:bg-muted/80"
                  }`}
                  onMouseEnter={() => setHoveredFactor(factor.gas)}
                  onMouseLeave={() => setHoveredFactor(null)}
                >
                  <span className="font-space-grotesk">{factor.gas}</span>
                  <div className="flex items-center">
                    <span className="font-manrope font-bold">{(factor.weight * 100).toFixed(0)}%</span>
                    <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p>{factor.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </Card>
  )
}

