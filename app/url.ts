export function getQueryParameter(param: string): string | null {
  const url = new URL(window.location.href);
  return url.searchParams.get(param);
}

export function generateUrl(params: { [param: string]: string }): string {
  const url = new URL(window.location.href);
  for (const [param, val] of Object.entries(params)) {
    if (val) {
      url.searchParams.set(param, val);
    }
  }
  return url.toString();
}
