import { LoginForm } from '@/components/auth/LoginForm';
import { AuthShell } from '@/components/layout/AuthShell';

export default function LoginScreen() {
  return (
    <AuthShell
      maxWidth={460}
      quote="Retrouve ton dossier et tes consultations en quelques secondes."
    >
      <LoginForm />
    </AuthShell>
  );
}