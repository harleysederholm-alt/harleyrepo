import { NextRequest, NextResponse } from 'next/server'
import {
  fetchMockDemographics,
  fetchMockCompetition,
  fetchMockTraffic,
} from '@/lib/dataMocks'
import { calculateLocationScore } from '@/lib/aiAnalyzer'
import { createClient } from '@/lib/supabaseServer'

interface AnalyzeRequest {
  lat: number
  lon: number
  industry: string
  projectId: string
  address: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json()
    const { lat, lon, industry, projectId, address } = body

    // Validointi
    if (!lat || !lon || !industry || !projectId || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Hae mock-data
    const demographics = fetchMockDemographics(lat, lon)
    const competitors = fetchMockCompetition(lat, lon, industry)
    const traffic = fetchMockTraffic(lat, lon)

    // Analysoi
    const analysis = calculateLocationScore(demographics, competitors, traffic, industry)

    // Tallenna tietokantaan
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('analyses')
      .insert([
        {
          project_id: projectId,
          address,
          latitude: lat,
          longitude: lon,
          score: analysis.score,
          summary: analysis.summary,
          pros: analysis.pros,
          cons: analysis.cons,
          raw_data: {
            demographics,
            competitors,
            traffic,
          },
        },
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save analysis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...analysis,
      analysisId: data?.[0]?.id,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
