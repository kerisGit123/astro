"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

interface FiveElementsChartProps {
  data: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
}

export function FiveElementsChart({ data }: FiveElementsChartProps) {
  const chartData = [
    { element: '木 Wood', value: data.wood, fullMark: 10 },
    { element: '火 Fire', value: data.fire, fullMark: 10 },
    { element: '土 Earth', value: data.earth, fullMark: 10 },
    { element: '金 Metal', value: data.metal, fullMark: 10 },
    { element: '水 Water', value: data.water, fullMark: 10 },
  ]

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="#333" />
        <PolarAngleAxis 
          dataKey="element" 
          tick={{ fill: '#888', fontSize: 12 }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 10]}
          tick={{ fill: '#888' }}
        />
        <Radar
          name="Five Elements"
          dataKey="value"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
