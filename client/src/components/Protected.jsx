import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

const ADMIN_ROLES = ['admin', 'super_admin'];

export function SignedInOnly({ children }) {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded)
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  if (!isSignedIn) return <Navigate to="/" replace />;
  return children;
}

export function AdminOnly({ children }) {
  const { isSignedIn, isLoaded, user } = useUser();
  if (!isLoaded)
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  const role = user?.publicMetadata?.role || 'user';
  if (!isSignedIn || !ADMIN_ROLES.includes(role)) return <Navigate to="/" replace />;
  return children;
}
