# 🤝 Como Contribuir - ChainBallotX

Obrigado pelo interesse em contribuir com o ChainBallotX! Este guia te ajudará a fazer sua primeira contribuição da melhor forma.

## 📋 Índice

- [🎯 Como Contribuir](#-como-contribuir)
- [🔧 Setup para Desenvolvedores](#-setup-para-desenvolvedores)
- [📝 Padrões de Código](#-padrões-de-código)
- [🧪 Testes](#-testes)
- [📄 Documentação](#-documentação)
- [🐛 Reportar Bugs](#-reportar-bugs)
- [💡 Sugerir Features](#-sugerir-features)
- [📋 Pull Requests](#-pull-requests)
<!-- - [👥 Comunidade](#-comunidade) -->

## 🎯 Como Contribuir

### **Tipos de Contribuição Bem-vindas**

#### **🐛 Correção de Bugs**

- Correções de problemas na interface
- Fixes na integração blockchain
- Melhorias de performance
- Correções de documentação

#### **⭐ Novas Features**

- Melhorias na UX/UI
- Novas funcionalidades de votação
- Integrações com outras carteiras
- Features de governança avançada

#### **📚 Documentação**

- Melhorias nos guias existentes
- Novos tutoriais
- Tradução para outros idiomas
- Exemplos de código

#### **🧪 Testes**

- Unit tests para componentes
- Integration tests para fluxos
- E2E tests para funcionalidades
- Performance tests

#### **🎨 Design**

- Melhorias visuais
- Novos componentes UI
- Acessibilidade
- Responsividade

---

## 🔧 Setup para Desenvolvedores

### **1. Fork do Repositório**

```bash
# 1. Fork no GitHub (botão "Fork")
# 2. Clone seu fork
git clone https://github.com/SEU_USERNAME/chain-ballot-x.git
cd chain-ballot-x

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/REPO_ORIGINAL/chain-ballot-x.git

# 4. Verifique os remotes
git remote -v
```

### **2. Setup do Ambiente**

```bash
# Seguir o guia completo de setup
# Veja: docs/SETUP.md

# Versão resumida:
cd frontend
yarn install
cp .env.example .env.local
# Editar .env.local com suas configurações
yarn dev
```

### **3. Criar Branch para Feature**

```bash
# Sempre criar branch a partir da main atualizada
git checkout main
git pull upstream main

# Criar nova branch (use nome descritivo)
git checkout -b feature/nova-funcionalidade
# ou
git checkout -b bugfix/corrigir-problema
# ou  
git checkout -b docs/melhorar-readme
```

---

## 📝 Padrões de Código

### **TypeScript/React**

#### **Naming Conventions**

```typescript
// ✅ BOM
const ProposalCard = ({ proposal }: ProposalCardProps) => { /* */ };
const useProposals = () => { /* */ };
const handleVoteSubmit = () => { /* */ };
const isProposalActive = true;

// ❌ RUIM
const proposalcard = () => { /* */ };
const UseProposals = () => { /* */ };
const HandleVoteSubmit = () => { /* */ };
const IsProposalActive = true;
```

#### **Component Structure**

```typescript
// ✅ Estrutura recomendada
interface ProposalCardProps {
  proposal: ProposalData;
  onVote?: (id: number) => void;
}

const ProposalCard: FC<ProposalCardProps> = ({ 
  proposal, 
  onVote 
}) => {
  // 1. Hooks
  const [isVoting, setIsVoting] = useState(false);
  const { address } = useGetAccountInfo();
  
  // 2. Computed values
  const isExpired = proposal.endsAt < Date.now();
  const canVote = address && !isExpired;
  
  // 3. Event handlers
  const handleVote = useCallback(async () => {
    if (!canVote || !onVote) return;
    
    setIsVoting(true);
    try {
      await onVote(proposal.id);
    } finally {
      setIsVoting(false);
    }
  }, [canVote, onVote, proposal.id]);
  
  // 4. Render
  return (
    <div className="proposal-card">
      <h3>{proposal.title}</h3>
      <p>{proposal.description}</p>
      {canVote && (
        <button onClick={handleVote} disabled={isVoting}>
          {isVoting ? 'Votando...' : 'Votar'}
        </button>
      )}
    </div>
  );
};

export default ProposalCard;
```

#### **Hooks Personalizados**

```typescript
// ✅ Hook bem estruturado
const useProposalVoting = (proposalId: number) => {
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const { address } = useGetAccountInfo();
  const contractService = new ContractService();
  
  // Check vote status on mount
  useEffect(() => {
    if (!address) return;
    
    const checkVoteStatus = async () => {
      try {
        const voted = await contractService.hasVoted(address, proposalId);
        setHasVoted(voted);
      } catch (error) {
        console.error('Failed to check vote status:', error);
      }
    };
    
    checkVoteStatus();
  }, [address, proposalId, contractService]);
  
  const vote = useCallback(async () => {
    if (!address || hasVoted) return;
    
    setIsVoting(true);
    try {
      const transaction = {
        data: `vote@${proposalId.toString(16).padStart(16, '0')}`,
        receiver: contractAddress,
        gasLimit: '6000000',
        chainID: 'D'
      };
      
      await sendTransactions({ transactions: [transaction] });
      setHasVoted(true);
    } catch (error) {
      console.error('Vote failed:', error);
      throw error;
    } finally {
      setIsVoting(false);
    }
  }, [address, hasVoted, proposalId]);
  
  return {
    vote,
    isVoting,
    hasVoted,
    canVote: address && !hasVoted
  };
};
```

### **CSS/Tailwind**

#### **Class Organization**

```typescript
// ✅ BOM - Classes organizadas por categoria
<div className="
  flex items-center justify-between     // Layout
  p-4 mb-6                             // Spacing  
  bg-white border border-gray-200      // Background/Border
  rounded-lg shadow-md                 // Border radius/Shadow
  hover:shadow-lg transition-shadow   // Interactions
">
```

#### **Responsive Design**

```typescript
// ✅ Mobile first approach
<div className="
  flex flex-col           // Mobile: stack vertically
  md:flex-row           // Tablet+: horizontal
  lg:items-center       // Desktop: center align
  space-y-4             // Mobile: vertical spacing
  md:space-y-0 md:space-x-6  // Tablet+: horizontal spacing
">
```

### **Error Handling**

#### **Async Functions**

```typescript
// ✅ Proper error handling
const handleAsyncOperation = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const result = await riskyOperation();
    setData(result);
    
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : 'Erro desconhecido';
    
    setError(message);
    console.error('Operation failed:', error);
    
    // Optional: Send to error tracking
    errorTracker.captureException(error);
    
  } finally {
    setLoading(false);
  }
};
```

---

## 🧪 Testes

### **Unit Tests**

```typescript
// components/__tests__/ProposalCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProposalCard } from '../ProposalCard';
import { createMockProposal } from '../../utils/test-utils';

describe('ProposalCard', () => {
  const mockProposal = createMockProposal();
  const mockOnVote = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders proposal information correctly', () => {
    render(
      <ProposalCard 
        proposal={mockProposal} 
        onVote={mockOnVote} 
      />
    );

    expect(screen.getByText(mockProposal.title)).toBeInTheDocument();
    expect(screen.getByText(mockProposal.description)).toBeInTheDocument();
  });

  it('calls onVote when vote button is clicked', () => {
    render(
      <ProposalCard 
        proposal={mockProposal} 
        onVote={mockOnVote} 
      />
    );

    const voteButton = screen.getByRole('button', { name: /votar/i });
    fireEvent.click(voteButton);

    expect(mockOnVote).toHaveBeenCalledWith(mockProposal.id);
  });

  it('disables vote button when proposal is expired', () => {
    const expiredProposal = createMockProposal({
      endsAt: Date.now() - 1000 // 1 second ago
    });

    render(
      <ProposalCard 
        proposal={expiredProposal} 
        onVote={mockOnVote} 
      />
    );

    const voteButton = screen.getByRole('button', { name: /votar/i });
    expect(voteButton).toBeDisabled();
  });
});
```

### **Integration Tests**

```typescript
// flows/__tests__/voting-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VotingFlow } from '../VotingFlow';
import { MockDappProvider } from '../../utils/test-providers';

describe('Voting Flow', () => {
  it('completes full voting process', async () => {
    const user = userEvent.setup();
    
    render(
      <MockDappProvider isLoggedIn={true}>
        <VotingFlow />
      </MockDappProvider>
    );

    // 1. Find proposal
    const proposal = await screen.findByText('Test Proposal');
    expect(proposal).toBeInTheDocument();

    // 2. Click vote button
    const voteButton = screen.getByRole('button', { name: /votar/i });
    await user.click(voteButton);

    // 3. Confirm transaction
    const confirmButton = await screen.findByRole('button', { name: /confirmar/i });
    await user.click(confirmButton);

    // 4. Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/voto registrado/i)).toBeInTheDocument();
    });

    // 5. Verify button state changed
    expect(screen.getByText(/já votou/i)).toBeInTheDocument();
  });
});
```

### **Executar Testes**

```bash
# Rodar todos os testes
yarn test

# Testes em watch mode
yarn test --watch

# Testes com coverage
yarn test --coverage

# Testes específicos
yarn test ProposalCard
```

---

## 📄 Documentação

### **Comentários no Código**

```typescript
/**
 * Hook personalizado para gerenciar votação em propostas
 * 
 * @param proposalId - ID da proposta para votar
 * @returns Objeto com funções e estado de votação
 * 
 * @example
 * ```tsx
 * const { vote, isVoting, hasVoted } = useProposalVoting(1);
 * 
 * const handleClick = async () => {
 *   try {
 *     await vote();
 *     console.log('Voto registrado!');
 *   } catch (error) {
 *     console.error('Falha ao votar:', error);
 *   }
 * };
 * ```
 */
const useProposalVoting = (proposalId: number) => {
  // Implementation...
};
```

### **README para Novas Features**

```markdown
# Nova Feature: Sistema de Delegação

## Descrição
Permite que usuários deleguem seu poder de voto para outros usuários.

## Como Usar
```typescript
const { delegate, undelegate, delegations } = useDelegation();

// Delegar voto
await delegate('erd1targetaddress...', 100);

// Revogar delegação  
await undelegate('erd1targetaddress...');
```

## Impacto

- Aumenta participação na governança
- Permite especialização em áreas específicas
- Mantém descentralização

## Testes

```bash
yarn test src/features/delegation
```

## 🐛 Reportar Bugs

### **Template de Bug Report**

```markdown
**Título:** [BUG] Descrição curta do problema

**Descrição:**
Descrição clara do que deveria acontecer vs o que está acontecendo.

**Passos para Reproduzir:**
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

**Comportamento Esperado:**
O que deveria acontecer.

**Comportamento Atual:**
O que está acontecendo de errado.

**Screenshots:**
Se aplicável, adicione screenshots.

**Ambiente:**
- Browser: [ex: Chrome 91.0]
- Carteira: [ex: xPortal, Extension]
- Network: [ex: Devnet, Mainnet]
- Versão: [ex: 1.0.0]

**Logs do Console:**
```

Colar logs relevantes aqui

```bash

**Informações Adicionais:**
Qualquer outra informação relevante.
```

### **Como Reportar**

1. **Verificar** se o bug já foi reportado nas [Issues](https://github.com/REPO/issues)
2. **Criar nova issue** usando o template acima
3. **Adicionar labels** apropriadas (bug, high-priority, etc.)
4. **Fornecer máximo** de informações possível

---

## 💡 Sugerir Features

### **Template de Feature Request**

```markdown
**Título:** [FEATURE] Nome da funcionalidade

**Problema a Resolver:**
Que problema esta feature resolve?

**Solução Proposta:**
Descrição da solução que você gostaria.

**Alternativas Consideradas:**
Outras soluções que você considerou.

**Casos de Uso:**
- Como usuário, eu quero...
- Para que eu possa...

**Mockups/Wireframes:**
Se aplicável, adicione designs visuais.

**Impacto Técnico:**
- Componentes afetados
- Mudanças na API
- Migrações necessárias

**Prioridade:**
[ ] Low
[ ] Medium  
[ ] High
[ ] Critical
```

## 📋 Pull Requests

### **Checklist Antes de Submeter**

```markdown
- [ ] ✅ Código testado localmente
- [ ] ✅ Testes passando (`yarn test`)
- [ ] ✅ Build funcionando (`yarn build`)
- [ ] ✅ Lint sem erros (`yarn lint`)
- [ ] ✅ TypeScript sem erros (`yarn type-check`)
- [ ] ✅ Documentação atualizada (se necessário)
- [ ] ✅ Screenshots/GIFs para mudanças visuais
- [ ] ✅ Branch atualizada com main (`git rebase upstream/main`)
```

### **Template de Pull Request**

```markdown
## 🎯 Descrição
Breve descrição das mudanças.

## 🔧 Tipo de Mudança
- [ ] 🐛 Bug fix
- [ ] ⭐ Nova feature
- [ ] 💥 Breaking change
- [ ] 📚 Documentação
- [ ] 🧪 Testes
- [ ] 🎨 Estilo/UI

## 🧪 Como Testar
1. Checkout da branch
2. Instalar dependências
3. Executar `yarn dev`
4. Navegar para...
5. Verificar que...

## 📸 Screenshots/GIFs
(Se aplicável)

## ✅ Checklist
- [ ] Testes passando
- [ ] Build funcionando  
- [ ] Documentação atualizada
- [ ] Sem breaking changes (ou justificado)

## 📝 Notas Adicionais
Qualquer informação adicional para reviewers.
```

### **Processo de Review**

#### **Para o Autor**

1. **Criar PR** com template completo
2. **Aguardar review** de pelo menos 1 maintainer
3. **Responder feedback** e fazer mudanças
4. **Rebaser** se necessário
5. **Aguardar aprovação** final

#### **Para Reviewers**

1. **Testar localmente** as mudanças
2. **Verificar** padrões de código
3. **Avaliar
