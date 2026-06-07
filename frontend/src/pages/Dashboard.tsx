import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { account, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header>
        <h1>Mon Dossier Locatif</h1>
        <div>
          <span>{account?.email}</span>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>
      <main>
        <p>Bienvenue sur votre tableau de bord.</p>
      </main>
    </div>
  );
}
