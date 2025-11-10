'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newProject, setNewProject] = useState({ name: '', industry: 'cafe' })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('projects').select('*')
    setProjects(data || [])
    setLoading(false)
  }

  const handleCreateProject = async () => {
    if (!newProject.name) {
      alert('Anna projektille nimi')
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('projects').insert([newProject])

    if (!error) {
      setNewProject({ name: '', industry: 'cafe' })
      loadProjects()
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Omat Projektit</h1>

      {/* Uusi projekti */}
      <Card>
        <CardHeader>
          <CardTitle>Luo uusi projekti</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Projektin nimi"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
          />
          <select
            className="w-full px-3 py-2 border rounded-md"
            value={newProject.industry}
            onChange={(e) => setNewProject({ ...newProject, industry: e.target.value })}
          >
            <option value="cafe">Kahvila</option>
            <option value="restaurant">Ravintola</option>
            <option value="gym">Kuntosali</option>
            <option value="retail">Vähittäiskauppa</option>
            <option value="real_estate">Kiinteistö</option>
          </select>
          <Button onClick={handleCreateProject} className="w-full">
            Luo Projekti
          </Button>
        </CardContent>
      </Card>

      {/* Projektilista */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Aktiiviset projektit</h2>
        {loading ? (
          <p>Ladataan...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-500">Ei projekteja vielä</p>
        ) : (
          <div className="grid gap-4">
            {projects.map((proj) => (
              <Card key={proj.id}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold">{proj.name}</h3>
                  <p className="text-sm text-gray-600">Tyyppi: {proj.industry}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Luotu: {new Date(proj.created_at).toLocaleDateString('fi-FI')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
