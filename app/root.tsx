import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import PrivyAuthProvider from '../src/contexts/PrivyContext'
import ThemeProvider from '../src/contexts/ThemeContext'
import '../src/index.css'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <PrivyAuthProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
          <Outlet />
        </div>
      </ThemeProvider>
    </PrivyAuthProvider>
  )
}
