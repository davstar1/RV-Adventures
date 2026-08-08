const GITHUB_PHOTO_ROOT = 'https://raw.githubusercontent.com/davstar1/rv-adventures/main/public';

export function resolveMediaUrl(value) {
  const url = String(value || '').trim();

  if (!url) return '';

  if (/^(data:|blob:|https?:\/\/)/i.test(url)) {
    return url;
  }

  if (url.startsWith('/photos/')) {
    return encodeURI(`${GITHUB_PHOTO_ROOT}${url}`);
  }

  return url;
}
