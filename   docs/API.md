# 🔌 API Reference - ChainBallotX (Parte 1)

Este documento detalha as APIs principais, hooks e serviços do ChainBallotX.

## 📋 Índice

- [🏗️ Smart Contract API](#️-smart-contract-api)
- [⚛️ React Hooks](#️-react-hooks)
- [🔧 Services](#-services)
- [📡 Network Providers](#-network-providers)
- [💰 Wallet Integration](#-wallet-integration)
- [🎨 Component Props](#-component-props)
- [📊 Type Definitions](#-type-definitions)

> 📚 **Veja também**: [API Reference Parte 2](./API_ADVANCED.md) para funcionalidades avançadas

---

## 🏗️ Smart Contract API

### **Endpoints (Write Operations)**

#### `create_proposal`

Cria uma nova proposta para votação.

```rust
fn create_proposal(
    title: ManagedBuffer,
    description: ManagedBuffer, 
    duration: u64
) -> SCResult<()>
```

**Parâmetros:**

- `title`: Título da proposta (máx. 100 caracteres)
- `description`: Descrição detalhada (máx. 1000 caracteres)
- `duration`: Duração em segundos (mín. 3600 = 1 hora)

**Exemplo de uso:**

```typescript
const transaction = {
  data: `create_proposal@${titleHex}@${descriptionHex}@${durationHex}`,
  receiver: contractAddress,
  gasLimit: '10000000',
  chainID: 'D'
};
```

**Eventos emitidos:**

```rust
#[event("proposalCreated")]
fn proposal_created_event(
    #[indexed] proposal_id: u64,
    #[indexed] creator: &ManagedAddress,
);
```

---

#### `vote`

Vota em uma proposta específica.

```rust
fn vote(proposal_id: u64) -> SCResult<()>
```

**Parâmetros:**

- `proposal_id`: ID da proposta (u64)

**Validações:**

- ✅ Proposta existe
- ✅ Proposta está ativa
- ✅ Usuário ainda não votou
- ✅ Prazo não expirou

**Exemplo de uso:**

```typescript
const transaction = {
  data: `vote@${proposalId.toString(16).padStart(16, '0')}`,
  receiver: contractAddress,
  gasLimit: '6000000',
  chainID: 'D'
};
```

**Eventos emitidos:**

```rust
#[event("voteCast")]
fn vote_cast_event(
    #[indexed] proposal_id: u64,
    #[indexed] voter: &ManagedAddress,
);
```

---

#### `cancel_proposal`

Cancela uma proposta (apenas criador ou owner).

```rust
fn cancel_proposal(proposal_id: u64) -> SCResult<()>
```

**Parâmetros:**

- `proposal_id`: ID da proposta

**Permissões:**

- ✅ Criador da proposta
- ✅ Owner do contrato

---

### **Views (Read Operations)**

#### `get_proposal_title`

```rust
#[view]
fn get_proposal_title(proposal_id: u64) -> ManagedBuffer
```

#### `get_proposal_description`

```rust
#[view]
fn get_proposal_description(proposal_id: u64) -> ManagedBuffer
```

#### `get_proposal_creator`

```rust
#[view]
fn get_proposal_creator(proposal_id: u64) -> ManagedAddress
```

#### `get_proposal_vote_count`

```rust
#[view]
fn get_proposal_vote_count(proposal_id: u64) -> u64
```

#### `get_proposal_deadline`

```rust
#[view]
fn get_proposal_deadline(proposal_id: u64) -> u64
```

#### `is_proposal_active`

```rust
#[view]
fn is_proposal_active(proposal_id: u64) -> bool
```

#### `get_total_proposals`

```rust
#[view]
fn get_total_proposals() -> u64
```

#### `get_total_votes`

```rust
#[view]
fn get_total_votes() -> u64
```

#### `has_user_voted_on_proposal`

```rust
#[view]
fn has_user_voted_on_proposal(
    proposal_id: u64,
    user_address: ManagedAddress
) -> bool
```

---

## ⚛️ React Hooks

### **MultiversX SDK Hooks**

#### `useGetIsLoggedIn()`

```typescript
const useGetIsLoggedIn: () => boolean
```

**Retorna:** Status de login do usuário

**Exemplo:**

```typescript
const MyComponent = () => {
  const isLoggedIn = useGetIsLoggedIn();
  
  return (
    <div>
      {isLoggedIn ? 'Conectado' : 'Desconectado'}
    </div>
  );
};
```

---

#### `useGetAccountInfo()`

```typescript
const useGetAccountInfo: () => {
  address: string;
  balance: string;
  nonce: number;
}
```

**Retorna:** Informações da conta conectada

**Exemplo:**

```typescript
const MyComponent = () => {
  const { address, balance } = useGetAccountInfo();
  
  return (
    <div>
      <p>Endereço: {address}</p>
      <p>Saldo: {balance} xEGLD</p>
    </div>
  );
};
```

---

### **Custom Hooks**

#### `useContract()`

```typescript
const useContract: () => {
  contractService: ContractService;
  isLoading: boolean;
  error: string | null;
}
```

**Retorna:** Instância do serviço de contrato

**Exemplo:**

```typescript
const MyComponent = () => {
  const { contractService, isLoading } = useContract();
  
  const [proposals, setProposals] = useState([]);
  
  useEffect(() => {
    const fetchProposals = async () => {
      const data = await contractService.getProposals();
      setProposals(data);
    };
    
    fetchProposals();
  }, [contractService]);
  
  return <ProposalsList proposals={proposals} />;
};
```

---

#### `useProposals()`

```typescript
const useProposals: () => {
  proposals: ProposalData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

**Retorna:** Estado das propostas

**Exemplo:**

```typescript
const ProposalsPage = () => {
  const { proposals, loading, error, refetch } = useProposals();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <div>
      {proposals.map(proposal => (
        <ProposalCard key={proposal.id} proposal={proposal} />
      ))}
      <button onClick={refetch}>Atualizar</button>
    </div>
  );
};
```

---

#### `useVoting()`

```typescript
const useVoting: () => {
  vote: (proposalId: number) => Promise<void>;
  isVoting: boolean;
  hasVoted: (proposalId: number) => Promise<boolean>;
}
```

**Retorna:** Funcionalidades de votação

**Exemplo:**

```typescript
const VoteButton = ({ proposalId }: { proposalId: number }) => {
  const { vote, isVoting, hasVoted } = useVoting();
  const [userHasVoted, setUserHasVoted] = useState(false);
  
  useEffect(() => {
    hasVoted(proposalId).then(setUserHasVoted);
  }, [proposalId, hasVoted]);
  
  const handleVote = async () => {
    await vote(proposalId);
    setUserHasVoted(true);
  };
  
  return (
    <button 
      onClick={handleVote}
      disabled={isVoting || userHasVoted}
    >
      {userHasVoted ? 'Já votou' : isVoting ? 'Votando...' : 'Votar'}
    </button>
  );
};
```

---

## 🔧 Services

### **ContractService**

#### `constructor()`

```typescript
constructor()
```

Inicializa o serviço com configurações da rede devnet.

---

#### `getProposals()`

```typescript
async getProposals(): Promise<ProposalData[]>
```

**Retorna:** Array de todas as propostas

**Exemplo:**

```typescript
const contractService = new ContractService();
const proposals = await contractService.getProposals();

console.log(`Total de propostas: ${proposals.length}`);
```

---

#### `getProposal()`

```typescript
async getProposal(proposalId: number): Promise<ProposalData | null>
```

**Parâmetros:**

- `proposalId`: ID da proposta

**Retorna:** Dados da proposta ou null se não existir

**Exemplo:**

```typescript
const proposal = await contractService.getProposal(1);

if (proposal) {
  console.log(`Título: ${proposal.title}`);
  console.log(`Votos: ${proposal.votesFor}`);
}
```

---

#### `hasVoted()`

```typescript
async hasVoted(userAddress: string, proposalId: number): Promise<boolean>
```

**Parâmetros:**

- `userAddress`: Endereço do usuário
- `proposalId`: ID da proposta

**Retorna:** true se o usuário já votou

**Exemplo:**

```typescript
const address = 'erd1abc...';
const hasVoted = await contractService.hasVoted(address, 1);

console.log(`Usuário já votou: ${hasVoted}`);
```

---

#### `getContractStats()`

```typescript
async getContractStats(): Promise<{
  totalProposals: number;
  totalVotes: number;
  activeProposals: number;
  participants: number;
}>
```

**Retorna:** Estatísticas do contrato

**Exemplo:**

```typescript
const stats = await contractService.getContractStats();

console.log(`Propostas: ${stats.totalProposals}`);
console.log(`Votos: ${stats.totalVotes}`);
```

---

## 📡 Network Providers

### **ProxyNetworkProvider**

#### `queryContract()`

```typescript
async queryContract(query: Query): Promise<QueryResponse>
```

**Parâmetros:**

- `query`: Query object com address, function e argumentos

**Exemplo:**

```typescript
const provider = new ProxyNetworkProvider('https://devnet-api.multiversx.com');

const query = new Query({
  address: new Address(contractAddress),
  func: new ContractFunction('get_total_proposals'),
  args: []
});

const response = await provider.queryContract(query);
const total = parseInt(Buffer.from(response.returnData[0], 'base64').toString('hex'), 16);
```

---

#### `sendTransaction()`

```typescript
async sendTransaction(transaction: Transaction): Promise<TransactionHash>
```

**Parâmetros:**

- `transaction`: Transação assinada

**Retorna:** Hash da transação

---

## 💰 Wallet Integration

### **sendTransactions()**

```typescript
async sendTransactions(config: {
  transactions: Transaction[];
  transactionsDisplayInfo?: {
    processingMessage?: string;
    errorMessage?: string;
    successMessage?: string;
  };
  redirectAfterSign?: boolean;
}): Promise<void>
```

**Parâmetros:**

- `transactions`: Array de transações
- `transactionsDisplayInfo`: Mensagens customizadas
- `redirectAfterSign`: Redirecionar após assinar

**Exemplo:**

```typescript
await sendTransactions({
  transactions: [{
    value: '0',
    data: 'vote@01',
    receiver: contractAddress,
    gasLimit: '6000000',
    chainID: 'D'
  }],
  transactionsDisplayInfo: {
    processingMessage: 'Processando voto...',
    successMessage: 'Voto registrado com sucesso!',
    errorMessage: 'Erro ao votar'
  },
  redirectAfterSign: false
});
```

---

### **logout()**

```typescript
function logout(): void
```

Desconecta a carteira atual.

**Exemplo:**

```typescript
const handleLogout = () => {
  logout();
  // Usuário será redirecionado para página inicial
};
```

---

## 🎨 Component Props

### **ProposalCard**

```typescript
interface ProposalCardProps {
  proposal: ProposalData;
  onVote?: (proposalId: number) => void;
  showVoteButton?: boolean;
  compact?: boolean;
}
```

**Exemplo:**

```typescript
<ProposalCard 
  proposal={proposal}
  onVote={handleVote}
  showVoteButton={isLoggedIn}
  compact={false}
/>
```

---

### **ProposalForm**

```typescript
interface ProposalFormProps {
  onSubmit: (data: CreateProposalData) => Promise<void>;
  isSubmitting?: boolean;
  initialValues?: Partial<CreateProposalData>;
}
```

**Exemplo:**

```typescript
<ProposalForm 
  onSubmit={handleCreateProposal}
  isSubmitting={isCreating}
  initialValues={{ duration: 7 }}
/>
```

---

### **VoteButton**

```typescript
interface VoteButtonProps {
  proposalId: number;
  disabled?: boolean;
  hasVoted?: boolean;
  onVote?: (proposalId: number) => void;
}
```

**Exemplo:**

```typescript
<VoteButton 
  proposalId={proposal.id}
  disabled={!isLoggedIn}
  hasVoted={userVotes[proposal.id]}
  onVote={handleVote}
/>
```

---

## 📊 Type Definitions

### **ProposalData**

```typescript
interface ProposalData {
  id: number;
  title: string;
  description: string;
  creator: string;
  votesFor: number;
  votesAgainst: number;
  status: 'Aberta' | 'Fechada' | 'Aprovada' | 'Rejeitada';
  createdAt: number;
  endsAt: number;
}
```

### **CreateProposalData**

```typescript
interface CreateProposalData {
  title: string;
  description: string;
  duration: number; // em dias
}
```

### **ContractConfig**

```typescript
interface ContractConfig {
  votingContract: string;
  network: {
    id: string;
    name: string;
    apiUrl: string;
    explorerUrl: string;
    walletUrl: string;
  };
  gasLimits: {
    vote: number;
    createProposal: number;
    getProposals: number;
  };
  contractFunctions: {
    vote: string;
    createProposal: string;
    getTotalProposals: string;
    // ... outras funções
  };
}
```

### **TransactionConfig**

```typescript
interface TransactionConfig {
  value: string;
  data: string;
  receiver: string;
  gasLimit: string;
  chainID: string;
}
```

### **WalletState**

```typescript
interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  nonce: number;
}
```

---

## 🔧 Utility Functions

### **Data Encoding**

```typescript
// Converter string para hex
const stringToHex = (str: string): string => {
  return Buffer.from(str, 'utf8').toString('hex');
};

// Converter número para hex (u64)
const numberToHex = (num: number): string => {
  return num.toString(16).padStart(16, '0');
};

// Decodificar resposta da blockchain
const decodeResponse = (data: string): string => {
  return Buffer.from(data, 'base64').toString('utf8');
};
```

### **Address Validation**

```typescript
const isValidAddress = (address: string): boolean => {
  return /^erd1[a-z0-9]{58}$/.test(address);
};
```

### **Date Formatting**

```typescript
const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
```

---

## 🚀 Code Examples

### **Complete Proposal Creation Flow**

```typescript
const CreateProposalPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contractService = new ContractService();
  
  const handleSubmit = async (data: CreateProposalData) => {
    setIsSubmitting(true);
    
    try {
      // 1. Validate data
      if (!data.title.trim() || data.title.length > 100) {
        throw new Error('Invalid title');
      }
      
      // 2. Encode data
      const titleHex = Buffer.from(data.title, 'utf8').toString('hex');
      const descriptionHex = Buffer.from(data.description, 'utf8').toString('hex');
      const durationHex = (data.duration * 24 * 60 * 60).toString(16).padStart(16, '0');
      
      // 3. Create transaction
      const transaction = {
        value: '0',
        data: `create_proposal@${titleHex}@${descriptionHex}@${durationHex}`,
        receiver: contractAddress,
        gasLimit: '10000000',
        chainID: 'D'
      };
      
      // 4. Send transaction
      await sendTransactions({
        transactions: [transaction],
        transactionsDisplayInfo: {
          processingMessage: 'Criando proposta...',
          successMessage: 'Proposta criada com sucesso!',
          errorMessage: 'Erro ao criar proposta'
        }
      });
      
    } catch (error) {
      console.error('Error creating proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <ProposalForm 
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
};
```

### **Complete Voting Flow**

```typescript
const VotingComponent = ({ proposal }: { proposal: ProposalData }) => {
  const { address } = useGetAccountInfo();
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const contractService = new ContractService();
  
  useEffect(() => {
    const checkVoteStatus = async () => {
      if (address) {
        const voted = await contractService.hasVoted(address, proposal.id);
        setHasVoted(voted);
      }
    };
    
    checkVoteStatus();
  }, [address, proposal.id]);
  
  const handleVote = async () => {
    if (!address || hasVoted) return;
    
    setIsVoting(true);
    
    try {
      const transaction = {
        value: '0',
        data: `vote@${proposal.id.toString(16).padStart(16, '0')}`,
        receiver: contractAddress,
        gasLimit: '6000000',
        chainID: 'D'
      };
      
      await sendTransactions({
        transactions: [transaction],
        transactionsDisplayInfo: {
          processingMessage: 'Registrando voto...',
          successMessage: 'Voto registrado!',
          errorMessage: 'Erro ao votar'
        }
      });
      
      setHasVoted(true);
      
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };
  
  return (
    <VoteButton 
      proposalId={proposal.id}
      disabled={isVoting || hasVoted}
      hasVoted={hasVoted}
      onVote={handleVote}
    />
  );
};
```

---

## 📚 Links Relacionados

- 🔧 [Setup Detalhado](./SETUP.md)
- 🏗️ [Arquitetura](./ARCHITECTURE.md)
- 🚀 [Deploy do Contrato](./SMART_CONTRACT_DEPLOY.md)
- 🤝 [Como Contribuir](./CONTRIBUTING.md)
- ⚡ [API Avançada](./API_ADVANCED.md) - Performance, Security, Testing

## ⚡ API Reference Avançada - ChainBallotX (Parte 2) - Continuação

## 🔐 Security Best Practices (Continuação)

### **Gas Limit Protection**

```typescript
const GAS_LIMITS = {
  vote: 6000000,
  createProposal: 10000000,
  upgradeContract: 50000000
} as const;

const validateGasLimit = (operation: keyof typeof GAS_LIMITS, gasLimit: number): number => {
  const maxGas = GAS_LIMITS[operation] * 2; // Allow 2x for safety
  const minGas = GAS_LIMITS[operation] * 0.5; // Minimum required
  
  if (gasLimit > maxGas) {
    console.warn(`Gas limit ${gasLimit} exceeds maximum for ${operation}. Using ${maxGas}`);
    return maxGas;
  }
  
  if (gasLimit < minGas) {
    console.warn(`Gas limit ${gasLimit} below minimum for ${operation}. Using ${minGas}`);
    return minGas;
  }
  
  return gasLimit;
};
```

### **Transaction Signing Security**

```typescript
const secureTransactionBuilder = {
  buildVoteTransaction: (proposalId: number, vote: boolean, userAddress: string) => {
    const gasLimit = validateGasLimit('vote', 6000000);
    
    return new Transaction({
      receiver: Address.fromBech32(CONTRACT_ADDRESS),
      gasLimit: gasLimit,
      data: new TransactionPayload(`vote@${proposalId.toString(16)}@${vote ? '01' : '00'}`),
      chainID: CHAIN_ID,
      sender: Address.fromBech32(userAddress),
      value: TokenTransfer.egldFromAmount(0)
    });
  },
  
  buildProposalTransaction: (proposalData: CreateProposalData, userAddress: string) => {
    const sanitizedData = sanitizeProposalData(proposalData);
    const gasLimit = validateGasLimit('createProposal', 10000000);
    
    const titleHex = Buffer.from(sanitizedData.title, 'utf8').toString('hex');
    const descriptionHex = Buffer.from(sanitizedData.description, 'utf8').toString('hex');
    const durationHex = sanitizedData.duration.toString(16);
    
    return new Transaction({
      receiver: Address.fromBech32(CONTRACT_ADDRESS),
      gasLimit: gasLimit,
      data: new TransactionPayload(`createProposal@${titleHex}@${descriptionHex}@${durationHex}`),
      chainID: CHAIN_ID,
      sender: Address.fromBech32(userAddress),
      value: TokenTransfer.egldFromAmount(0)
    });
  }
};
```

### **Rate Limiting**

```typescript
class RateLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests = 10; // Max requests per window
  private windowMs = 60000; // 1 minute window
  
  isAllowed(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove requests outside the current window
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(userId, validRequests);
    
    return true;
  }
  
  getRemainingRequests(userId: string): number {
    const userRequests = this.requests.get(userId) || [];
    const now = Date.now();
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

const rateLimiter = new RateLimiter();
```

---

## 🧪 Testing Utilities

### **Mock Services**

```typescript
export class MockContractService implements IContractService {
  private mockProposals: Map<number, ProposalData> = new Map();
  private nextId = 1;
  
  async createProposal(data: CreateProposalData): Promise<number> {
    const proposal: ProposalData = {
      id: this.nextId++,
      title: data.title,
      description: data.description,
      creator: 'erd1mock...',
      votesFor: 0,
      votesAgainst: 0,
      totalVoters: 0,
      startTime: Date.now(),
      endTime: Date.now() + (data.duration * 24 * 60 * 60 * 1000),
      status: 'active',
      hasVoted: false
    };
    
    this.mockProposals.set(proposal.id, proposal);
    return proposal.id;
  }
  
  async getProposal(id: number): Promise<ProposalData | null> {
    return this.mockProposals.get(id) || null;
  }
  
  async getAllProposals(): Promise<ProposalData[]> {
    return Array.from(this.mockProposals.values());
  }
  
  async vote(proposalId: number, vote: boolean): Promise<void> {
    const proposal = this.mockProposals.get(proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }
    
    if (vote) {
      proposal.votesFor += 1;
    } else {
      proposal.votesAgainst += 1;
    }
    
    proposal.totalVoters += 1;
    proposal.hasVoted = true;
  }
}
```

### **Test Helpers**

```typescript
export const testHelpers = {
  createMockProposal: (overrides: Partial<ProposalData> = {}): ProposalData => ({
    id: 1,
    title: 'Test Proposal',
    description: 'This is a test proposal',
    creator: 'erd1test...',
    votesFor: 0,
    votesAgainst: 0,
    totalVoters: 0,
    startTime: Date.now(),
    endTime: Date.now() + 86400000, // 1 day
    status: 'active',
    hasVoted: false,
    ...overrides
  }),
  
  createMockUser: (overrides: Partial<UserData> = {}): UserData => ({
    address: 'erd1test...',
    balance: '1000000000000000000', // 1 EGLD
    isConnected: true,
    ...overrides
  }),
  
  waitFor: (condition: () => boolean, timeout: number = 5000): Promise<void> => {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - start > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 100);
        }
      };
      
      check();
    });
  },
  
  mockTransaction: (status: 'success' | 'pending' | 'failed' = 'success') => ({
    hash: '0x' + Math.random().toString(16).substr(2, 64),
    status,
    gasUsed: 5000000,
    timestamp: Date.now()
  })
};
```

### **Component Testing Utilities**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChainBallotXProvider } from '../providers/ChainBallotXProvider';

export const renderWithProvider = (
  ui: React.ReactElement,
  options: {
    mockService?: IContractService;
    initialUser?: UserData;
  } = {}
) => {
  const mockService = options.mockService || new MockContractService();
  const initialUser = options.initialUser || testHelpers.createMockUser();
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChainBallotXProvider 
      contractService={mockService}
      initialUser={initialUser}
    >
      {children}
    </ChainBallotXProvider>
  );
  
  return {
    ...render(ui, { wrapper: Wrapper }),
    mockService,
    initialUser
  };
};

export const testActions = {
  clickButton: async (buttonText: string) => {
    const button = screen.getByRole('button', { name: buttonText });
    fireEvent.click(button);
    await waitFor(() => expect(button).not.toBeDisabled());
  },
  
  fillForm: async (formData: Record<string, string>) => {
    for (const [field, value] of Object.entries(formData)) {
      const input = screen.getByLabelText(new RegExp(field, 'i'));
      fireEvent.change(input, { target: { value } });
    }
  },
  
  expectProposalToBeVisible: (proposal: ProposalData) => {
    expect(screen.getByText(proposal.title)).toBeInTheDocument();
    expect(screen.getByText(proposal.description)).toBeInTheDocument();
  }
};
```

### **Integration Test Example**

```typescript
describe('ChainBallotX Integration Tests', () => {
  test('should create and vote on proposal', async () => {
    const mockService = new MockContractService();
    const { user } = renderWithProvider(<App />, { mockService });
    
    // Navigate to create proposal
    await testActions.clickButton('Nova Proposta');
    
    // Fill proposal form
    await testActions.fillForm({
      'Título': 'Test Integration Proposal',
      'Descrição': 'This is an integration test proposal',
      'Duração': '7'
    });
    
    // Submit proposal
    await testActions.clickButton('Criar Proposta');
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/proposta criada com sucesso/i)).toBeInTheDocument();
    });
    
    // Navigate back to proposals list
    await testActions.clickButton('Ver Propostas');
    
    // Verify proposal is visible
    testActions.expectProposalToBeVisible({
      title: 'Test Integration Proposal',
      description: 'This is an integration test proposal'
    } as ProposalData);
    
    // Vote on proposal
    await testActions.clickButton('Votar Sim');
    
    // Wait for vote to be processed
    await waitFor(() => {
      expect(screen.getByText(/voto registrado/i)).toBeInTheDocument();
    });
    
    // Verify vote count updated
    expect(screen.getByText('1 voto a favor')).toBeInTheDocument();
  });
});
```

---

## 📊 Monitoring & Analytics

### **Performance Metrics**

```typescript
class PerformanceTracker {
  private metrics = new Map<string, number[]>();
  
  startTimer(operation: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
    };
  }
  
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }
  
  getStats(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;
    
    const sorted = [...values].sort((a, b) => a - b);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    
    return { avg, p50, p95, p99, count: values.length };
  }
  
  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [name] of this.metrics) {
      stats[name] = this.getStats(name);
    }
    return stats;
  }
}

export const performanceTracker = new PerformanceTracker();
```

### **Usage Analytics**

```typescript
class AnalyticsTracker {
  private events: Array<{
    name: string;
    data: Record<string, any>;
    timestamp: number;
    userId?: string;
  }> = [];
  
  track(eventName: string, data: Record<string, any> = {}, userId?: string): void {
    this.events.push({
      name: eventName,
      data,
      timestamp: Date.now(),
      userId
    });
    
    // Send to analytics service (mock implementation)
    this.sendToAnalytics(eventName, data, userId);
  }
  
  private async sendToAnalytics(eventName: string, data: Record<string, any>, userId?: string): Promise<void> {
    // In a real implementation, this would send to your analytics service
    console.log('Analytics Event:', {
      event: eventName,
      data,
      userId,
      timestamp: new Date().toISOString()
    });
  }
  
  getEventStats(eventName: string, timeframe: number = 86400000): {
    count: number;
    uniqueUsers: number;
    avgPerUser: number;
  } {
    const cutoff = Date.now() - timeframe;
    const relevantEvents = this.events.filter(
      event => event.name === eventName && event.timestamp > cutoff
    );
    
    const uniqueUsers = new Set(
      relevantEvents.map(event => event.userId).filter(Boolean)
    ).size;
    
    return {
      count: relevantEvents.length,
      uniqueUsers,
      avgPerUser: uniqueUsers > 0 ? relevantEvents.length / uniqueUsers : 0
    };
  }
}

export const analyticsTracker = new AnalyticsTracker();

// Usage examples
export const trackingEvents = {
  proposalCreated: (proposalId: number, userId: string) => {
    analyticsTracker.track('proposal_created', { proposalId }, userId);
  },
  
  voteSubmitted: (proposalId: number, vote: boolean, userId: string) => {
    analyticsTracker.track('vote_submitted', { proposalId, vote }, userId);
  },
  
  walletConnected: (walletType: string, userId: string) => {
    analyticsTracker.track('wallet_connected', { walletType }, userId);
  },
  
  pageView: (page: string, userId?: string) => {
    analyticsTracker.track('page_view', { page }, userId);
  }
};
```

### **Health Check System**

```typescript
class HealthChecker {
  private checks: Map<string, () => Promise<boolean>> = new Map();
  
  registerCheck(name: string, checkFn: () => Promise<boolean>): void {
    this.checks.set(name, checkFn);
  }
  
  async runCheck(name: string): Promise<{ healthy: boolean; error?: string }> {
    const checkFn = this.checks.get(name);
    if (!checkFn) {
      return { healthy: false, error: 'Check not found' };
    }
    
    try {
      const result = await checkFn();
      return { healthy: result };
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  async runAllChecks(): Promise<Record<string, { healthy: boolean; error?: string }>> {
    const results: Record<string, { healthy: boolean; error?: string }> = {};
    
    for (const [name] of this.checks) {
      results[name] = await this.runCheck(name);
    }
    
    return results;
  }
  
  getOverallHealth(): 'healthy' | 'degraded' | 'unhealthy' {
    // This would run checks and determine overall system health
    // Implementation depends on your specific requirements
    return 'healthy';
  }
}

export const healthChecker = new HealthChecker();

// Register health checks
healthChecker.registerCheck('contract_connection', async () => {
  try {
    const contractService = new ContractService();
    await contractService.getAllProposals();
    return true;
  } catch {
    return false;
  }
});

healthChecker.registerCheck('wallet_provider', async () => {
  return typeof window !== 'undefined' && 'elrond' in window;
});
```

---

## 🚀 Future Enhancements

### **Planned Features**

```typescript
// Upcoming features that will be added to the API

interface FutureEnhancements {
  // Multi-signature proposals
  multiSigProposals: {
    requiredSignatures: number;
    signers: string[];
    currentSignatures: number;
  };
  
  // Proposal categories
  categories: {
    governance: 'Governance';
    technical: 'Technical';
    financial: 'Financial';
    community: 'Community';
  };
  
  // Voting power based on stake
  stakingIntegration: {
    votingPower: number;
    stakedAmount: string;
    stakingProvider: string;
  };
  
  // Delegation system
  delegation: {
    delegate: string;
    delegator: string;
    votingPowerDelegated: number;
  };
  
  // Proposal templates
  templates: {
    id: string;
    name: string;
    fields: Array<{
      name: string;
      type: 'text' | 'number' | 'select';
      required: boolean;
      options?: string[];
    }>;
  };
}
```

### **API Versioning Strategy**

```typescript
// Version management for backward compatibility
interface APIVersion {
  version: string;
  deprecated?: boolean;
  deprecationDate?: Date;
  migrationGuide?: string;
}

const API_VERSIONS: Record<string, APIVersion> = {
  'v1.0': {
    version: '1.0.0',
    deprecated: false
  },
  'v2.0': {
    version: '2.0.0',
    deprecated: false
  }
};

class VersionedContractService {
  constructor(private version: string = 'v2.0') {
    const versionInfo = API_VERSIONS[this.version];
    if (!versionInfo) {
      throw new Error(`Unsupported API version: ${this.version}`);
    }
    
    if (versionInfo.deprecated) {
      console.warn(
        `API version ${this.version} is deprecated. ` +
        `Migration guide: ${versionInfo.migrationGuide}`
      );
    }
  }
}
```

---

## 🛠️ Debug & Support

### **Debug Utilities**

```typescript
class ChainBallotXDebugger {
  private static instance: ChainBallotXDebugger;
  private debugMode = false;
  private logs: Array<{
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    timestamp: number;
    data?: any;
  }> = [];
  
  static getInstance(): ChainBallotXDebugger {
    if (!ChainBallotXDebugger.instance) {
      ChainBallotXDebugger.instance = new ChainBallotXDebugger();
    }
    return ChainBallotXDebugger.instance;
  }
  
  enableDebug(): void {
    this.debugMode = true;
    console.log('🔍 ChainBallotX Debug Mode Enabled');
  }
  
  disableDebug(): void {
    this.debugMode = false;
    console.log('🔍 ChainBallotX Debug Mode Disabled');
  }
  
  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any): void {
    const logEntry = {
      level,
      message,
      timestamp: Date.now(),
      data
    };
    
    this.logs.push(logEntry);
    
    if (this.debugMode || level === 'error') {
      const emoji = {
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        debug: '🐛'
      }[level];
      
      console[level === 'debug' ? 'log' : level](
        `${emoji} [ChainBallotX] ${message}`,
        data || ''
      );
    }
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
  }
  
  getLogs(level?: string): typeof this.logs {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }
  
  clearLogs(): void {
    this.logs = [];
    console.log('🧹 Debug logs cleared');
  }
  
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
  
  generateSupportReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      performanceStats: performanceTracker.getAllStats(),
      recentLogs: this.logs.slice(-50), // Last 50 logs
      systemInfo: {
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      }
    };
    
    return JSON.stringify(report, null, 2);
  }
}

export const debugger = ChainBallotXDebugger.getInstance();

// Usage examples
debugger.log('info', 'User connected wallet', { address: 'erd1...' });
debugger.log('error', 'Transaction failed', { error: 'Insufficient funds' });
```

### **Troubleshooting Guide**

```typescript
export const troubleshootingGuide = {
  walletConnection: {
    issue: 'Wallet not connecting',
    solutions: [
      'Make sure MultiversX wallet extension is installed',
      'Refresh the page and try again',
      'Check if wallet is unlocked',
      'Clear browser cache and cookies'
    ],
    debugSteps: [
      () => debugger.log('debug', 'Checking wallet availability', { hasExtension: 'elrond' in window }),
      () => debugger.log('debug', 'Wallet connection state', { connected: false })
    ]
  },
  
  transactionFailed: {
    issue: 'Transaction keeps failing',
    solutions: [
      'Check if you have sufficient EGLD for gas fees',
      'Verify contract address is correct',
      'Try increasing gas limit',
      'Check network status'
    ],
    debugSteps: [
      () => debugger.log('debug', 'User balance check needed'),
      () => debugger.log('debug', 'Gas limit validation needed')
    ]
  },
  
  proposalNotLoading: {
    issue: 'Proposals not loading',
    solutions: [
      'Check internet connection',
      'Verify you\'re on the correct network',
      'Try refreshing the page',
      'Clear application cache'
    ],
    debugSteps: [
      () => debugger.log('debug', 'Network connectivity check'),
      () => debugger.log('debug', 'Contract query status')
    ]
  }
};

export const runDiagnostics = async (): Promise<{
  issues: string[];
  suggestions: string[];
}> => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Check wallet connection
  if (typeof window !== 'undefined' && !('elrond' in window)) {
    issues.push('MultiversX wallet extension not detected');
    suggestions.push('Install MultiversX DeFi Wallet browser extension');
  }
  
  // Check network connectivity
  if (!navigator.onLine) {
    issues.push('No internet connection');
    suggestions.push('Check your internet connection');
  }
  
  // Check performance
  const stats = performanceTracker.getAllStats();
  const hasSlowOperations = Object.values(stats).some(
    stat => stat && stat.avg > 2000 // 2 seconds
  );
  
  if (hasSlowOperations) {
    issues.push('Slow performance detected');
    suggestions.push('Try refreshing the page or check network speed');
  }
  
  return { issues, suggestions };
};
```

### **Support Contact Information**

```typescript
export const supportInfo = {
  documentation: 'https://docs.chainballotx.io',
  github: 'https://github.com/chainballotx/frontend',
  discord: 'https://discord.gg/chainballotx',
  email: 'support@chainballotx.io',
  
  reportBug: (bugReport: {
    title: string;
    description: string;
    steps: string[];
    expectedResult: string;
    actualResult: string;
  }) => {
    const fullReport = {
      ...bugReport,
      supportReport: debugger.generateSupportReport(),
      timestamp: new Date().toISOString()
    };
    
    // In a real implementation, this would send to your bug tracking system
    console.log('Bug report generated:', fullReport);
    return fullReport;
  }
};
```

---

## 📖 Quick Reference

### **Common Error Codes**

```typescript
export const ERROR_CODES = {
  WALLET_NOT_CONNECTED: 'WALLET_001',
  INSUFFICIENT_FUNDS: 'WALLET_002',
  TRANSACTION_FAILED: 'TX_001',
  CONTRACT_CALL_FAILED: 'CONTRACT_001',
  VALIDATION_ERROR: 'VALIDATION_001',
  NETWORK_ERROR: 'NETWORK_001',
  RATE_LIMITED: 'RATE_001'
} as const;
```

### **Gas Estimates**

```typescript
export const GAS_ESTIMATES = {
  vote: 6_000_000,
  createProposal: 10_000_000,
  updateProposal: 8_000_000,
  closeProposal: 5_000_000
} as const;
```

### **Network Configuration**

```typescript
export const NETWORK_CONFIG = {
  mainnet: {
    chainId: '1',
    apiUrl: 'https://api.multiversx.com',
    explorerUrl: 'https://explorer.multiversx.com'
  },
  testnet: {
    chainId: 'T',
    apiUrl: 'https://testnet-api.multiversx.com',
    explorerUrl: 'https://testnet-explorer.multiversx.com'
  },
  devnet: {
    chainId: 'D',
    apiUrl: 'https://devnet-api.multiversx.com',
    explorerUrl: 'https://devnet-explorer.multiversx.com'
  }
} as const;
```

---

## 🎯 Conclusão

Esta documentação avançada cobre todos os aspectos técnicos necessários para trabalhar eficientemente com ChainBallotX. Para implementações básicas, consulte a [API Reference Parte 1](./API.md).

### **Próximos Passos**

1. **Implementar error handling** usando os padrões apresentados
2. **Configurar monitoring** com as ferramentas de analytics
3. **Escrever testes** usando os utilities fornecidos
4. **Otimizar performance** aplicando as técnicas de caching
5. **Configurar debugging** para facilitar desenvolvimento

### **Recursos Adicionais**

- 📚 [Documentação MultiversX](https://docs.multiversx.com)
- 🛠️ [SDK MultiversX](https://github.com/multiversx/mx-sdk-js)
- 💬 [Comunidade Discord](https://discord.gg/chainballotx)
- 🐛 [Reportar Issues](https://github.com/chainballotx/frontend/issues)

*Última atualização: Junho 2025*.
