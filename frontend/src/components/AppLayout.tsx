import { useState, useCallback } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { cn } from "../lib/utils"

type Tab = {
  label: string
  to: string
}

const TABS: Tab[] = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Candidats", to: "/candidats" },
  { label: "Garants", to: "/garants" },
  { label: "Transmissions", to: "/transmissions" },
]

function isPublicRoute(pathname: string) {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/invitation")
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { account, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = useCallback(() => {
    logout()
    navigate("/login")
  }, [logout, navigate])

  if (isPublicRoute(location.pathname)) {
    return <>{children}</>
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-muted",
    )

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold text-foreground mr-4 hidden sm:inline">
              Dossier Locatif
            </span>
            <div className="hidden sm:flex items-center gap-1">
              {TABS.map((tab) => (
                <NavLink key={tab.to} to={tab.to} className={linkClass} end={tab.to === "/dashboard"}>
                  {tab.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <span className="max-w-[120px] truncate">{account?.email}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-card shadow-lg z-20 py-1">
                    <button
                      onClick={() => { setProfileOpen(false); navigate("/parametres") }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Paramètres
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); handleLogout() }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="sm:hidden border-t border-border bg-background px-4 py-2 space-y-1">
            <span className="block text-sm font-semibold text-foreground px-3 py-2">
              Dossier Locatif
            </span>
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={linkClass}
                end={tab.to === "/dashboard"}
                onClick={() => setMobileOpen(false)}
              >
                {tab.label}
              </NavLink>
            ))}
            <hr className="border-border my-2" />
            <NavLink
              to="/parametres"
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              Paramètres
            </NavLink>
            <button
              onClick={() => { setMobileOpen(false); handleLogout() }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
        )}
      </nav>

      <main className="flex-1">{children}</main>
    </div>
  )
}
