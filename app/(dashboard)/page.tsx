'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/browser';
import { Organization, Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Folder, Settings2, Loader2 } from 'lucide-react';
import NewOrganizationModal from '@/components/new-organization-modal';
import NewProjectModal from '@/components/new-project-modal';

export default function DashboardPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewOrg, setShowNewOrg] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Fetch organizations
    const { data: orgData } = await supabase
      .from('org_members')
      .select('organizations(*)')
      .eq('member_id', user.id);

    if (orgData) {
      const orgs = orgData.map((om: any) => om.organizations).filter(Boolean);
      setOrganizations(orgs);
      if (orgs.length > 0 && !selectedOrg) {
        setSelectedOrg(orgs[0]);
      }
    }

    // Fetch projects if org is selected
    if (selectedOrg) {
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('org_id', selectedOrg.id);

      setProjects(projectData || []);
    }

    setLoading(false);
  };

  const handleOrganizationCreated = (org: Organization) => {
    setOrganizations([...organizations, org]);
    setSelectedOrg(org);
    setShowNewOrg(false);
    fetchData();
  };

  const handleProjectCreated = (project: Project) => {
    setProjects([...projects, project]);
    setShowNewProject(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="py-8 px-4 md:px-0">
      {/* Organizations Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your organizations and projects
            </p>
          </div>
          <Button onClick={() => setShowNewOrg(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Organization
          </Button>
        </div>

        {organizations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <p className="text-slate-500 mb-4">No organizations yet</p>
              <Button onClick={() => setShowNewOrg(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Organization
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <Card
                key={org.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedOrg?.id === org.id
                    ? 'ring-2 ring-blue-500'
                    : ''
                }`}
                onClick={() => {
                  setSelectedOrg(org);
                  fetchData();
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    {org.name}
                  </CardTitle>
                  <CardDescription>{org.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Projects Section */}
      {selectedOrg && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Projects in {selectedOrg.name}</h2>
              <p className="text-slate-600 dark:text-slate-400">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </p>
            </div>
            <Button onClick={() => setShowNewProject(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          {projects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <p className="text-slate-500 mb-4">No projects yet</p>
                <Button onClick={() => setShowNewProject(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Link key={project.id} href={`/project/${project.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Folder className="h-5 w-5" />
                        {project.name}
                      </CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <NewOrganizationModal
        isOpen={showNewOrg}
        onClose={() => setShowNewOrg(false)}
        onCreate={handleOrganizationCreated}
      />

      {selectedOrg && (
        <NewProjectModal
          isOpen={showNewProject}
          onClose={() => setShowNewProject(false)}
          orgId={selectedOrg.id}
          onCreate={handleProjectCreated}
        />
      )}
    </div>
  );
}
