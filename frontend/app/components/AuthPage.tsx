import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthPageProps {
  isLogin?: boolean;
}

export function AuthPage({ isLogin }: AuthPageProps) {
  const [isLoginState, setIsLoginState] = useState(isLogin ?? true);

  return isLoginState ? (
    <LoginForm onSwitchToRegister={() => setIsLoginState(false)} />
  ) : (
    <RegisterForm onSwitchToLogin={() => setIsLoginState(true)} />
  );
}
