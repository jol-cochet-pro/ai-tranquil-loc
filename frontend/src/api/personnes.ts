import { apiClient } from './client';

export interface Personne {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  revenus: number | null;
  typeLogement: 'locataire' | 'proprietaire' | 'heberge';
  statutId: string;
  dossierId: string;
  statut: { id: string; nom: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonneDto {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  revenus?: number;
  typeLogement: 'locataire' | 'proprietaire' | 'heberge';
  statutId: string;
}

export type UpdatePersonneDto = Partial<CreatePersonneDto>;

export const personnesApi = {
  list: () =>
    apiClient.get<Personne[]>('/dossier/personnes').then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Personne>(`/dossier/personnes/${id}`).then((r) => r.data),

  create: (data: CreatePersonneDto) =>
    apiClient.post<Personne>('/dossier/personnes', data).then((r) => r.data),

  update: (id: string, data: UpdatePersonneDto) =>
    apiClient.patch<Personne>(`/dossier/personnes/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/dossier/personnes/${id}`),
};
