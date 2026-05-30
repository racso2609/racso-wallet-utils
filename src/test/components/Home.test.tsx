import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Home from '../../../app/routes/_index'
import ThemeProvider from '../../contexts/ThemeContext'

describe('Home page', () => {
  it('renders the hello heading', () => {
    render(
      <ThemeProvider>
        <Home />
      </ThemeProvider>,
    )
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('has a theme toggle button', () => {
    render(
      <ThemeProvider>
        <Home />
      </ThemeProvider>,
    )
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })
})
