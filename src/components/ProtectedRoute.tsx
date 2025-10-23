// ProtectedRoute is no longer needed as all pages are public.
// This file can be safely deleted if no other components rely on it.
// For now, it's kept as an empty placeholder to avoid import errors.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default ProtectedRoute;