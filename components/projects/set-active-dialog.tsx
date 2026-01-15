'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { setProjectActive } from '@/actions/projects';

interface SetActiveDialogProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

export function SetActiveDialog({
  projectId,
  projectName,
  onClose,
}: SetActiveDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSetActive = () => {
    setError(null);
    startTransition(async () => {
      const result = await setProjectActive(projectId);
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
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Set Project as Active
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Are you sure you want to set <strong>{projectName}</strong> as the active project?
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Warning:</strong> This will set all other projects to 'completed' status.
              Only one project can be active at a time.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSetActive}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Setting...' : 'Set as Active'}
          </button>
        </div>
      </div>
    </div>
  );
}
