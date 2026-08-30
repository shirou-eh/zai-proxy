/**
 * OpenAI SDK transport headers (User-Agent + X-Stainless-*), matching the
 * openai npm package (v6.39.1) bundled with the real AutoClaw gateway.
 * See node_modules/openai/client.js buildHeaders() and internal/detect-platform.js.
 */

export const OPENAI_SDK_VERSION = '6.39.1';

function normalizePlatform(platform: string): string {
  switch (platform) {
    case 'darwin':
      return 'MacOS';
    case 'win32':
      return 'Windows';
    case 'linux':
      return 'Linux';
    case 'freebsd':
      return 'FreeBSD';
    case 'openbsd':
      return 'OpenBSD';
    case 'android':
      return 'Android';
    default:
      return platform ? `Other:${platform}` : 'Unknown';
  }
}

function normalizeArch(arch: string): string {
  if (arch === 'x32' || arch === 'x86') return 'x32';
  if (arch === 'x86_64' || arch === 'x64') return 'x64';
  if (arch === 'arm') return 'arm';
  if (arch === 'aarch64' || arch === 'arm64') return 'arm64';
  return arch ? `other:${arch}` : 'unknown';
}

export function buildSdkHeaders(timeoutSeconds?: number): Record<string, string> {
  const headers: Record<string, string> = {
    // getUserAgent(): `${this.constructor.name}/JS ${VERSION}` -> "OpenAI/JS 6.39.1"
    'User-Agent': `OpenAI/JS ${OPENAI_SDK_VERSION}`,
    'X-Stainless-Lang': 'js',
    'X-Stainless-Package-Version': OPENAI_SDK_VERSION,
    'X-Stainless-OS': normalizePlatform(process.platform),
    'X-Stainless-Arch': normalizeArch(process.arch),
    'X-Stainless-Runtime': 'node',
    'X-Stainless-Runtime-Version': process.version,
  };
  if (timeoutSeconds !== undefined && Number.isFinite(timeoutSeconds) && timeoutSeconds > 0) {
    headers['X-Stainless-Timeout'] = String(Math.trunc(timeoutSeconds));
  }
  return headers;
}
