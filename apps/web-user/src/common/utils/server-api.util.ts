const CONSUMER_API_PREFIX = "/v1/consumer";

/** metadata·sitemap 등 서버 전용 API fetch (axios/Zustand 미사용) */
export function getConsumerApiOrigin(): string | null {
  const domain = process.env.NEXT_PUBLIC_API_DOMAIN;
  if (!domain) return null;
  return domain.replace(/\/$/, "");
}

export async function fetchConsumerApi<T>(
  path: string,
  options?: { revalidate?: number },
): Promise<T | null> {
  const origin = getConsumerApiOrigin();
  if (!origin) return null;

  try {
    const response = await fetch(`${origin}${CONSUMER_API_PREFIX}${path}`, {
      next: { revalidate: options?.revalidate ?? 3600 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const body = (await response.json()) as { data?: T };
    return body.data ?? null;
  } catch {
    return null;
  }
}
