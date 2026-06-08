import { describe, it, expect, vi, beforeEach } from 'vitest';
import { personnesApi } from '../src/api/personnes';

const mockClient = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../src/api/client', () => ({
  apiClient: mockClient,
}));

describe('personnesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list() returns personnes', async () => {
    const data = [{ id: '1', nom: 'Dupont', statut: { nom: 'Salarié' } }];
    mockClient.get.mockResolvedValue({ data });

    const result = await personnesApi.list();
    expect(result).toEqual(data);
    expect(mockClient.get).toHaveBeenCalledWith('/personnes');
  });

  it('create() posts a new personne', async () => {
    const dto = { nom: 'Dupont', prenom: 'Jean', typeLogement: 'locataire' as const, statutId: 's1' };
    const created = { id: '1', ...dto, dossierId: 'd1' };
    mockClient.post.mockResolvedValue({ data: created });

    const result = await personnesApi.create(dto);
    expect(result).toEqual(created);
    expect(mockClient.post).toHaveBeenCalledWith('/personnes', dto);
  });

  it('update() patches a personne', async () => {
    const data = { nom: 'Martin' };
    const updated = { id: '1', nom: 'Martin', statut: { nom: 'Étudiant' } };
    mockClient.patch.mockResolvedValue({ data: updated });

    const result = await personnesApi.update('1', data);
    expect(result).toEqual(updated);
    expect(mockClient.patch).toHaveBeenCalledWith('/personnes/1', data);
  });

  it('delete() removes a personne', async () => {
    mockClient.delete.mockResolvedValue({});

    await personnesApi.delete('1');
    expect(mockClient.delete).toHaveBeenCalledWith('/personnes/1');
  });
});
