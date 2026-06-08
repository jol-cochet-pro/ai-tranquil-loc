import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { authApi } from "../api/auth"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

export function Settings() {
  const { account, logout } = useAuth()

  const [newEmail, setNewEmail] = useState("")
  const [emailPassword, setEmailPassword] = useState("")
  const [emailMsg, setEmailMsg] = useState("")
  const [emailErr, setEmailErr] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordMsg, setPasswordMsg] = useState("")
  const [passwordErr, setPasswordErr] = useState("")

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailMsg("")
    setEmailErr("")
    try {
      const result = await authApi.changeEmail({ newEmail, password: emailPassword })
      setEmailMsg(`Email modifié en ${result.email}`)
      setNewEmail("")
      setEmailPassword("")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors du changement d'email"
      setEmailErr(msg)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg("")
    setPasswordErr("")
    try {
      await authApi.changePassword({ currentPassword, newPassword })
      setPasswordMsg("Mot de passe modifié avec succès")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors du changement de mot de passe"
      setPasswordErr(msg)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Paramètres</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Changer l'email</CardTitle>
            <CardDescription>
              Adresse actuelle : {account?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">Nouvel email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailPassword">Mot de passe actuel</Label>
                <Input
                  id="emailPassword"
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  required
                />
              </div>
              {emailMsg && <p className="text-sm text-green-600">{emailMsg}</p>}
              {emailErr && <p className="text-sm text-destructive">{emailErr}</p>}
              <Button type="submit">Changer l'email</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changer le mot de passe</CardTitle>
            <CardDescription>
              Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              {passwordMsg && <p className="text-sm text-green-600">{passwordMsg}</p>}
              {passwordErr && <p className="text-sm text-destructive">{passwordErr}</p>}
              <Button type="submit">Changer le mot de passe</Button>
            </form>
          </CardContent>
        </Card>

        <div className="pt-4 border-t border-border">
          <Button variant="outline" onClick={logout}>
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  )
}
