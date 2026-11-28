import { AuthCard } from '@/components/auth/AuthCard';
import { LoginForm } from '@/components/auth/LoginForm';
import { Master } from '@/components/layout';

export default function LoginScreen() {
  return (
    <Master title="Connexion">
      <AuthCard maxWidth={460}>
        <LoginForm />
      </AuthCard>
    </Master>
  );
}