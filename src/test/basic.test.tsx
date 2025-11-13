import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Teste simples para verificar se o ambiente de teste está funcionando
describe('Teste básico', () => {
  it('deve passar um teste simples', () => {
    expect(1 + 1).toBe(2)
  })

  it('deve renderizar um componente React simples', () => {
    const SimpleComponent = () => <div>Hello World</div>
    render(<SimpleComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})