'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Calendar, Check, X, FileText } from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';

interface Job {
  id: string;
  title: string;
  generated_description: string | null;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  ai_score: number;
  ai_summary: string;
  status: string;
  applied_at: string;
}

const STATUSES = ['new', 'screened', 'interviewing', 'rejected', 'hired'];

interface RecruitmentKanbanProps {
  job: Job;
  onJobUpdate: () => void;
}

export default function RecruitmentKanban({ job, onJobUpdate }: RecruitmentKanbanProps) {
  const supabase = createClient();
  const { toast } = useToast();

  const [candidates, setCandidates] = useState<Map<string, Candidate[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [draggedCandidate, setDraggedCandidate] = useState<{
    id: string;
    fromStatus: string;
  } | null>(null);

  // Fetch candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .eq('job_id', job.id)
          .order('ai_score', { ascending: false });

        if (error) throw error;

        // Group by status
        const grouped = new Map<string, Candidate[]>();
        STATUSES.forEach((status) => grouped.set(status, []));

        (data || []).forEach((candidate) => {
          const statusGroup = grouped.get(candidate.status) || [];
          grouped.set(candidate.status, [...statusGroup, candidate]);
        });

        setCandidates(grouped);
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to load candidates',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`candidates:${job.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'candidates', filter: `job_id=eq.${job.id}` },
        () => {
          fetchCandidates();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [job.id]);

  const handleDragStart = (
    e: React.DragEvent,
    candidateId: string,
    fromStatus: string
  ) => {
    setDraggedCandidate({ id: candidateId, fromStatus });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (
    e: React.DragEvent,
    toStatus: string
  ) => {
    e.preventDefault();

    if (!draggedCandidate) return;
    if (draggedCandidate.fromStatus === toStatus) {
      setDraggedCandidate(null);
      return;
    }

    try {
      // Update candidate status in database
      const { error } = await supabase
        .from('candidates')
        .update({ status: toStatus })
        .eq('id', draggedCandidate.id);

      if (error) throw error;

      // Move in local state
      const oldGroup = candidates.get(draggedCandidate.fromStatus) || [];
      const newGroup = candidates.get(toStatus) || [];

      const candidateToMove = oldGroup.find((c) => c.id === draggedCandidate.id);
      if (candidateToMove) {
        candidates.set(
          draggedCandidate.fromStatus,
          oldGroup.filter((c) => c.id !== draggedCandidate.id)
        );
        candidates.set(toStatus, [...newGroup, candidateToMove]);
        setCandidates(new Map(candidates));
      }

      toast({
        title: 'Success',
        description: `Candidate moved to ${toStatus}`,
      });

      // If moving to 'interviewing', trigger scheduling workflow
      if (toStatus === 'interviewing') {
        await fetch('/api/recruitment/schedule-interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidate_id: draggedCandidate.id,
            job_id: job.id,
          }),
        });
      }

      // If moving to 'rejected' or 'hired', trigger notification workflow
      if (toStatus === 'rejected' || toStatus === 'hired') {
        await fetch('/api/recruitment/decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidate_id: draggedCandidate.id,
            job_id: job.id,
            decision: toStatus,
          }),
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update candidate',
        variant: 'destructive',
      });
    } finally {
      setDraggedCandidate(null);
    }
  };

  const statusLabels: Record<string, { label: string; color: string; icon: JSX.Element }> = {
    new: {
      label: 'New Applications',
      color: 'bg-blue-50 dark:bg-blue-950',
      icon: <Mail size={20} />,
    },
    screened: {
      label: 'Screened (Top Matches)',
      color: 'bg-purple-50 dark:bg-purple-950',
      icon: <FileText size={20} />,
    },
    interviewing: {
      label: 'Scheduled Interviews',
      color: 'bg-orange-50 dark:bg-orange-950',
      icon: <Calendar size={20} />,
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-red-50 dark:bg-red-950',
      icon: <X size={20} />,
    },
    hired: {
      label: 'Hired',
      color: 'bg-green-50 dark:bg-green-950',
      icon: <Check size={20} />,
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Job Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>{job.title}</CardTitle>
          <CardDescription>
            {job.generated_description
              ? job.generated_description.substring(0, 150) + '...'
              : 'Generating job description...'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {STATUSES.map((status) => {
          const statusConfig = statusLabels[status];
          const statusCandidates = candidates.get(status) || [];

          return (
            <div
              key={status}
              className={`rounded-lg border-2 border-dashed p-4 min-h-96 ${statusConfig.color}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                <span className="text-slate-600 dark:text-slate-400">{statusConfig.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">
                    {statusConfig.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {statusCandidates.length} {statusCandidates.length === 1 ? 'candidate' : 'candidates'}
                  </p>
                </div>
              </div>

              {/* Candidate Cards */}
              <div className="space-y-3">
                {statusCandidates.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p className="text-sm">No candidates</p>
                  </div>
                ) : (
                  statusCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidate.id, status)}
                      className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all hover:scale-105"
                    >
                      {/* Score Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {candidate.name}
                        </p>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                            candidate.ai_score >= 80
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                              : candidate.ai_score >= 60
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {candidate.ai_score}%
                        </span>
                      </div>

                      {/* Email */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">
                        {candidate.email}
                      </p>

                      {/* AI Summary */}
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 mb-3">
                        {candidate.ai_summary}
                      </p>

                      {/* Applied Date */}
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(candidate.applied_at).toLocaleDateString('fi-FI')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <strong>Tip:</strong> Drag candidates between columns to update their status. Moving to
            "Scheduled Interviews" will trigger email invitations, and "Hired"/"Rejected" will send
            decision emails.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
