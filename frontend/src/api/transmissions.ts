import { apiClient, publicClient } from './client';
import type { DocumentType } from './configuration';
import type { Document } from './documents';

export interface TransmissionDocumentType {
  documentType: DocumentType;
}

export interface Transmission {
  id: string;
  token: string;
  expireAt: string | null;
  revoked: boolean;
  dossierId: string;
  createdAt: string;
  updatedAt: string;
  transmissionDocumentTypes: TransmissionDocumentType[];
}

export interface TransmissionPublic {
  id: string;
  token: string;
  expireAt: string | null;
  revoked: boolean;
  dossierId: string;
  createdAt: string;
  updatedAt: string;
  transmissionDocumentTypes: TransmissionDocumentType[];
  personnes: Array<{
    id: string;
    nom: string;
    prenom: string;
    email: string | null;
    statut: { id: string; nom: string };
  }>;
  documents: Array<Document & {
    personne: { id: string; nom: string; prenom: string };
    typeDocument: DocumentType;
  }>;
}

export interface CreateTransmissionData {
  documentTypeIds: string[];
  expireAt?: string;
}

export const transmissionsApi = {
  create: (data: CreateTransmissionData) =>
    apiClient
      .post<Transmission>('/dossier/transmissions', data)
      .then((r) => r.data),

  list: () =>
    apiClient
      .get<Transmission[]>('/dossier/transmissions')
      .then((r) => r.data),

  revoke: (id: string) =>
    apiClient
      .patch<Transmission>(`/dossier/transmissions/${id}/revoke`)
      .then((r) => r.data),

  getByToken: (token: string) =>
    publicClient
      .get<TransmissionPublic>(`/transmissions/${token}`)
      .then((r) => r.data),

  getDocumentDownloadUrl: (token: string, documentId: string) =>
    `/transmissions/${token}/documents/${documentId}/download`,
};
