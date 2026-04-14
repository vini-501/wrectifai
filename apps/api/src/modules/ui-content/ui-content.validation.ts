import type {
  AuthLoginPageContent,
  AuthPage,
  AuthRegisterPageContent,
  AuthVerifyPageContent,
} from './ui-content.types';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isAuthLoginPageContent(value: unknown): value is AuthLoginPageContent {
  if (!isObject(value)) return false;
  if (!isString(value.appName) || !isString(value.authModeLabel)) return false;

  const hero = value.hero;
  const links = value.links;
  const form = value.form;
  const errors = value.errors;

  return (
    isObject(hero) &&
    isString(hero.kicker) &&
    isString(hero.title) &&
    isString(hero.body) &&
    isObject(links) &&
    isString(links.needAccountPrefix) &&
    isString(links.needAccountCta) &&
    isObject(form) &&
    isString(form.title) &&
    isString(form.subtitle) &&
    isString(form.phoneLabel) &&
    isString(form.phonePlaceholder) &&
    isString(form.sendOtpLabel) &&
    isString(form.sendingOtpLabel) &&
    isObject(errors) &&
    isString(errors.phoneInvalid) &&
    isString(errors.sendOtpFailed) &&
    isString(errors.unexpected)
  );
}

function isAuthRegisterPageContent(value: unknown): value is AuthRegisterPageContent {
  if (!isObject(value)) return false;
  if (!isString(value.appName) || !isString(value.authModeLabel)) return false;

  const hero = value.hero;
  const links = value.links;
  const form = value.form;
  const errors = value.errors;

  return (
    isObject(hero) &&
    isString(hero.kicker) &&
    isString(hero.title) &&
    isString(hero.body) &&
    isObject(links) &&
    isString(links.haveAccountPrefix) &&
    isString(links.haveAccountCta) &&
    isObject(form) &&
    isString(form.title) &&
    isString(form.subtitle) &&
    isString(form.fullNameLabel) &&
    isString(form.fullNamePlaceholder) &&
    isString(form.phoneLabel) &&
    isString(form.phonePlaceholder) &&
    isString(form.termsLabel) &&
    isString(form.createAccountLabel) &&
    isString(form.sendingOtpLabel) &&
    isObject(errors) &&
    isString(errors.fullNameRequired) &&
    isString(errors.phoneInvalid) &&
    isString(errors.termsRequired) &&
    isString(errors.sendOtpFailed) &&
    isString(errors.unexpected)
  );
}

function isAuthVerifyPageContent(value: unknown): value is AuthVerifyPageContent {
  if (!isObject(value)) return false;
  if (!isString(value.appName) || !isString(value.authModeLabel)) return false;

  const hero = value.hero;
  const links = value.links;
  const form = value.form;
  const errors = value.errors;

  return (
    isObject(hero) &&
    isString(hero.kicker) &&
    isString(hero.title) &&
    isString(hero.body) &&
    isObject(links) &&
    isString(links.backToPrefix) &&
    isString(links.backToRegisterCta) &&
    isString(links.backToLoginCta) &&
    isObject(form) &&
    isString(form.title) &&
    isString(form.subtitleTemplate) &&
    isString(form.otpLabel) &&
    isString(form.otpPlaceholder) &&
    isString(form.ctaLabel) &&
    isString(form.ctaLoadingLabel) &&
    isObject(errors) &&
    isString(errors.otpInvalid) &&
    isString(errors.verifyFailed) &&
    isString(errors.unexpected)
  );
}

export function validateAuthPageContent(page: AuthPage, content: unknown) {
  if (page === 'login') return isAuthLoginPageContent(content);
  if (page === 'register') return isAuthRegisterPageContent(content);
  return isAuthVerifyPageContent(content);
}
