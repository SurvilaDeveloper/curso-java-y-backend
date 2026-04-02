//src/lib/paths.ts
export const withBase = (
    path: string,
    baseUrl: string = import.meta.env.BASE_URL,
) => {
    const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${cleanPath}`;
};