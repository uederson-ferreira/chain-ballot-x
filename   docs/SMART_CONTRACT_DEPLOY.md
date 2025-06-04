# 🚀 Smart Contract Deploy - ChainBallotX

Este documento detalha todo o processo de deploy, upgrade e gestão do smart contract na blockchain MultiversX.

## 📋 Índice

- [🛠️ Preparação do Ambiente](#️-preparação-do-ambiente)
- [🔨 Build do Contrato](#-build-do-contrato)
- [🚀 Deploy Inicial](#-deploy-inicial)
- [⬆️ Upgrade do Contrato](#️-upgrade-do-contrato)
- [🔍 Verificação do Deploy](#-verificação-do-deploy)
- [🎛️ Gerenciamento de Contratos](#️-gerenciamento-de-contratos)
- [🐛 Troubleshooting](#-troubleshooting)

---

## 🛠️ Preparação do Ambiente

### **1. Instalar MultiversX CLI**

```bash
# Via pip (Python 3.8+)
pip3 install multiversx-sdk-cli --upgrade

# Verificar instalação
mxpy --version

# Configurar para devnet
mxpy config set dependencies.vmtools.tag v1.5.26
mxpy config set chainID D
mxpy config set proxy https://devnet-api.multiversx.com
```

### **2. Instalar Rust + sc-meta**

```bash
# Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Instalar sc-meta (MultiversX smart contract meta-tool)
cargo install multiversx-sc-meta

# Verificar
sc-meta --version
```

### **3. Estrutura de Diretórios**

```bash
project/
├── smart-contract/
│   ├── chainballotx/
│   │   ├── src/
│   │   │   └── lib.rs              # Código principal
│   │   ├── Cargo.toml              # Dependências Rust
│   │   └── output/                 # Arquivos compilados
│   │       ├── chainballotx.wasm   # Bytecode
│   │       └── chainballotx.abi.json # ABI
│   └── wallets/
│       └── deployer/
│           └── SUA_CARTEIRA_AQUI.pem
└── frontend/                       # Frontend Next.js
```

---

## 🔨 Build do Contrato

### **Comando de Build**

```bash
# Navegar para o diretório do contrato
cd smart-contract/chainballotx

# Build completo
sc-meta all build

# Ou build manual step-by-step
cargo build --target wasm32-unknown-unknown --release

# Gerar ABI
sc-meta all abi
```

### **Verificar Arquivos Gerados**

```bash
# Listar arquivos de output
ls -la output/

# Deve conter:
# ├── chainballotx.wasm           # Bytecode do contrato
# ├── chainballotx.abi.json       # Interface ABI
# ├── chainballotx.mxsc.json      # Metadata completa
# └── chainballotx_proxy.rs       # Proxy gerado
```

### **Validar WASM**

```bash
# Verificar tamanho (deve ser < 4MB)
ls -lh output/chainballotx.wasm

# Verificar se é WASM válido
file output/chainballotx.wasm
# Output: output/chainballotx.wasm: WebAssembly (wasm) binary module version 0x1 (MVP)
```

---

## 🚀 Deploy Inicial

### **Comando Usado (Template para Deploy)**

```bash
mxpy contract deploy \
  --bytecode smart-contract/chainballotx/output/chainballotx.wasm \
  --pem smart-contract/wallets/deployer/SUA_CARTEIRA_AQUI.pem \
  --gas-limit=60000000 \
  --chain=D \
  --proxy=https://devnet-api.multiversx.com \
  --send
```

### **Breakdown dos Parâmetros**

#### `--bytecode`

```bash
--bytecode smart-contract/chainballotx/output/chainballotx.wasm
```

- **Path**: Caminho para o arquivo WASM compilado
- **Tamanho**: ~4.7KB (arquivo pequeno e otimizado)
- **Formato**: WebAssembly binário

#### `--pem`

```bash
--pem smart-contract/wallets/deployer/SUA_CARTEIRA_AQUI.pem
```

- **Owner**: Sua carteira de deploy (substitua pelo seu arquivo .pem)
- **Formato PEM**: Chave privada para assinar transação
- **Permissões**: Dono do contrato (pode fazer upgrades)

#### `--gas-limit`

```bash
--gas-limit=60000000
```

- **Deploy**: 60M gas units (generoso para deploy complexo)
- **Custo**: ~0.006 xEGLD (muito barato na devnet)
- **Recomendado**: 50-100M para deploys iniciais

#### `--chain`

```bash
--chain=D
```

- **D**: Devnet (desenvolvimento)
- **1**: Mainnet (produção)
- **T**: Testnet (testes)

#### `--proxy`

```bash
--proxy=https://devnet-api.multiversx.com
```

- **API Endpoint**: Gateway para devnet
- **Alternativas**: `https://api.multiversx.com` (mainnet)

#### `--send`

```bash
--send
```

- **Execução**: Envia transação imediatamente
- **Sem --send**: Apenas simula (dry-run)

---

### **Variações do Comando Deploy**

#### **Deploy com Argumentos Iniciais**

```bash
mxpy contract deploy \
  --bytecode chainballotx.wasm \
  --pem SUA_CARTEIRA.pem \
  --gas-limit=60000000 \
  --arguments 0x01 0x48656c6c6f  # Exemplo: bool, string "Hello"
  --chain=D \
  --proxy=https://devnet-api.multiversx.com \
  --send
```

#### **Deploy com Valor (Payable)**

```bash
mxpy contract deploy \
  --bytecode chainballotx.wasm \
  --pem SUA_CARTEIRA.pem \
  --gas-limit=60000000 \
  --value=1000000000000000000  # 1 xEGLD
  --chain=D \
  --proxy=https://devnet-api.multiversx.com \
  --send
```

#### **Deploy com Recall Nonce**

```bash
mxpy contract deploy \
  --bytecode chainballotx.wasm \
  --pem SUA_CARTEIRA.pem \
  --gas-limit=60000000 \
  --recall-nonce \
  --chain=D \
  --proxy=https://devnet-api.multiversx.com \
  --send
```

---

## ⬆️ Upgrade do Contrato

### **Comando de Upgrade**

```bash
mxpy contract upgrade SEU_ENDERECO_DO_CONTRATO \
  --bytecode smart-contract/chainballotx/output/chainballotx.wasm \
  --pem smart-contract/wallets/deployer/SUA_CARTEIRA.pem \
  --gas-limit=60000000 \
  --chain=D \
  --proxy=https://devnet-api.multiversx.com \
  --send
```

### **Upgrade com Migração de Dados**

```bash
# Se precisar migrar dados entre versões
mxpy contract upgrade SEU_ENDERECO_DO_CONTRATO \
  --bytecode chainballotx.wasm \
  --pem SUA_CARTEIRA.pem \
  --gas-limit=100000000 \
  --arguments 0x01  # Flag de migração
  --chain=D \
  --proxy=https://devnet-api.multiversx.com \
  --send
```

---

## 🔍 Verificação do Deploy

### **1. Verificar Transação**

```bash
# Usar o hash retornado pelo deploy
mxpy tx get --hash=<TRANSACTION_HASH> --proxy=https://devnet-api.multiversx.com

# Exemplo de resposta
{
  "status": "success",
  "gasUsed": 52341234,
  "smartContractResults": [...],
  "logs": {
    "events": [
      {
        "address": "erd1qqqqqqqqqqqqqpgqehrq4xr838lrlv0h4ht20fnl9ywsw3v7sjus85qv7x",
        "identifier": "contractInitialized",
        "topics": ["base64_encoded_owner_address"]
      }
    ]
  }
}
```

### **2. Verificar Contrato no Explorer**

```bash
# Abrir no browser (substitua pelo seu endereço de contrato)
open https://devnet-explorer.multiversx.com/accounts/SEU_ENDERECO_DO_CONTRATO
```

### **3. Testar Funções View**

```bash
# Testar get_total_proposals
mxpy contract query SEU_ENDERECO_DO_CONTRATO \
  --function="get_total_proposals" \
  --proxy=https://devnet-api.multiversx.com

# Testar get_owner
mxpy contract query SEU_ENDERECO_DO_CONTRATO \
  --function="get_owner" \
  --proxy=https://devnet-api.multiversx.com
```

### **4. Criar Proposta de Teste**

```bash
# Criar proposta via CLI
mxpy contract call SEU_ENDERECO_DO_CONTRATO \
  --function="create_proposal" \
  --arguments str:TestProposal str:DescricaoTeste 0x0000000000015180 \
  --pem SUA_CARTEIRA.pem \
  --gas-limit=10000000 \
  --chain=D \
  --proxy=https://devnet-api.multiversx.com \
  --send
```

---

## 🎛️ Gerenciamento de Contratos

### **Pausar Contrato (Emergency)**

```bash
mxpy contract call SEU_ENDERECO_DO_CONTRATO \
  --function="pause" \
  --pem SUA_CARTEIRA.pem \
  --gas-limit=5000000 \
  --chain=D \
  --proxy=https://devnet-api.multiversx.com \
  --send
```

### **Reativar Contrato**

```bash
mxpy contract call SEU_ENDERECO_DO_CONTRATO \
  --function="unpause" \
  --pem SUA_CARTEIRA.pem \
  --gas-limit=5000000 \
  --chain=D \
  --proxy=https://devnet-api.multiversx.com \
  --send
```

### **Transferir Ownership**

```bash
mxpy contract call SEU_ENDERECO_DO_CONTRATO \
  --function="transfer_ownership" \
  --arguments erd1NOVO_OWNER_ADDRESS \
  --pem SUA_CARTEIRA.pem \
  --gas-limit=5000000 \
  --chain=D \
  --proxy=https://devnet-api.multiversx.com \
  --send
```

---

## 🐛 Troubleshooting

### **❌ Erro: "insufficient funds"**

```bash
# Verificar saldo da carteira
mxpy account get --address=SEU_ENDERECO --proxy=https://devnet-api.multiversx.com

# Pegar xEGLD grátis no faucet
# Acessar: https://devnet-wallet.multiversx.com/faucet
```

### **❌ Erro: "invalid nonce"**

```bash
# Usar --recall-nonce para buscar nonce automaticamente
mxpy contract deploy \
  --bytecode chainballotx.wasm \
  --pem SUA_CARTEIRA.pem \
  --recall-nonce \
  --gas-limit=60000000 \
  --chain=D \
  --proxy=https://devnet-api.multiversx.com \
  --send
```

### **❌ Erro: "transaction failed"**

```bash
# Verificar detalhes da transação
mxpy tx get --hash=SEU_TRANSACTION_HASH --proxy=https://devnet-api.multiversx.com

# Aumentar gas limit se "out of gas"
--gas-limit=100000000
```

### **❌ Erro: "account not found"**

```bash
# Verificar se endereço está correto
mxpy account get --address=SEU_ENDERECO --proxy=https://devnet-api.multiversx.com

# Verificar se está na rede correta (D = devnet)
```

### **❌ Erro: "build failed"**

```bash
# Limpar e rebuild
cargo clean
sc-meta all clean
sc-meta all build

# Verificar versão do Rust
rustc --version  # Deve ser 1.70+

# Atualizar dependências
cargo update
```

---

## 📚 Scripts Úteis

### **Script de Deploy Automatizado**

```bash
#!/bin/bash
# deploy.sh

echo "🔨 Building contract..."
cd smart-contract/chainballotx
sc-meta all build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
    echo "🚀 Deploying to devnet..."
    
    mxpy contract deploy \
        --bytecode output/chainballotx.wasm \
        --pem ../wallets/deployer/SUA_CARTEIRA.pem \
        --gas-limit=60000000 \
        --recall-nonce \
        --chain=D \
        --proxy=https://devnet-api.multiversx.com \
        --send
else
    echo "❌ Build failed"
    exit 1
fi
```

### **Script de Upgrade**

```bash
#!/bin/bash
# upgrade.sh

CONTRACT_ADDRESS=$1

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Uso: ./upgrade.sh <contract_address>"
    exit 1
fi

echo "🔨 Building new version..."
cd smart-contract/chainballotx
sc-meta all build

echo "⬆️ Upgrading contract $CONTRACT_ADDRESS..."
mxpy contract upgrade $CONTRACT_ADDRESS \
    --bytecode output/chainballotx.wasm \
    --pem ../wallets/deployer/SUA_CARTEIRA.pem \
    --gas-limit=60000000 \
    --recall-nonce \
    --chain=D \
    --proxy=https://devnet-api.multiversx.com \
    --send
```

### **Script de Verificação**

```bash
#!/bin/bash
# verify.sh

CONTRACT_ADDRESS=$1

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Uso: ./verify.sh <contract_address>"
    exit 1
fi

echo "🔍 Verificando contrato $CONTRACT_ADDRESS..."

echo "📊 Total de propostas:"
mxpy contract query $CONTRACT_ADDRESS \
    --function="get_total_proposals" \
    --proxy=https://devnet-api.multiversx.com

echo "👤 Owner do contrato:"
mxpy contract query $CONTRACT_ADDRESS \
    --function="get_owner" \
    --proxy=https://devnet-api.multiversx.com

echo "⏸️ Status (pausado?):"
mxpy contract query $CONTRACT_ADDRESS \
    --function="is_contract_paused" \
    --proxy=https://devnet-api.multiversx.com
```

---

## 🎯 Resumo dos Comandos Principais

### **Deploy Initial**

```bash
mxpy contract deploy --bytecode chainballotx.wasm --pem SUA_CARTEIRA.pem --gas-limit=60000000 --chain=D --proxy=https://devnet-api.multiversx.com --send
```

### **Query (View)**

```bash
mxpy contract query SEU_CONTRATO --function="FUNCAO" --proxy=https://devnet-api.multiversx.com
```

### **Call (Write)**

```bash
mxpy contract call SEU_CONTRATO --function="FUNCAO" --pem SUA_CARTEIRA.pem --gas-limit=10000000 --chain=D --proxy=https://devnet-api.multiversx.com --send
```

### **Upgrade**

```bash
mxpy contract upgrade SEU_CONTRATO --bytecode chainballotx.wasm --pem SUA_CARTEIRA.pem --gas-limit=60000000 --chain=D --proxy=https://devnet-api.multiversx.com --send
```

---

**🎉 Seu contrato está deployado e funcionando na devnet MultiversX!**

Para integrar com o frontend, atualize o `.env.local` com o endereço do seu contrato:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=SEU_ENDERECO_DO_CONTRATO
```
