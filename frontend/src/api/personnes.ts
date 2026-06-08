import { apiClient } from './client';

export interface Personne {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  revenus: number | null;
  role: 'candidat' | 'co_candidat' | 'garant';
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
  role?: 'candidat' | 'co_candidat' | 'garant';
  typeLogement: 'locataire' | 'proprietaire' | 'heberge';
  statutId: string;
}

export interface PersonneCompletion {
  personneId: string;
  nom: string;
  prenom: string;
  role: 'candidat' | 'co_candidat' | 'garant';
  documentsCount: number;
  documentsRequired: number;
  invitationStatus: 'pending' | 'viewed' | 'completed' | null;
}

export type UpdatePersonneDto = Partial<CreatePersonneDto>;

export const personnesApi = {
  list: () =>
    apiClient.get<Personne[]>('/personnes').then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Personne>(`/personnes/${id}`).then((r) => r.data),

  create: (data: CreatePersonneDto) =>
    apiClient.post<Personne>('/personnes', data).then((r) => r.data),

  update: (id: string, data: UpdatePersonneDto) =>
    apiClient.patch<Personne>(`/personnes/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/personnes/${id}`),

  completion: () =>
    apiClient.get<PersonneCompletion[]>('/personnes/completion').then((r) => r.data),
};
