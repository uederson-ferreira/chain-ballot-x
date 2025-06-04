# 🗳️ ChainBallotX - Sistema de Votação Descentralizado

Sistema de votação descentralizado construído com **Next.js 15** e **MultiversX blockchain**, permitindo criação e votação em propostas de forma transparente e imutável.

![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)
![MultiversX](https://img.shields.io/badge/MultiversX-Devnet-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.16-38bdf8)

## 🚀 Quick Start

```bash
# 1. Clone o repositório
git clone https://github.com/uederson-ferreira/chain-ballot-x.git
cd chain-ballot-x

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações

# 4. Execute em desenvolvimento
npm run dev

# 5. Acesse http://localhost:3000
```

🎯 **Em 5 minutos você tem o sistema rodando!**

## 🏗️ Arquitetura

- **Frontend:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS v3 + shadcn/ui
- **Blockchain:** MultiversX (Devnet)
- **Smart Contract:** Rust (já deployado)
- **Wallet Integration:** MultiversX SDK

```bash
Frontend (Next.js) ↔ MultiversX SDK ↔ MultiversX Blockchain ↔ Smart Contract
```

## 📦 Estrutura do Projeto

```bash
├── app/
│   ├── layout.tsx           # Layout principal + DappProvider
│   ├── page.tsx            # Homepage com design moderno
│   ├── proposals/          # Lista e votação nas propostas
│   │   └── page.tsx
│   ├── governance/         # Criar novas propostas
│   │   └── page.tsx
│   └── providers.tsx       # Providers do MultiversX
├── components/
│   ├── ui/                 # Componentes shadcn/ui
│   └── Header.tsx          # Header com login real
├── services/
│   └── contractService.ts  # Integração com smart contract
├── config/
│   ├── app.ts              # Configurações da aplicação
│   └── contracts.ts        # Configurações do contrato
├── contracts/
│   └── chainballotx.abi.json # ABI do smart contract
└── styles/
    └── globals.css         # Tailwind + variáveis CSS customizadas
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie `.env.local`:

```bash
# Blockchain Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=erd1qqqqqqqqqqqqqpgqehrq4xr838lrlv0h4ht20fnl9ywsw3v7sjus85qv7x
NEXT_PUBLIC_NETWORK_API=https://devnet-api.multiversx.com
NEXT_PUBLIC_ENVIRONMENT=devnet

# WalletConnect V2 - OBRIGATÓRIO para xPortal
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=seu_project_id_aqui
```

**🔑 Como obter WalletConnect Project ID:**

1. Acesse: <https://cloud.walletconnect.com/>
2. Crie uma conta e novo projeto
3. Copie o Project ID
4. Cole no `.env.local`

### 2. MultiversX Devnet

O sistema está configurado para **MultiversX Devnet**:

- **Chain ID:** `D`
- **API:** `https://devnet-api.multiversx.com`
- **Explorer:** `https://devnet-explorer.multiversx.com`

### 3. Smart Contract

O contrato está deployado na devnet com as seguintes funções principais:

**Endpoints (Mutations):**

- `create_proposal(title, description, duration)` - Criar proposta
- `vote(proposal_id)` - Votar em proposta
- `cancel_proposal(proposal_id)` - Cancelar proposta

**Views (Queries):**

- `get_proposal_*` - Buscar dados de propostas
- `get_total_*` - Estatísticas gerais
- `has_user_voted_on_proposal` - Verificar se usuário votou

## 🔧 Desenvolvimento

```bash
npm run dev        # Desenvolvimento (hot reload)
npm run build      # Build para produção
npm run start      # Serve build de produção
npm run lint       # ESLint check
npm run type-check # TypeScript check
```

## 🎨 Features

### ✅ Design Moderno

- Interface com gradientes e animações suaves
- Componentes shadcn/ui para consistência visual
- Design system responsivo
- Modo escuro preparado
- Micro-animações e hover effects

### 🔐 Conectividade Real

- **Web Wallet** (Recomendado) - Sempre funciona
- **xPortal Mobile** - QR Code para app móvel
- **Extensão Browser** - DeFi Wallet extension
- **Ledger Hardware** - Dispositivos físicos

### 📋 Funcionalidades

- **Visualizar Propostas** - Lista propostas do smart contract
- **Sistema de Votação** - Vote com verificação de duplicatas
- **Criar Propostas** - Formulário com validações completas
- **Estatísticas Real-time** - Dados em tempo real do contrato
- **Fallback Inteligente** - Dados mock quando contrato vazio

### 🎯 Fluxo de Usuário

1. **Conectar Carteira** → xPortal, Web Wallet, Extensão ou Ledger
2. **Ver Propostas** → Lista propostas ativas do smart contract
3. **Votar** → Sistema verifica se já votou e registra na blockchain
4. **Criar Propostas** → Formulário com validações e preview
5. **Acompanhar** → Estatísticas em tempo real

## 🧪 Testando

### Pré-requisitos

- Carteira MultiversX (Web Wallet é mais fácil)
- xEGLD na Devnet ([Faucet oficial](https://devnet-wallet.multiversx.com/faucet))

### Fluxo de Teste

1. **Conectar carteira** usando o header
2. **Criar uma proposta** na aba "Governança"
3. **Votar em propostas** na aba "Propostas"
4. **Verificar transações** no [Explorer](https://devnet-explorer.multiversx.com)

### Opções de Carteira

- **🌐 Web Wallet** (Mais fácil) - Abre no navegador
- **📱 xPortal Mobile** - Escaneie QR Code
- **🔌 Extensão** - Requer instalação
- **🔒 Ledger** - Dispositivo físico

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# 1. Build local
npm run build

# 2. Deploy
npx vercel

# 3. Configurar variáveis no dashboard da Vercel
# - NEXT_PUBLIC_CONTRACT_ADDRESS
# - NEXT_PUBLIC_NETWORK_API
# - NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
```

### Docker

```bash
dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Problemas Comuns

## ❌ Carteira não conecta

- Use **Web Wallet** (sempre funciona)
- Para xPortal: configure WalletConnect Project ID
- Para Extensão: instale MultiversX DeFi Wallet

### ❌ Propostas não carregam

- Verifique endereço do contrato em `.env.local`
- Sistema usa fallback para dados mock automaticamente
- Check console para logs de debug

### ❌ CSS não funciona

- Confirme Tailwind CSS v3 (não v4)
- Verifique `postcss.config.js`
- Restart: `npm run dev`

### Debug

```bash
javascript
// Verificar estado da carteira
console.log('Is logged in:', useGetIsLoggedIn());
console.log('Account:', useGetAccountInfo());

// Verificar network provider
const provider = new ProxyNetworkProvider('https://devnet-api.multiversx.com');
console.log('Provider:', provider);
```

## 📚 Documentação Técnica

### Integração com Smart Contract

```bash
typescript
// Exemplo: Criar proposta
const transaction = {
  value: '0',
  data: `create_proposal@${titleHex}@${descriptionHex}@${durationHex}`,
  receiver: contractAddress,
  gasLimit: '10000000',
  chainID: 'D'
};

await sendTransactions({ transactions: [transaction] });
```

### Estrutura de Dados

```bash
typescript
interface ProposalData {
  id: number
  title: string
  description: string
  creator: string
  votesFor: number
  status: "Aberta" | "Fechada" | "Aprovada" | "Rejeitada"
  endsAt: number
}
```

### Componentes Principais

- **DappProvider** - Configuração da rede MultiversX
- **Header** - Sistema de login com múltiplas carteiras
- **ContractService** - Abstração para comunicação blockchain
- **CustomWalletButton** - Wrapper para botões de carteira

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [MultiversX Team](https://multiversx.com) - Blockchain infrastructure
- [Next.js Team](https://nextjs.org) - Amazing React framework
- [Tailwind Labs](https://tailwindcss.com) - Beautiful CSS framework
- [shadcn/ui](https://ui.shadcn.com) - Modern component library

---

## Feito com ❤️ para a comunidade blockchain

🔗 **Links Úteis:**

- [MultiversX Docs](https://docs.multiversx.com)
- [MultiversX SDK](https://github.com/multiversx/mx-sdk-js-core)
- [Devnet Explorer](https://devnet-explorer.multiversx.com)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
