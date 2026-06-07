import { apiClient } from './client';

export interface Statut {
  id: string;
  nom: string;
}

export interface DocumentType {
  id: string;
  nom: string;
}

export const configurationApi = {
  statuts: () =>
    apiClient.get<Statut[]>('/configuration/statuts').then((r) => r.data),

  documentsForStatut: (statutId: string) =>
    apiClient.get<DocumentType[]>(`/configuration/statuts/${statutId}/documents`).then((r) => r.data),

  documentTypes: () =>
    apiClient.get<DocumentType[]>('/configuration/document-types').then((r) => r.data),
};
