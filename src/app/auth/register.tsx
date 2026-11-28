import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Master } from "@/components/layout";

export default function RegisterScreen() {
  return (
    <Master title="Inscription">
      <AuthCard maxWidth={560}>
        <RegisterForm />
      </AuthCard>
    </Master>
  );
}
