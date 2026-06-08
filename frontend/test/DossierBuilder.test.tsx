import { describe, it, expect, vi, beforeEach, type ReactNode } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext";
import { DossierBuilder } from "../src/pages/DossierBuilder";

const mockClient = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../src/api/client", () => ({
  apiClient: mockClient,
}));

function TestWrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          account: { id: "a1", email: "test@test.com" },
          isAuthenticated: true,
          isLoading: false,
          login: vi.fn() as unknown as (
            email: string,
            password: string,
          ) => Promise<{ accessToken: string; account: { id: string; email: string } }>,
          register: vi.fn() as unknown as (
            email: string,
            password: string,
          ) => Promise<{ accessToken: string; account: { id: string; email: string } }>,
          logout: vi.fn(),
        }}
      >
        {children}
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

const statuts = [
  { id: "s1", nom: "Salarié" },
  { id: "s2", nom: "Étudiant" },
];

describe("DossierBuilder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no personnes", async () => {
    mockClient.get.mockResolvedValueOnce({ data: [] });
    mockClient.get.mockResolvedValueOnce({ data: statuts });

    render(
      <TestWrapper>
        <DossierBuilder />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Aucune personne/)).toBeDefined();
    });
  });
});
