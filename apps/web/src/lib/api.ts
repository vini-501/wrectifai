export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? 'default';

export type AuthLoginPageContent = {
  appName: string;
  authModeLabel: string;
  hero: {
    kicker: string;
    title: string;
    body: string;
  };
  links: {
    needAccountPrefix: string;
    needAccountCta: string;
  };
  form: {
    title: string;
    subtitle: string;
    phoneLabel: string;
    phonePlaceholder: string;
    sendOtpLabel: string;
    sendingOtpLabel: string;
  };
  errors: {
    phoneInvalid: string;
    sendOtpFailed: string;
    unexpected: string;
  };
};

export type AuthRegisterPageContent = {
  appName: string;
  authModeLabel: string;
  hero: {
    kicker: string;
    title: string;
    body: string;
  };
  links: {
    haveAccountPrefix: string;
    haveAccountCta: string;
  };
  form: {
    title: string;
    subtitle: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    termsLabel: string;
    createAccountLabel: string;
    sendingOtpLabel: string;
  };
  errors: {
    fullNameRequired: string;
    phoneInvalid: string;
    termsRequired: string;
    sendOtpFailed: string;
    unexpected: string;
  };
};

export type AuthVerifyPageContent = {
  appName: string;
  authModeLabel: string;
  hero: {
    kicker: string;
    title: string;
    body: string;
  };
  links: {
    backToPrefix: string;
    backToRegisterCta: string;
    backToLoginCta: string;
  };
  form: {
    title: string;
    subtitleTemplate: string;
    otpLabel: string;
    otpPlaceholder: string;
    ctaLabel: string;
    ctaLoadingLabel: string;
  };
  errors: {
    otpInvalid: string;
    verifyFailed: string;
    unexpected: string;
  };
};

export type AuthPageContentMap = {
  login: AuthLoginPageContent;
  register: AuthRegisterPageContent;
  verify: AuthVerifyPageContent;
};

export type AuthPage = keyof AuthPageContentMap;

async function getUIContent<T>(params: {
  module: string;
  page: string;
  locale?: string;
  tenantId?: string;
  fallback: T;
}): Promise<T> {
  const query = new URLSearchParams({
    module: params.module,
    page: params.page,
    locale: params.locale ?? 'en-US',
    tenant_id: params.tenantId ?? TENANT_ID,
  });

  try {
    const response = await fetch(`${API_BASE_URL}/ui-content?${query.toString()}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to load UI content (${response.status})`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.warn('[web] using fallback ui content:', error);
    return params.fallback;
  }
}

const AUTH_DEFAULTS: AuthPageContentMap = {
  login: {
    appName: 'WrectifAI',
    authModeLabel: 'Phone + OTP authentication',
    hero: {
      kicker: 'AUTOMOTIVE INTELLIGENCE',
      title: 'Experience Surgical Precision in Car Care.',
      body: 'Join the elite ecosystem of automotive specialists and enthusiasts.',
    },
    links: {
      needAccountPrefix: 'Need an account?',
      needAccountCta: 'Register',
    },
    form: {
      title: 'Welcome Back',
      subtitle: 'Login with your 10-digit phone number.',
      phoneLabel: 'Phone Number *',
      phonePlaceholder: '9876543210',
      sendOtpLabel: 'Send OTP',
      sendingOtpLabel: 'Sending OTP...',
    },
    errors: {
      phoneInvalid: 'Phone number must be 10 digits',
      sendOtpFailed: 'Unable to send OTP',
      unexpected: 'Unexpected error',
    },
  },
  register: {
    appName: 'WrectifAI',
    authModeLabel: 'Phone + OTP authentication',
    hero: {
      kicker: 'AUTOMOTIVE INTELLIGENCE',
      title: 'Experience Surgical Precision in Car Care.',
      body: 'Join the elite ecosystem of automotive specialists and enthusiasts.',
    },
    links: {
      haveAccountPrefix: 'Already have an account?',
      haveAccountCta: 'Login',
    },
    form: {
      title: 'Create Account',
      subtitle: 'Start your journey with WrectifAI precision today.',
      fullNameLabel: 'Full Name *',
      fullNamePlaceholder: 'John Doe',
      phoneLabel: 'Phone Number *',
      phonePlaceholder: '9876543210',
      termsLabel: 'I agree to the Terms and Privacy Policy *',
      createAccountLabel: 'Create Account',
      sendingOtpLabel: 'Sending OTP...',
    },
    errors: {
      fullNameRequired: 'Full name is required',
      phoneInvalid: 'Phone number must be 10 digits',
      termsRequired: 'Please accept terms to continue',
      sendOtpFailed: 'Unable to send OTP',
      unexpected: 'Unexpected error',
    },
  },
  verify: {
    appName: 'WrectifAI',
    authModeLabel: 'Phone + OTP authentication',
    hero: {
      kicker: 'AUTOMOTIVE INTELLIGENCE',
      title: 'Verify Your Secure Access.',
      body: 'Security check for your account session.',
    },
    links: {
      backToPrefix: 'Back to',
      backToRegisterCta: 'Register',
      backToLoginCta: 'Login',
    },
    form: {
      title: 'Verify OTP',
      subtitleTemplate: 'Please enter 6 digit OTP sent to {phone}.',
      otpLabel: 'OTP',
      otpPlaceholder: 'Please enter 6 digit OTP',
      ctaLabel: 'Verify and Continue',
      ctaLoadingLabel: 'Verifying...',
    },
    errors: {
      otpInvalid: 'OTP must be 6 digits',
      verifyFailed: 'Unable to verify OTP',
      unexpected: 'Unexpected error',
    },
  },
};

export async function getAuthPageContent<TPage extends AuthPage>(
  page: TPage,
  options?: { locale?: string; tenantId?: string }
): Promise<AuthPageContentMap[TPage]> {
  return getUIContent<AuthPageContentMap[TPage]>({
    module: 'auth',
    page,
    locale: options?.locale,
    tenantId: options?.tenantId,
    fallback: AUTH_DEFAULTS[page],
  });
}
