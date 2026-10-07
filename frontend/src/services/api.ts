const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export const resolveMediaUrl = (url: string): string => {
  if (!url.startsWith("/")) return url;
  const apiOrigin = API_URL.replace(/\/api\/?$/, "");
  return `${apiOrigin}${url}`;
};

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const headers = new Headers(options.headers);
  if (options.body instanceof FormData) {
    headers.delete("Content-Type");
  } else if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong",
    );
  }

  return data;
};