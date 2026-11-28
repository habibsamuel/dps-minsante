import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthShell } from '@/components/layout/AuthShell';

export default function RegisterScreen() {
  return (
    <AuthShell
      maxWidth={560}
      quote="Chaque personne mérite un accès simple et rapide à des soins de qualité."
    >
      <RegisterForm />
    </AuthShell>
  );
}