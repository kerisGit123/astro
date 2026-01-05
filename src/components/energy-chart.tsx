"use client"

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface EnergyChartProps {
  data: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
}

const elementColors = {
  wood: "#22c55e",   // green
  fire: "#ef4444",   // red
  earth: "#eab308",  // yellow
  metal: "#6b7280",  // gray
  water: "#3b82f6",  // blue
}

export function EnergyChart({ data }: EnergyChartProps) {
  const chartData = [
    { element: "木 Wood", value: data.wood, color: elementColors.wood },
    { element: "火 Fire", value: data.fire, color: elementColors.fire },
    { element: "土 Earth", value: data.earth, color: elementColors.earth },
    { element: "金 Metal", value: data.metal, color: elementColors.metal },
    { element: "水 Water", value: data.water, color: elementColors.water },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Distribution (五行能量分布)</CardTitle>
        <CardDescription>Your elemental energy balance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={true} />
              <XAxis 
                type="number"
                domain={[0, 10]}
                tick={{ fill: '#888', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#444' }}
              />
              <YAxis 
                type="category"
                dataKey="element" 
                tick={{ fill: '#888', fontSize: 12 }}
                tickLine={false}
                width={80}
                axisLine={{ stroke: '#444' }}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 8, 8, 0]} 
                barSize={30}
                fill="#8884d8"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="text-center">
            <p className="text-sm font-medium">木 Wood</p>
            <p className="text-2xl font-bold text-green-600">{data.wood}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">火 Fire</p>
            <p className="text-2xl font-bold text-red-600">{data.fire}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">土 Earth</p>
            <p className="text-2xl font-bold text-yellow-600">{data.earth}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">金 Metal</p>
            <p className="text-2xl font-bold text-gray-600">{data.metal}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">水 Water</p>
            <p className="text-2xl font-bold text-blue-600">{data.water}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
