export type UIContentQueryInput = {
  tenantId?: string;
  module: string;
  page: string;
  locale?: string;
};

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
