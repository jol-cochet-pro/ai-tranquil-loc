import { apiClient } from './client';

export interface Document {
  id: string;
  nom: string;
  nomFichier: string;
  mimeType: string;
  taille: number;
  typeDocumentId: string;
  typeDocumentPersonnalise: string | null;
  personneId: string;
  typeDocument: { id: string; nom: string };
  createdAt: string;
}

export const documentsApi = {
  listForPersonne: (personneId: string) =>
    apiClient.get<Document[]>(`/dossier/personnes/${personneId}/documents`).then((r) => r.data),

  upload: (
    personneId: string,
    file: File,
    typeDocumentId: string,
    typeDocumentPersonnalise?: string,
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('typeDocumentId', typeDocumentId);
    if (typeDocumentPersonnalise) {
      formData.append('typeDocumentPersonnalise', typeDocumentPersonnalise);
    }
    return apiClient
      .post<Document>(`/dossier/personnes/${personneId}/documents`, formData)
      .then((r) => r.data);
  },

  delete: (personneId: string, documentId: string) =>
    apiClient.delete(`/dossier/personnes/${personneId}/documents/${documentId}`),

  download: async (documentId: string) => {
    const response = await apiClient.get(`/dossier/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response;
  },
};
