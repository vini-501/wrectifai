export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

export type AuthRuntimeContent = {
  appIdentity: { name?: string; tagline?: string };
  copy: Record<string, string>;
  roleOptions: Array<{ code: 'user' | 'garage' | 'vendor'; label: string; description: string }>;
  authRules: {
    phoneDigits: number;
    otpDigits: number;
    registerRoles: string[];
    loginRoleSelectionAllowed: boolean;
  };
};

const DEFAULT_AUTH_RUNTIME_CONTENT: AuthRuntimeContent = {
  appIdentity: { name: 'WrectifAI', tagline: 'Automotive Intelligence' },
  copy: {},
  roleOptions: [
    { code: 'user', label: 'User', description: '' },
    { code: 'garage', label: 'Garage', description: '' },
    { code: 'vendor', label: 'Vendor', description: '' },
  ],
  authRules: {
    phoneDigits: 10,
    otpDigits: 6,
    registerRoles: ['user', 'garage', 'vendor'],
    loginRoleSelectionAllowed: false,
  },
};

export async function getAuthRuntimeContent(): Promise<AuthRuntimeContent> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register/content`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to load runtime content (status ${response.status})`);
    }
    return response.json() as Promise<AuthRuntimeContent>;
  } catch (error) {
    console.warn('[web] using fallback auth runtime content:', error);
    return DEFAULT_AUTH_RUNTIME_CONTENT;
  }
}
