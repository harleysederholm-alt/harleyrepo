'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import NewRecruitmentModal from '@/components/recruitment/NewRecruitmentModal';
import RecruitmentKanban from '@/components/recruitment/RecruitmentKanban';
import { useToast } from '@/lib/hooks/useToast';

interface Job {
  id: string;
  title: string;
  description_prompt: string;
  generated_description: string | null;
  location: string;
  status: string;
  created_at: string;
  candidate_count?: number;
}

export default function RecruitmentPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        // Fetch candidate counts for each job
        const jobsWithCounts = await Promise.all(
          (jobsData || []).map(async (job) => {
            const { count, error: countError } = await supabase
              .from('candidates')
              .select('*', { count: 'exact', head: true })
              .eq('job_id', job.id);

            return {
              ...job,
              candidate_count: countError ? 0 : count || 0,
            };
          })
        );

        setJobs(jobsWithCounts);

        // Auto-select first job if none selected
        if (jobsWithCounts.length > 0 && !selectedJob) {
          setSelectedJob(jobsWithCounts[0]);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch jobs';
        setError(message);
        toast({ title: 'Error', description: message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const handleCreateJob = async (jobData: {
    title: string;
    description_prompt: string;
    location: string;
  }) => {
    if (!user) return;

    try {
      const { data: newJob, error } = await supabase
        .from('jobs')
        .insert([
          {
            user_id: user.id,
            title: jobData.title,
            description_prompt: jobData.description_prompt,
            location: jobData.location,
            status: 'draft',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newJobWithCount = { ...newJob, candidate_count: 0 };
      setJobs([newJobWithCount, ...jobs]);
      setSelectedJob(newJobWithCount);
      setIsModalOpen(false);

      toast({
        title: 'Success',
        description: 'Recruitment created. AI is generating job description...',
      });

      // Trigger n8n webhook to generate job description
      await fetch('/api/recruitment/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: 'JOB_CREATION',
          job_id: newJob.id,
          title: jobData.title,
          description_prompt: jobData.description_prompt,
          location: jobData.location,
        }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create job';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this recruitment?')) return;

    try {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId);

      if (error) throw error;

      setJobs(jobs.filter((j) => j.id !== jobId));
      if (selectedJob?.id === jobId) {
        setSelectedJob(jobs[0] || null);
      }

      toast({ title: 'Success', description: 'Recruitment deleted.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete job';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Autonomous Recruitment Agent
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your recruitment pipeline with AI-powered candidate screening
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={20} />
              New Recruitment
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">Error</p>
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Job List */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Open Recruitments</CardTitle>
                <CardDescription>{jobs.length} total</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="animate-spin text-slate-400" size={24} />
                  </div>
                ) : jobs.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4">
                    No active recruitments. Click "New Recruitment" to get started.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedJob?.id === job.id
                            ? 'bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                        } border`}
                      >
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">
                          {job.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {job.location}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                            {job.candidate_count} applicants
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              job.status === 'published'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteJob(job.id);
                            }}
                            className="flex-1 text-xs px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 rounded transition-colors flex items-center justify-center gap-1"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main: Kanban Board */}
          <div className="lg:col-span-3">
            {selectedJob ? (
              <RecruitmentKanban job={selectedJob} onJobUpdate={() => {}} />
            ) : (
              <Card className="h-full flex items-center justify-center min-h-96">
                <CardContent className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Select a recruitment or create a new one to get started.
                  </p>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Create First Recruitment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* New Recruitment Modal */}
      <NewRecruitmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateJob}
      />
    </div>
  );
}
