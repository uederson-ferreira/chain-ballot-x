# 🔧 Setup Detalhado - ChainBallotX

Este guia cobre **todo o processo de setup** do projeto, desde a instalação básica até configurações avançadas.

## 📋 Pré-requisitos Detalhados

### **1. Node.js 18+**
```bash
# Verificar versão atual
node --version
npm --version

# Se não tiver ou versão antiga:
# MacOS (via Homebrew)
brew install node

# Windows (via Chocolatey)
choco install nodejs

# Linux (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version  # Deve ser 18.x ou superior
```

### **2. Yarn Package Manager**
```bash
# Instalar globalmente
npm install -g yarn

# Verificar
yarn --version  # Deve ser 1.22.x ou superior

# Alternativa: usar corepack (Node 16+)
corepack enable
corepack prepare yarn@stable --activate
```

### **3. Git**
```bash
# Verificar se já tem
git --version

# Se não tiver:
# MacOS
brew install git

# Windows
# Baixar de: https://git-scm.com/download/win

# Linux
sudo apt-get install git
```

### **4. Editor Recomendado: VSCode**
```bash
# Extensões essenciais
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
```

---

## 📦 Instalação Passo-a-Passo

### **Passo 1: Clone do Repositório**
```bash
# HTTPS
git clone https://github.com/seu-usuario/chain-ballot-x.git

# SSH (se configurado)
git clone git@github.com:seu-usuario/chain-ballot-x.git

# GitHub CLI
gh repo clone seu-usuario/chain-ballot-x

# Entrar no diretório
cd chain-ballot-x/frontend
```

### **Passo 2: Verificar Estrutura**
```bash
# Listar arquivos principais
ls -la

# Deve mostrar:
# ├── package.json
# ├── next.config.mjs
# ├── tailwind.config.ts
# ├── tsconfig.json
# └── src/
```

### **Passo 3: Instalar Dependências**
```bash
# Instalar todas as dependências
yarn install

# Verificar se instalou corretamente
yarn list --depth=0

# Se houver conflitos:
yarn install --force

# Limpar cache se necessário
yarn cache clean
```

### **Passo 4: Configurar Ambiente**
```bash
# Copiar template
cp .env.example .env.local

# Editar (escolha seu editor)
nano .env.local
# ou
code .env.local
# ou
vim .env.local
```

**Conteúdo do `.env.local`:**
```bash
# ===========================================
# CONFIGURAÇÕES BLOCKCHAIN MULTIVERSX
# ===========================================

# Endereço do smart contract (já deployado)
NEXT_PUBLIC_CONTRACT_ADDRESS=erd1qqqqqqqqqqqqqpgqehrq4xr838lrlv0h4ht20fnl9ywsw3v7sjus85qv7x

# API da rede (Devnet para desenvolvimento)
NEXT_PUBLIC_NETWORK_API=https://devnet-api.multiversx.com

# Ambiente (devnet/mainnet)
NEXT_PUBLIC_ENVIRONMENT=devnet

# ===========================================
# CONFIGURAÇÕES OPCIONAIS
# ===========================================

# WalletConnect Project ID (opcional)
# Criar em: https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# ===========================================
# CONFIGURAÇÕES DE PRODUÇÃO (COMENTADAS)
# ===========================================

# Para mainnet (CUIDADO - dinheiro real!)
# NEXT_PUBLIC_NETWORK_API=https://api.multiversx.com
# NEXT_PUBLIC_ENVIRONMENT=mainnet
# NEXT_PUBLIC_CONTRACT_ADDRESS=erd1...mainnet_address

# ===========================================
# CONFIGURAÇÕES DE DESENVOLVIMENTO
# ===========================================

# Next.js
NEXT_PUBLIC_APP_NAME=ChainBallotX
NEXT_PUBLIC_APP_VERSION=1.0.0

# Debugging (opcional)
# NEXT_PUBLIC_DEBUG=true
```

---

## 🚀 Primeira Execução

### **Passo 1: Build de Verificação**
```bash
# Testar se tudo compila
yarn build

# Se der erro, verificar:
# 1. Todas as dependências instaladas?
# 2. .env.local configurado?
# 3. Sem erros de TypeScript?
```

### **Passo 2: Executar em Desenvolvimento**
```bash
# Iniciar servidor de desenvolvimento
yarn dev

# Aguardar mensagem:
# ✓ Ready on http://localhost:3000
```

### **Passo 3: Testar no Browser**
```bash
# Abrir automaticamente
open http://localhost:3000

# Ou manualmente acessar:
# http://localhost:3000
```

### **Passo 4: Verificar Funcionalidades**
- ✅ Página carrega sem erros
- ✅ Header aparece com botões de login
- ✅ Navegação funciona (Propostas, Governança)
- ✅ Console sem erros críticos (F12)

---

## ⚙️ Configurações Avançadas

### **1. VSCode Settings**

Criar `.vscode/settings.json`:
```json
{
  "typescript.preferences.preferTypeOnlyAutoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "css.validate": false,
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["className\\s*:\\s*['\"`]([^'\"`;]*)['\"`]", "([^'\"`;]*)"]
  ]
}
```

### **2. Prettier Configuration**

Criar `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### **3. Git Hooks (Opcional)**

Instalar Husky para hooks:
```bash
# Instalar husky
yarn add -D husky

# Configurar
npx husky install

# Pre-commit hook
npx husky add .husky/pre-commit "yarn lint && yarn type-check"
```

---

## 🐛 Resolução de Problemas no Setup

### **❌ Erro: "Module not found"**
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules
rm yarn.lock
yarn install
```

### **❌ Erro: "Port 3000 already in use"**
```bash
# Verificar processo usando a porta
lsof -ti:3000

# Matar processo
kill -9 $(lsof -ti:3000)

# Ou usar porta diferente
yarn dev -p 3001
```

### **❌ Erro: "Cannot resolve 'crypto'"**
```bash
# Verificar next.config.mjs
# Deve ter fallbacks configurados:
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      stream: false,
      buffer: require.resolve('buffer'),
    };
  }
  return config;
},
```

### **❌ Erro: "ESLint configuration error"**
```bash
# Reinstalar ESLint
yarn add -D eslint eslint-config-next

# Verificar .eslintrc.json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

### **❌ Erro: "Tailwind classes not working"**
```bash
# Verificar se PostCSS está configurado
# Criar postcss.config.mjs se não existir:
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

# Limpar cache
rm -rf .next
yarn dev
```

---

## 🔧 Scripts Personalizados

Adicionar no `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf .next node_modules",
    "reset": "yarn clean && yarn install",
    "analyze": "ANALYZE=true yarn build"
  }
}
```

---

## 📊 Verificação Final

### **Checklist de Setup Completo**
- [ ] Node.js 18+ instalado
- [ ] Yarn instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas sem erros
- [ ] `.env.local` configurado
- [ ] `yarn build` executa sem erros
- [ ] `yarn dev` inicia servidor
- [ ] Aplicação abre no browser
- [ ] Console sem erros críticos
- [ ] VSCode configurado (opcional)
- [ ] Git hooks configurados (opcional)

### **Comandos de Teste Final**
```bash
# Teste completo
yarn type-check && yarn lint && yarn build && yarn dev
```

Se todos os passos passaram, **parabéns!** 🎉 
Seu ambiente está 100% configurado e pronto para desenvolvimento.

---

## 📚 Próximos Passos

1. **Ler** [Arquitetura Técnica](./ARCHITECTURE.md)
2. **Configurar** carteira xPortal para testes
3. **Estudar** [API Reference](./API.md)
4. **Começar** desenvolvimento!

---

**💡 Dica:** Mantenha este guia como referência para novos desenvolvedores na equipe!