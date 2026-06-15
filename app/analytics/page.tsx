"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormulaCard from "@/components/formula-card"
import ThresholdTable from "@/components/threshold-table"
import DataFlowDiagram from "@/components/data-flow-diagram"
import GasContributionChart from "@/components/gas-contribution-chart"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-manrope">AQI Analytics</h1>
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center text-sm font-medium hover:text-primary transition-colors">
            Dashboard
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>

      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold font-manrope mb-4">AQI Overview</h2>
          <p className="text-muted-foreground mb-6 font-space-grotesk">
            The Air Quality Index (AQI) is a comprehensive measure that combines multiple gas sensor readings to provide
            a single value representing air quality. Our system uses a weighted approach to calculate the final AQI
            value, giving more importance to gases that have greater health impacts.
          </p>

          <Tabs defaultValue="methodology" className="w-full">
            <TabsList className="w-full grid grid-cols-1 md:grid-cols-3 mb-6">
              <TabsTrigger value="methodology">Calculation Methodology</TabsTrigger>
              <TabsTrigger value="thresholds">Threshold Reference</TabsTrigger>
              <TabsTrigger value="dataflow">Data Flow</TabsTrigger>
            </TabsList>

            <TabsContent value="methodology" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormulaCard />

                <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border-safety-green/20 hover:border-safety-green">
                  <h2 className="text-xl font-semibold font-manrope mb-4">Gas Contribution to AQI</h2>
                  <p className="text-muted-foreground mb-6 font-space-grotesk">
                    This visualization shows how each gas contributes to the overall AQI calculation. Hover over
                    segments to see detailed information about each gas's impact.
                  </p>
                  <div className="h-[400px] w-full">
                    <GasContributionChart />
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="thresholds" className="mt-0">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border-safety-green/20 hover:border-safety-green">
                <h2 className="text-xl font-semibold font-manrope mb-4">Threshold Reference</h2>
                <p className="text-muted-foreground mb-6 font-space-grotesk">
                  This table shows the safe and danger thresholds for each gas, along with their weighting in the AQI
                  calculation.
                </p>
                <ThresholdTable />
              </Card>
            </TabsContent>

            <TabsContent value="dataflow" className="mt-0">
              <DataFlowDiagram />
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}

