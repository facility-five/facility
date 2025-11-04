# Estilos de Foco dos Inputs

Este documento descreve as classes CSS reutilizáveis criadas para padronizar o estilo de foco dos elementos de input no projeto.

## Classes CSS Criadas

### Classes Base

#### `input-focus-base`
Classe base que define as propriedades comuns de foco para todos os inputs:
- Remove outline padrão
- Adiciona transição suave de 0.3s
- Define ring offset para background

#### `input-focus-primary`
Classe que aplica a cor primária do tema no estado de foco:
- Utiliza `focus-visible:ring-focus` para cor roxa (#6A4CFF)
- Ring com 2px de espessura
- Ring offset de 2px

#### `input-focus-admin`
Classe específica para elementos no contexto administrativo:
- Utiliza `focus:ring-focus` para elementos que não suportam `focus-visible`
- Mesmas propriedades da classe primary

### Classes Específicas por Tipo

#### `input-text-focus`
Aplicada aos componentes `Input` (text, email, password, etc.):
- Combina `input-focus-base` e `input-focus-primary`
- Utiliza `focus-visible:ring-focus`

#### `input-textarea-focus`
Aplicada aos componentes `Textarea`:
- Combina `input-focus-base` e `input-focus-primary`
- Utiliza `focus-visible:ring-focus`

#### `input-select-focus`
Aplicada aos componentes `Select`:
- Combina `input-focus-base` e `input-focus-admin`
- Utiliza `focus:ring-focus` (Select não suporta focus-visible)

## Componentes Atualizados

### Input (`src/components/ui/input.tsx`)
- Substituída classe `focus-visible:ring-primary` por `input-text-focus`
- Aplica transição suave e cor de foco consistente

### Textarea (`src/components/ui/textarea.tsx`)
- Substituída classe `focus-visible:ring-primary` por `input-textarea-focus`
- Aplica transição suave e cor de foco consistente

### Select (`src/components/ui/select.tsx`)
- Substituída classe `focus:ring-primary` por `input-select-focus`
- Aplica transição suave e cor de foco consistente

## Outros Componentes Verificados

Os seguintes componentes já utilizam o estilo de foco correto (`focus-visible:ring-ring`):
- **Button**: Utiliza `focus-visible:ring-ring` corretamente
- **Checkbox**: Utiliza `focus-visible:ring-ring` corretamente
- **RadioGroup**: Utiliza `focus-visible:ring-ring` corretamente
- **Switch**: Utiliza `focus-visible:ring-ring` corretamente

## Configuração de Cores

### Tailwind Config (`tailwind.config.ts`)
Adicionada nova cor `focus` com as seguintes definições:
```typescript
focus: {
  DEFAULT: "#6A4CFF",
  ring: "#6A4CFF"
}
```

### CSS Global (`src/globals.css`)
As variáveis CSS `--ring` já estavam definidas corretamente para suportar a nova cor de foco.

## Benefícios

1. **Consistência Visual**: Todos os inputs agora utilizam a mesma cor e estilo de foco
2. **Transições Suaves**: Transição de 0.3s para mudanças de estado
3. **Manutenibilidade**: Classes CSS reutilizáveis facilitam futuras alterações
4. **Acessibilidade**: Foco visível e consistente melhora a experiência do usuário
5. **Compatibilidade**: Testado em diferentes navegadores via HMR

## Uso

Para aplicar o estilo de foco em novos componentes de input:

```tsx
// Para inputs de texto
<input className="input-text-focus" />

// Para textareas
<textarea className="input-textarea-focus" />

// Para selects
<select className="input-select-focus" />
```

## Manutenção

Para alterar a cor de foco globalmente:
1. Modifique a cor `focus` no `tailwind.config.ts`
2. As classes CSS automaticamente utilizarão a nova cor
3. Não é necessário alterar componentes individuais