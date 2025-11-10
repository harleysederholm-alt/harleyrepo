'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { Task, Comment, Profile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Send, Loader2, Wand2 } from 'lucide-react';
import AISummarizer from '@/components/ai-summarizer';

interface TaskModalProps {
  isOpen: boolean;
  task: Task;
  onClose: () => void;
  onTaskUpdated: (task: Task) => void;
}

export default function TaskModal({
  isOpen,
  task,
  onClose,
  onTaskUpdated,
}: TaskModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      subscribeToComments();
    }
  }, [isOpen, task.id]);

  const fetchComments = async () => {
    const supabase = createClient();
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*, author:profiles(*)')
      .eq('task_id', task.id)
      .order('created_at', { ascending: true });

    if (commentsData) {
      setComments(commentsData);
    }
    setLoading(false);
  };

  const subscribeToComments = () => {
    const supabase = createClient();
    const subscription = supabase
      .channel(`task:${task.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `task_id=eq.${task.id}`,
        },
        (payload) => {
          // Fetch new comment with author info
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase.from('comments').insert([
        {
          task_id: task.id,
          author_id: user.id,
          content: newComment.trim(),
        },
      ]);

      if (!error) {
        setNewComment('');
        await fetchComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveTask = async () => {
    if (title === task.title && description === task.description) {
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: updatedTask } = await supabase
        .from('tasks')
        .update({
          title,
          description,
        })
        .eq('id', task.id)
        .select()
        .single();

      if (updatedTask) {
        onTaskUpdated(updatedTask);
      }
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTask}
              className="text-2xl font-bold bg-transparent border-none outline-none w-full"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSaveTask}
              placeholder="Add a description..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
              rows={4}
            />
          </div>

          {/* AI Summarizer */}
          {comments.length > 0 && (
            <AISummarizer taskId={task.id} comments={comments} />
          )}

          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Comments ({comments.length})</h3>

            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-slate-500">No comments yet</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.author?.full_name || comment.author?.username}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                disabled={submitting}
              />
              <Button
                type="submit"
                size="icon"
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
