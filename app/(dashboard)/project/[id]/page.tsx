'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { Project, Column, Task } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import KanbanBoard from '@/components/kanban-board';
import TaskModal from '@/components/task-modal';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    fetchProjectData();
    subscribeToChanges();
  }, [projectId]);

  const fetchProjectData = async () => {
    const supabase = createClient();

    try {
      // Fetch project
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectData) {
        setProject(projectData);
      }

      // Fetch columns
      const { data: columnsData } = await supabase
        .from('columns')
        .select('*')
        .eq('project_id', projectId)
        .order('order', { ascending: true });

      if (columnsData) {
        setColumns(columnsData);
      }

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('order', { ascending: true });

      if (tasksData) {
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    const supabase = createClient();

    // Subscribe to task changes
    const tasksSubscription = supabase
      .channel(`tasks:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks([...tasks, payload.new as Task]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(
              tasks.map((t) => (t.id === payload.new.id ? payload.new : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks(tasks.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      tasksSubscription.unsubscribe();
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-8 px-4">
        <p className="text-red-600">Project not found</p>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        {project.description && (
          <p className="text-slate-600 dark:text-slate-400">{project.description}</p>
        )}
      </div>

      <KanbanBoard
        projectId={projectId}
        columns={columns}
        tasks={tasks}
        onTaskSelect={(task) => {
          setSelectedTask(task);
          setShowTaskModal(true);
        }}
      />

      {selectedTask && (
        <TaskModal
          isOpen={showTaskModal}
          task={selectedTask}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onTaskUpdated={(updatedTask) => {
            setTasks(
              tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            );
          }}
        />
      )}
    </div>
  );
}
