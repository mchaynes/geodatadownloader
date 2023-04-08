export function getQueryParameter(param: string): string | null {
    const url = new URL(window.location.href);
    return url.searchParams.get(param);
}

export function setQueryParameter(params: { [param: string]: string }): void {
    const url = new URL(window.location.href);
    for (const [param, val] of Object.entries(params)) {
        url.searchParams.set(param, val);
    }
    window.location.replace(url.toString());
}
