import { AuthHeroPanel } from '@/components/auth/AuthHeroPanel';
import { AuthFormPanel } from '@/components/auth/AuthFormPanel';

export default function AuthPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[55fr_45fr]">
      <AuthHeroPanel />
      <AuthFormPanel />
    </div>
  );
}
