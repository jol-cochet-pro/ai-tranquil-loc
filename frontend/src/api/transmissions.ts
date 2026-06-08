import { apiClient } from "./client";
import type { DocumentType } from "./configuration";

export interface Transmission {
  id: string;
  token: string;
  expireAt: string | null;
  revoked: boolean;
  dossierId: string;
  createdAt: string;
  updatedAt: string;
  transmissionDocumentTypes: {
    documentTypeId: string;
    documentType: DocumentType;
  }[];
}

export interface CreateTransmissionDto {
  documentTypeIds: string[];
  expireInDays?: number;
}

export const transmissionsApi = {
  create: (data: CreateTransmissionDto) =>
    apiClient
      .post<Transmission>("/dossier/transmissions", data)
      .then((r) => r.data),

  list: () =>
    apiClient
      .get<Transmission[]>("/dossier/transmissions")
      .then((r) => r.data),

  revoke: (id: string) =>
    apiClient
      .patch<Transmission>(`/dossier/transmissions/${id}/revoke`)
      .then((r) => r.data),
};
