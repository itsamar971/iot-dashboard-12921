"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const thresholdData = [
  {
    gas: "CO₂",
    safeLevel: "≤ 600 ppm",
    dangerLevel: "≥ 1000 ppm",
    weighting: "30%",
    description:
      "Carbon dioxide is a natural component of air. Elevated levels can cause drowsiness and impair cognitive function.",
  },
  {
    gas: "PM2.5",
    safeLevel: "≤ 12 μg/m³",
    dangerLevel: "≥ 35 μg/m³",
    weighting: "25%",
    description:
      "Fine particulate matter can penetrate deep into the lungs and cause respiratory and cardiovascular issues.",
  },
  {
    gas: "VOC",
    safeLevel: "≤ 0.3 mg/m³",
    dangerLevel: "≥ 0.5 mg/m³",
    weighting: "20%",
    description:
      "Volatile organic compounds are emitted from many household products and can cause eye, nose, and throat irritation.",
  },
  {
    gas: "CO",
    safeLevel: "≤ 9 ppm",
    dangerLevel: "≥ 35 ppm",
    weighting: "15%",
    description:
      "Carbon monoxide is a toxic gas that can cause headaches, dizziness, and even death at high concentrations.",
  },
  {
    gas: "NO₂",
    safeLevel: "≤ 53 ppb",
    dangerLevel: "≥ 100 ppb",
    weighting: "10%",
    description:
      "Nitrogen dioxide is a respiratory irritant that can worsen asthma and increase susceptibility to respiratory infections.",
  },
]

export default function ThresholdTable() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-background">
          <TableRow>
            <TableHead className="w-[100px]">Gas</TableHead>
            <TableHead className="w-[150px]">Safe Level</TableHead>
            <TableHead className="w-[150px]">Danger Level</TableHead>
            <TableHead className="w-[100px]">Weighting</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {thresholdData.map((row) => (
            <TableRow
              key={row.gas}
              className={`transition-colors ${hoveredRow === row.gas ? "bg-safety-green/10" : ""}`}
              onMouseEnter={() => setHoveredRow(row.gas)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <TableCell className="font-medium font-space-grotesk">{row.gas}</TableCell>
              <TableCell className="font-manrope text-safety-green">{row.safeLevel}</TableCell>
              <TableCell className="font-manrope text-danger-coral">{row.dangerLevel}</TableCell>
              <TableCell className="font-manrope font-semibold">{row.weighting}</TableCell>
              <TableCell className="font-space-grotesk text-muted-foreground">{row.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

