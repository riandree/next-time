'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createProject, updateProject } from '@/actions/projects';
import type { Tables } from '@/lib/supabase/types';

type Client = Tables<'clients'>;

interface ProjectFormProps {
  projectId?: string;
  initialName?: string;
  initialClientId?: string;
  initialClientName?: string;
  clients: Client[];
  onClose: () => void;
}

export function ProjectForm({
  projectId,
  initialName = '',
  initialClientId = '',
  initialClientName = '',
  clients,
  onClose,
}: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initialName);
  const [clientId, setClientId] = useState(initialClientId);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!projectId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Project name is required');
      return;
    }

    if (!clientId && !isEditing) {
      setError('Client is required');
      return;
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateProject(projectId!, trimmedName)
        : await createProject(trimmedName, clientId);

      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {isEditing ? 'Edit Project' : 'Add Project'}
          </h3>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="project-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Project Name
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter project name"
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="project-client"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Client
            </label>
            {isEditing ? (
              <input
                id="project-client"
                type="text"
                value={initialClientName}
                disabled
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed"
              />
            ) : (
              <select
                id="project-client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={isPending}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            )}
            {isEditing && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Client cannot be changed after creation
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim() || (!clientId && !isEditing)}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
