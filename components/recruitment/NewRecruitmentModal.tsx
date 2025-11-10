'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, AlertCircle } from 'lucide-react';

interface NewRecruitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    title: string;
    description_prompt: string;
    location: string;
  }) => Promise<void>;
}

export default function NewRecruitmentModal({
  isOpen,
  onClose,
  onCreate,
}: NewRecruitmentModalProps) {
  const [title, setTitle] = useState('');
  const [description_prompt, setDescriptionPrompt] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!title.trim() || !description_prompt.trim() || !location.trim()) {
        setError('All fields are required');
        setIsLoading(false);
        return;
      }

      await onCreate({
        title: title.trim(),
        description_prompt: description_prompt.trim(),
        location: location.trim(),
      });

      // Reset form
      setTitle('');
      setDescriptionPrompt('');
      setLocation('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recruitment');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div>
            <CardTitle>Create New Recruitment</CardTitle>
            <CardDescription>AI will generate a professional job posting</CardDescription>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100 text-sm">Error</p>
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Senior Python Developer"
                disabled={isLoading}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Turku, Remote, Finland"
                disabled={isLoading}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Job Description Prompt */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Job Requirements (AI will expand this)
              </label>
              <textarea
                value={description_prompt}
                onChange={(e) => setDescriptionPrompt(e.target.value)}
                placeholder="e.g., Python developer with 5+ years experience, strong Django background, experience with PostgreSQL, team lead experience preferred, must speak Finnish"
                disabled={isLoading}
                rows={6}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Be detailed about requirements, experience, and preferences. AI will use this to
                generate a professional job posting in Finnish.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !title.trim() || !description_prompt.trim()}
                className="px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create & Generate Job Post'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
