'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface AnalysisPanelProps {
  lat?: number
  lon?: number
  address?: string
  onAnalyze: (lat: number, lon: number, address: string, industry: string) => Promise<void>
  loading?: boolean
  result?: {
    score: number
    summary: string
    pros: string[]
    cons: string[]
    recommendation: string
    raw_data?: any
  }
}

export default function AnalysisPanel({
  lat,
  lon,
  address,
  onAnalyze,
  loading = false,
  result,
}: AnalysisPanelProps) {
  const [selectedIndustry, setSelectedIndustry] = useState('cafe')
  const [inputAddress, setInputAddress] = useState(address || '')

  const handleAnalyze = async () => {
    if (lat && lon) {
      await onAnalyze(lat, lon, inputAddress, selectedIndustry)
    }
  }

  const industries = [
    { value: 'cafe', label: 'Kahvila' },
    { value: 'restaurant', label: 'Ravintola' },
    { value: 'gym', label: 'Kuntosali' },
    { value: 'retail', label: 'Vähittäiskauppa' },
    { value: 'real_estate', label: 'Kiinteistö' },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6.5) return 'text-blue-600'
    if (score >= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!lat || !lon) {
    return (
      <Card className="h-full flex flex-col justify-center">
        <CardContent className="text-center text-gray-500">
          <p className="text-lg">📍 Valitse sijainti kartalta</p>
          <p className="text-sm mt-2">Tai syötä osoite alla ja aloita analyysi</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Osoite- ja teollisuusvalinta */}
      <Card>
        <CardHeader>
          <CardTitle>Analyysiasetukset</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Osoite</Label>
            <Input
              id="address"
              placeholder="esim. Mannerheimintie 2, Helsinki"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="industry">Liiketoiminnan tyyppi</Label>
            <select
              id="industry"
              className="w-full px-3 py-2 border rounded-md"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
            >
              {industries.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full"
          >
            {loading ? '🔄 Analysoidaan...' : '📊 Analysoi sijainti'}
          </Button>
        </CardContent>
      </Card>

      {/* Tulokset */}
      {result && (
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Pistemäärä */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Sijainnin potentiaaliarvio</p>
                <p className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}/10
                </p>
                <p className="text-sm mt-4 text-gray-700">{result.recommendation}</p>
              </div>
            </CardContent>
          </Card>

          {/* Yhteenveto */}
          <Card>
            <CardHeader>
              <CardTitle>Analyysi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">{result.summary}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded">
                  <p className="font-semibold text-green-900 mb-2">✅ Vahvuudet</p>
                  <ul className="text-sm space-y-1">
                    {result.pros.map((pro, idx) => (
                      <li key={idx} className="text-green-800">
                        • {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <p className="font-semibold text-red-900 mb-2">⚠️ Haasteet</p>
                  <ul className="text-sm space-y-1">
                    {result.cons.map((con, idx) => (
                      <li key={idx} className="text-red-800">
                        • {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visualisaatiot */}
          {result.raw_data && (
            <>
              {/* Väestön ikäjakauma */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Väestön ikäjakauma</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: '0-18v',
                            value: result.raw_data.demographics.age_0_18,
                          },
                          {
                            name: '19-40v',
                            value: result.raw_data.demographics.age_19_40,
                          },
                          {
                            name: '41-65v',
                            value: result.raw_data.demographics.age_41_65,
                          },
                          {
                            name: '65+v',
                            value: result.raw_data.demographics.age_65_plus,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Kilpailijat */}
              {result.raw_data.competitors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Kilpailijat lähellä ({result.raw_data.competitors.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={result.raw_data.competitors.map((comp: any) => ({
                          name: comp.name,
                          distance: comp.distance,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis label={{ value: 'Etäisyys (m)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="distance" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Liikennevirta */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Liikennevirta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Jalankulkijat päivässä:</span>
                      <span className="font-semibold">
                        {result.raw_data.traffic.pedestrian_flow_daily}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Ajoneuvot päivässä:</span>
                      <span className="font-semibold">
                        {result.raw_data.traffic.vehicle_flow_daily}
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-semibold mb-1">Huipputunnit:</p>
                      <div className="text-xs text-gray-600 space-y-1">
                        {result.raw_data.traffic.peak_hours.map((hour: string) => (
                          <div key={hour}>• {hour}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}
