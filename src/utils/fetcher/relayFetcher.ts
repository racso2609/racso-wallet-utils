const RELAY_API_BASE_URL = 'https://api.relay.link'

export async function relayFetcher<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${RELAY_API_BASE_URL}${path}`

  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(
      `Relay API request failed: ${String(response.status)} ${response.statusText}`,
    )
  }

  return response.json() as Promise<T>
}
