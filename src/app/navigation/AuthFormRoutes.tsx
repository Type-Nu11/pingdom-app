import React from 'react';
import useLogin from '../../features/auth/hooks/useLogin';
import useSignup from '../../features/auth/hooks/useSignup';
import { LoginFormScreen, SignUpDetailsScreen, type SignupOnboardingContext } from '../../v2/modules/onboarding';

export function LoginRoute(props: Pick<React.ComponentProps<typeof LoginFormScreen>, 'onBack' | 'onSignup'>) {
  const login = useLogin();
  return <LoginFormScreen {...props} {...login} />;
}

type SignupRouteProps = {
  onBack?: () => void;
  onboardingData?: Omit<SignupOnboardingContext, 'entryVariant'>;
};

export function SignupRoute({ onBack, onboardingData }: SignupRouteProps) {
  const login = useLogin();
  const signup = useSignup();
  return (
    <SignUpDetailsScreen
      onBack={onBack}
      isSubmitting={signup.isSubmitting || login.isSubmitting}
      signupErrorMessage={signup.errorMessage}
      submitErrorMessage={signup.errorMessage ?? login.errorMessage}
      clearErrors={() => {
        signup.clearError();
        login.clearError();
      }}
      onSubmit={async ({ username, email, password }) => {
        const result = await signup.signup({
          username, email, password,
          birthYear: onboardingData?.birthYear,
          country: onboardingData?.country,
          language: onboardingData?.language,
        });
        if (result) await login.login({ username, password });
      }}
    />
  );
}
