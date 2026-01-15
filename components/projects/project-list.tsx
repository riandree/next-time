'use client';

import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import type { Tables } from '@/lib/supabase/types';
import { ProjectForm } from './project-form';
import { DeleteProjectDialog } from './delete-project-dialog';
import { SetActiveDialog } from './set-active-dialog';

type Project = Tables<'projects'> & {
  clients?: {
    id: string;
    name: string;
  } | null;
};

type Client = Tables<'clients'>;

interface ProjectListProps {
  projects: Project[];
  clients: Client[];
}

export function ProjectList({ projects: initialProjects, clients }: ProjectListProps) {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [activatingProject, setActivatingProject] = useState<Project | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  // Filter projects by selected client
  const filteredProjects = selectedClientId
    ? initialProjects.filter((project) => project.client_id === selectedClientId)
    : initialProjects;

  const handleEdit = (project: Project) => {
    setEditingProject(project);
  };

  const handleDelete = (project: Project) => {
    setDeletingProject(project);
  };

  const handleSetActive = (project: Project) => {
    setActivatingProject(project);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (initialProjects.length === 0) {
    return (
      <>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No projects yet. Create your first project to get started.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Project
          </button>
        </div>

        {showAddForm && (
          <ProjectForm clients={clients} onClose={() => setShowAddForm(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Projects ({filteredProjects.length})
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add Project
            </button>
          </div>

          {/* Client Filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="client-filter"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Filter by client:
            </label>
            <select
              id="client-filter"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500"
            >
              <option value="">All clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {filteredProjects.map((project) => {
            const isActive = project.status === 'active';
            return (
              <div
                key={project.id}
                className={`p-6 hover:opacity-90 transition-opacity border ${
                  isActive
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
                        {project.name}
                      </h3>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/50 rounded">
                          <CheckCircleIcon className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      <p>
                        <span className="font-medium">Client:</span> {project.clients?.name || 'Unknown'}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span> {project.status === 'active' ? 'Active' : 'Completed'}
                      </p>
                      {project.start_date && (
                        <p>
                          <span className="font-medium">Start date:</span> {formatDate(project.start_date)}
                        </p>
                      )}
                      {project.end_date && (
                        <p>
                          <span className="font-medium">End date:</span> {formatDate(project.end_date)}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        Created {formatDate(project.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <button
                        onClick={() => handleSetActive(project)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Set as active project"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Edit project"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(project)}
                      className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Delete project"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddForm && (
        <ProjectForm clients={clients} onClose={() => setShowAddForm(false)} />
      )}

      {editingProject && (
        <ProjectForm
          projectId={editingProject.id}
          initialName={editingProject.name}
          initialClientId={editingProject.client_id}
          initialClientName={editingProject.clients?.name || 'Unknown'}
          clients={clients}
          onClose={() => setEditingProject(null)}
        />
      )}

      {deletingProject && (
        <DeleteProjectDialog
          projectId={deletingProject.id}
          projectName={deletingProject.name}
          onClose={() => setDeletingProject(null)}
        />
      )}

      {activatingProject && (
        <SetActiveDialog
          projectId={activatingProject.id}
          projectName={activatingProject.name}
          onClose={() => setActivatingProject(null)}
        />
      )}
    </>
  );
}
