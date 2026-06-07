import { apiClient } from "./client";
import type { Document } from "./documents";

export type StatutInvitation = "pending" | "viewed" | "completed";

export interface Invitation {
  id: string;
  token: string;
  statut: StatutInvitation;
  personneId: string;
  personne: {
    id: string;
    nom: string;
    prenom: string;
    email: string | null;
    telephone: string | null;
    revenus: number | null;
    typeLogement: "locataire" | "proprietaire" | "heberge";
    statut: { id: string; nom: string };
  };
  createdAt: string;
  updatedAt: string;
}

export const invitationsApi = {
  create: (personneId: string) =>
    apiClient
      .post<Invitation>(`/dossier/personnes/${personneId}/invitations`)
      .then((r) => r.data),

  list: () =>
    apiClient.get<Invitation[]>("/dossier/invitations").then((r) => r.data),

  getByToken: (token: string) =>
    apiClient.get<Invitation>(`/invitations/${token}`).then((r) => r.data),

  updateByToken: (
    token: string,
    data: {
      nom?: string;
      prenom?: string;
      email?: string;
      telephone?: string;
    },
  ) =>
    apiClient
      .put<Invitation>(`/invitations/${token}`, data)
      .then((r) => r.data),

  listDocumentsByToken: (token: string) =>
    apiClient
      .get<Document[]>(`/invitations/${token}/documents`)
      .then((r) => r.data),

  uploadDocumentByToken: (
    token: string,
    file: File,
    typeDocumentId: string,
    typeDocumentPersonnalise?: string,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("typeDocumentId", typeDocumentId);
    if (typeDocumentPersonnalise) {
      formData.append("typeDocumentPersonnalise", typeDocumentPersonnalise);
    }
    return apiClient
      .post<Document>(
        `/invitations/${token}/documents`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      )
      .then((r) => r.data);
  },

  getDocumentDownloadUrl: (token: string, documentId: string) =>
    `/invitations/${token}/documents/${documentId}/download`,
};
