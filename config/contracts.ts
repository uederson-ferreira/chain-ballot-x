export interface ProposalData {
  id: number
  title: string
  description: string
  creator: string
  votesFor: number
  votesAgainst: number
  status: "Aberta" | "Fechada" | "Aprovada" | "Rejeitada"
  createdAt: number
  endsAt: number
}

export const contractConfig = {
  votingContract:
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "erd1qqqqqqqqqqqqqpgqehrq4xr838lrlv0h4ht20fnl9ywsw3v7sjus85qv7x",
  network: {
    apiUrl: "https://devnet-api.multiversx.com",
    chainId: "D",
  },
  // Baseado no ABI real do contrato
  contractFunctions: {
    // Funções administrativas
    pause: "pause",
    unpause: "unpause",
    transferOwnership: "transfer_ownership",

    // Funções de proposta
    createProposal: "create_proposal",
    vote: "vote",
    cancelProposal: "cancel_proposal",

    // Funções de consulta (views)
    getProposalTitle: "get_proposal_title",
    getProposalDescription: "get_proposal_description",
    getProposalCreator: "get_proposal_creator",
    getProposalVoteCount: "get_proposal_vote_count",
    getProposalDeadline: "get_proposal_deadline",
    isProposalActive: "is_proposal_active",
    getTotalProposals: "get_total_proposals",
    getTotalVotes: "get_total_votes",
    hasUserVotedOnProposal: "has_user_voted_on_proposal", // Nome correto do ABI
    isContractPaused: "is_contract_paused",
    getOwner: "get_owner",
  },
  // Eventos do contrato
  events: {
    contractInitialized: "contractInitialized",
    proposalCreated: "proposalCreated",
    voteCast: "voteCast",
    proposalCancelled: "proposalCancelled",
    contractPaused: "contractPaused",
    contractUnpaused: "contractUnpaused",
    ownershipTransferred: "ownershipTransferred",
  },
}

export const mockProposals: ProposalData[] = [
  {
    id: 0,
    title: "Bem-vindo ao ChainBallotX!",
    description:
      "Esta é uma proposta de demonstração. Crie sua primeira proposta real usando o formulário na aba Governança. O sistema permite votação descentralizada e transparente na blockchain MultiversX.",
    creator: "erd1demo1234567890abcdef1234567890abcdef1234567890abcdef12",
    votesFor: 15,
    votesAgainst: 3,
    status: "Aberta",
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    endsAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: 1,
    title: "Implementar Sistema de Recompensas",
    description:
      "Proposta para implementar um sistema de recompensas para usuários ativos na plataforma. Isso incentivaria maior participação na governança e criaria um ecossistema mais engajado.",
    creator: "erd1example1234567890abcdef1234567890abcdef1234567890abcdef12",
    votesFor: 28,
    votesAgainst: 7,
    status: "Aberta",
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    endsAt: Date.now() + 6 * 24 * 60 * 60 * 1000,
  },
  {
    id: 2,
    title: "Melhorar Interface do Usuário",
    description:
      "Proposta para redesenhar a interface do usuário com foco em melhor experiência e acessibilidade. Incluiria modo escuro, melhor responsividade e navegação mais intuitiva.",
    creator: "erd1ui1234567890abcdef1234567890abcdef1234567890abcdef12",
    votesFor: 42,
    votesAgainst: 5,
    status: "Aberta",
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    endsAt: Date.now() + 4 * 24 * 60 * 60 * 1000,
  },
]
