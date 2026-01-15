import { getProjects } from '@/actions/projects';
import { getClients } from '@/actions/clients';
import { ProjectList } from '@/components/projects/project-list';

export default async function ProjectsPage() {
  const { projects, error: projectsError } = await getProjects();
  const { clients, error: clientsError } = await getClients();

  const error = projectsError || clientsError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pt-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Projects
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your projects and their associated clients.
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        ) : (
          <ProjectList projects={projects || []} clients={clients || []} />
        )}
      </div>
    </div>
  );
}
