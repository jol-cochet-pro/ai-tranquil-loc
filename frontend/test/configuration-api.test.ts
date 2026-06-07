import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configurationApi } from '../src/api/configuration';

const mockClient = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('../src/api/client', () => ({
  apiClient: mockClient,
}));

describe('configurationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('statuts() returns statuts', async () => {
    const data = [{ id: 's1', nom: 'Salarié' }, { id: 's2', nom: 'Étudiant' }];
    mockClient.get.mockResolvedValue({ data });

    const result = await configurationApi.statuts();
    expect(result).toEqual(data);
    expect(mockClient.get).toHaveBeenCalledWith('/configuration/statuts');
  });

  it('documentsForStatut() returns document types', async () => {
    const data = [{ id: 'd1', nom: "Pièce d'identité" }];
    mockClient.get.mockResolvedValue({ data });

    const result = await configurationApi.documentsForStatut('s1');
    expect(result).toEqual(data);
    expect(mockClient.get).toHaveBeenCalledWith('/configuration/statuts/s1/documents');
  });

  it('documentTypes() returns all document types', async () => {
    const data = [{ id: 'd1', nom: "Pièce d'identité" }];
    mockClient.get.mockResolvedValue({ data });

    const result = await configurationApi.documentTypes();
    expect(result).toEqual(data);
    expect(mockClient.get).toHaveBeenCalledWith('/configuration/document-types');
  });
});
