import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from '@remix-run/react'
import type { LinksFunction, MetaFunction } from '@remix-run/node'

import { ErrorBoundary as CustomErrorBoundary } from './src/domains/shared/components/ErrorBoundary'
import { logError } from './src/domains/shared/utils/errorHandler'
import './styles/global.css'

export const meta: MetaFunction = () => [
  { title: 'Travel Planning App' },
  { name: 'description', content: 'Plan your trips with weather integration' },
  { name: 'viewport', content: 'width=device-width,initial-scale=1' },
]

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
]

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
        <CustomErrorBoundary
          onError={(error, errorInfo) => {
            logError(error, 'App Layout Error')
            console.error('Layout error details:', errorInfo)
          }}
        >
          {children}
        </CustomErrorBoundary>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <CustomErrorBoundary
      onError={(error) => {
        logError(error, 'App Root Error')
      }}
    >
      <Outlet />
    </CustomErrorBoundary>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    logError(new Error(`${error.status} ${error.statusText}`), 'Route Error')
    
    return (
      <div className="route-error">
        <h1>Oops! Something went wrong</h1>
        <p>
          {error.status === 404
            ? "The page you're looking for doesn't exist."
            : `Error ${error.status}: ${error.statusText}`}
        </p>
        <a href="/" style={{ 
          color: '#3b82f6', 
          textDecoration: 'underline',
          marginTop: '1rem',
          display: 'inline-block'
        }}>
          Go back to home
        </a>
      </div>
    )
  }

  const errorObj = error instanceof Error ? error : new Error('Unknown route error')
  logError(errorObj, 'Route Error Boundary')

  return (
    <div className="route-error">
      <h1>Application Error</h1>
      <p>Something unexpected happened. Please try refreshing the page.</p>
      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop: '1rem' }}>
          <summary>Error Details (Development Only)</summary>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '1rem', 
            overflow: 'auto',
            fontSize: '0.875rem'
          }}>
            {errorObj.stack}
          </pre>
        </details>
      )}
      <a href="/" style={{ 
        color: '#3b82f6', 
        textDecoration: 'underline',
        marginTop: '1rem',
        display: 'inline-block'
      }}>
        Go back to home
      </a>
    </div>
  )
}
