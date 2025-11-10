'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import MapComponent from '@/components/Map'
import AnalysisPanel from '@/components/AnalysisPanel'
import { useRouter } from 'next/navigation'

interface AnalysisResult {
  score: number
  summary: string
  pros: string[]
  cons: string[]
  recommendation: string
  raw_data?: any
}

export default function DashboardPage() {
  const router = useRouter()
  const [selectedLat, setSelectedLat] = useState<number | undefined>()
  const [selectedLon, setSelectedLon] = useState<number | undefined>()
  const [selectedAddress, setSelectedAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | undefined>()
  const [projectId, setProjectId] = useState<string | undefined>()
  const [user, setUser] = useState<any>(null)

  // Hae käyttäjä ja luo/hae projekti
  useEffect(() => {
    const initializeProject = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()

      if (data.user) {
        setUser(data.user)

        // Yritä hakea ensimmäinen projekti
        const { data: projects } = await supabase
          .from('projects')
          .select('id')
          .limit(1)

        if (projects && projects.length > 0) {
          setProjectId(projects[0].id)
        } else {
          // Luo oletusprojekti
          const { data: newProject } = await supabase
            .from('projects')
            .insert([
              {
                name: 'Oletusprojekti',
                industry: 'cafe',
                user_id: data.user.id,
              },
            ])
            .select()

          if (newProject && newProject.length > 0) {
            setProjectId(newProject[0].id)
          }
        }
      } else {
        router.push('/login')
      }
    }

    initializeProject()
  }, [router])

  const handleLocationSelect = (lat: number, lon: number) => {
    setSelectedLat(lat)
    setSelectedLon(lon)
    setResult(undefined)

    // Yritä hakea osoite Mapbox Reverse Geocoding API:lla
    if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            setSelectedAddress(data.features[0].place_name)
          }
        })
        .catch(() => setSelectedAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`))
    }
  }

  const handleAnalyze = async (
    lat: number,
    lon: number,
    address: string,
    industry: string
  ) => {
    if (!projectId) {
      alert('Projektia ei ole valittu')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lon,
          industry,
          projectId,
          address: address || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        alert('Analyysi epäonnistui: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Virhe analyysiä suoritettaessa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex gap-4 p-4">
      {/* Kartta - 60% */}
      <div className="flex-[0.6] rounded-lg overflow-hidden shadow-lg">
        <MapComponent
          onLocationSelect={handleLocationSelect}
          markerLat={selectedLat}
          markerLon={selectedLon}
        />
      </div>

      {/* Analyysipaneeli - 40% */}
      <div className="flex-[0.4] rounded-lg overflow-hidden shadow-lg bg-white p-4">
        <AnalysisPanel
          lat={selectedLat}
          lon={selectedLon}
          address={selectedAddress}
          onAnalyze={handleAnalyze}
          loading={loading}
          result={result}
        />
      </div>
    </div>
  )
}
