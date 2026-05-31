interface EnvSchema {
  VITE_PRIVY_APP_ID: string
  VITE_PRIVY_CLIENT_ID: string
  VITE_ALCHEMY_API_KEY: string
}

const DEFAULTS: Partial<EnvSchema> = {
  VITE_PRIVY_APP_ID: 'your-privy-app-id',
  VITE_PRIVY_CLIENT_ID: 'your-app-client-id',
  VITE_ALCHEMY_API_KEY: '',
}

function getEnvVar<K extends keyof EnvSchema>(key: K): EnvSchema[K] {
  const val = import.meta.env[key] as string | undefined
  return (val ?? DEFAULTS[key]) as EnvSchema[K]
}

export const env: EnvSchema = {
  VITE_PRIVY_APP_ID: getEnvVar('VITE_PRIVY_APP_ID'),
  VITE_PRIVY_CLIENT_ID: getEnvVar('VITE_PRIVY_CLIENT_ID'),
  VITE_ALCHEMY_API_KEY: getEnvVar('VITE_ALCHEMY_API_KEY'),
}
