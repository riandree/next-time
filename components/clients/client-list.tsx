'use client';

import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { Tables } from '@/lib/supabase/types';
import { ClientForm } from './client-form';
import { DeleteClientDialog } from './delete-client-dialog';

type Client = Tables<'clients'>;

interface ClientListProps {
  clients: Client[];
}

export function ClientList({ clients }: ClientListProps) {
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
  };

  const handleDelete = (client: Client) => {
    setDeletingClient(client);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (clients.length === 0) {
    return (
      <>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No clients yet. Create your first client to get started.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Client
          </button>
        </div>

        {showAddForm && (
          <ClientForm onClose={() => setShowAddForm(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Clients ({clients.length})
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Client
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {clients.map((client) => (
            <div
              key={client.id}
              className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50 mb-1">
                    {client.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Created {formatDate(client.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(client)}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Edit client"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(client)}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Delete client"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddForm && (
        <ClientForm onClose={() => setShowAddForm(false)} />
      )}

      {editingClient && (
        <ClientForm
          clientId={editingClient.id}
          initialName={editingClient.name}
          onClose={() => setEditingClient(null)}
        />
      )}

      {deletingClient && (
        <DeleteClientDialog
          clientId={deletingClient.id}
          clientName={deletingClient.name}
          onClose={() => setDeletingClient(null)}
        />
      )}
    </>
  );
}
