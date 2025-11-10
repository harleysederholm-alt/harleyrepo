'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('analyses')
      .select('*, projects(name)')
      .order('created_at', { ascending: false })

    setAnalyses(data || [])
    setLoading(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6.5) return 'text-blue-600'
    if (score >= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Analyysien Historia</h1>

      {loading ? (
        <p>Ladataan...</p>
      ) : analyses.length === 0 ? (
        <p className="text-gray-500">Ei analyysejä vielä</p>
      ) : (
        <div className="grid gap-4">
          {analyses.map((analysis) => (
            <Card key={analysis.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{analysis.address}</h3>
                    <p className="text-sm text-gray-600">
                      Projekti: {analysis.projects?.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(analysis.created_at).toLocaleDateString('fi-FI')}{' '}
                      {new Date(analysis.created_at).toLocaleTimeString('fi-FI')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                      {analysis.score}
                    </p>
                    <p className="text-xs text-gray-500">/10</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
