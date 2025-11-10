'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { Organization, OrgMember } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Loader2 } from 'lucide-react';
import NewOrganizationModal from '@/components/new-organization-modal';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [memberCounts, setMemberCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [showNewOrg, setShowNewOrg] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: orgData } = await supabase
      .from('org_members')
      .select('organizations(*)')
      .eq('member_id', user.id);

    if (orgData) {
      const orgs = orgData.map((om: any) => om.organizations).filter(Boolean);
      setOrganizations(orgs);

      // Fetch member counts
      const counts: { [key: string]: number } = {};
      for (const org of orgs) {
        const { count } = await supabase
          .from('org_members')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', org.id);
        counts[org.id] = count || 0;
      }
      setMemberCounts(counts);
    }

    setLoading(false);
  };

  const handleOrganizationCreated = (org: Organization) => {
    setOrganizations([...organizations, org]);
    setMemberCounts({ ...memberCounts, [org.id]: 1 });
    setShowNewOrg(false);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {organizations.length} {organizations.length === 1 ? 'organization' : 'organizations'}
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
            <Card key={org.id} className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="line-clamp-1">{org.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {org.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="h-4 w-4" />
                  <span>{memberCounts[org.id] || 0} members</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NewOrganizationModal
        isOpen={showNewOrg}
        onClose={() => setShowNewOrg(false)}
        onCreate={handleOrganizationCreated}
      />
    </div>
  );
}
