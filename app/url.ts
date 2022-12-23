export function getQueryParameter(param: string): string | null {
    const url = new URL(window.location.href)
    return url.searchParams.get(param)
}
