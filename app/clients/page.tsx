import { getClients } from '@/actions/clients';
import { ClientList } from '@/components/clients/client-list';

export default async function ClientsPage() {
  const { clients, error } = await getClients();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pt-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Clients
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your clients and their associated projects.
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        ) : (
          <ClientList clients={clients} />
        )}
      </div>
    </div>
  );
}
