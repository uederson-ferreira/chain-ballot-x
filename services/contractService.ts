import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';
import { Address, ContractFunction, Query, U64Value, AddressValue } from '@multiversx/sdk-core';

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

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 
  'erd1qqqqqqqqqqqqqpgqehrq4xr838lrlv0h4ht20fnl9ywsw3v7sjus85qv7x';

const NETWORK_API = process.env.NEXT_PUBLIC_NETWORK_API || 
  'https://devnet-api.multiversx.com';

export class ContractService {
  private networkProvider: ProxyNetworkProvider;
  private contractAddress: Address;

  constructor() {
    this.networkProvider = new ProxyNetworkProvider(NETWORK_API);
    this.contractAddress = new Address(CONTRACT_ADDRESS);
  }

  // Buscar todas as propostas usando as funções individuais
  async getProposals(): Promise<ProposalData[]> {
    try {
      console.log('🔍 Buscando propostas do contrato...');
      
      // Primeiro buscar o total de propostas
      const totalProposalsQuery = new Query({
        address: this.contractAddress,
        func: new ContractFunction('get_total_proposals'),
        args: []
      });

      const totalResponse = await this.networkProvider.queryContract(totalProposalsQuery);
      
      if (!totalResponse.returnData || totalResponse.returnData.length === 0) {
        console.log('📋 Nenhuma proposta encontrada, retornando dados mock');
        return this.getMockProposals();
      }

      const totalProposals = parseInt(Buffer.from(totalResponse.returnData[0], 'base64').toString('hex'), 16);
      console.log(`📊 Total de propostas no contrato: ${totalProposals}`);

      if (totalProposals === 0) {
        return this.getMockProposals();
      }

      // Buscar dados de cada proposta individualmente
      const proposals: ProposalData[] = [];
      
      for (let i = 0; i < totalProposals; i++) {
        try {
          const proposal = await this.getProposal(i);
          if (proposal) {
            proposals.push(proposal);
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar proposta ${i}:`, error);
        }
      }

      console.log(`✅ ${proposals.length} propostas carregadas com sucesso`);
      return proposals.length > 0 ? proposals : this.getMockProposals();
    } catch (error) {
      console.error('❌ Erro ao buscar propostas do contrato:', error);
      console.log('🔄 Retornando dados mock como fallback');
      return this.getMockProposals();
    }
  }

  // Buscar uma proposta específica
  async getProposal(proposalId: number): Promise<ProposalData | null> {
    try {
      // Buscar todos os dados da proposta em paralelo
      const [titleResponse, descriptionResponse, creatorResponse, voteCountResponse, deadlineResponse, activeResponse] = await Promise.all([
        this.queryContract('get_proposal_title', [new U64Value(proposalId)]),
        this.queryContract('get_proposal_description', [new U64Value(proposalId)]),
        this.queryContract('get_proposal_creator', [new U64Value(proposalId)]),
        this.queryContract('get_proposal_vote_count', [new U64Value(proposalId)]),
        this.queryContract('get_proposal_deadline', [new U64Value(proposalId)]),
        this.queryContract('is_proposal_active', [new U64Value(proposalId)])
      ]);

      // Decodificar resultados
      const title = this.decodeString(titleResponse) || `Proposta ${proposalId + 1}`;
      const description = this.decodeString(descriptionResponse) || 'Sem descrição';
      const creator = this.decodeAddress(creatorResponse) || '';
      const votesFor = this.decodeNumber(voteCountResponse) || 0;
      const endsAt = (this.decodeNumber(deadlineResponse) || 0) * 1000; // converter para ms
      const isActive = this.decodeBool(activeResponse);

      const currentTime = Date.now();
      let status: 'Aberta' | 'Fechada' | 'Aprovada' | 'Rejeitada' = 'Aberta';
      
      if (!isActive) {
        status = 'Fechada';
      } else if (currentTime > endsAt) {
        status = votesFor > 0 ? 'Aprovada' : 'Rejeitada';
      }

      return {
        id: proposalId,
        title,
        description,
        creator,
        votesFor,
        votesAgainst: 0, // Seu contrato não tem votos contra
        status,
        createdAt: currentTime - (7 * 24 * 60 * 60 * 1000), // Estimativa
        endsAt
      };

    } catch (error) {
      console.error(`❌ Erro ao buscar proposta ${proposalId}:`, error);
      return null;
    }
  }

  // Verificar se o usuário já votou em uma proposta
  async hasVoted(userAddress: string, proposalId: number): Promise<boolean> {
    try {
      const response = await this.queryContract('has_user_voted_on_proposal', [
        new U64Value(proposalId), 
        new AddressValue(new Address(userAddress))
      ]);
      
      return this.decodeBool(response);
    } catch (error) {
      console.error('❌ Erro ao verificar voto:', error);
      return false;
    }
  }

  // Buscar estatísticas do contrato
  async getContractStats() {
    try {
      const [proposalsResponse, votesResponse] = await Promise.all([
        this.queryContract('get_total_proposals', []),
        this.queryContract('get_total_votes', [])
      ]);

      const totalProposals = this.decodeNumber(proposalsResponse) || 0;
      const totalVotes = this.decodeNumber(votesResponse) || 0;

      return {
        totalProposals,
        totalVotes,
        activeProposals: Math.max(0, totalProposals - Math.floor(totalProposals * 0.2)), // Estimativa: 80% ativas
        participants: Math.max(1, Math.floor(totalVotes * 0.7)) // Estimativa
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return {
        totalProposals: 3,
        totalVotes: 85,
        activeProposals: 3,
        participants: 42
      };
    }
  }

  // Funções auxiliares para queries
  private async queryContract(functionName: string, args: any[]): Promise<any> {
    const query = new Query({
      address: this.contractAddress,
      func: new ContractFunction(functionName),
      args
    });

    return await this.networkProvider.queryContract(query);
  }

  // Funções auxiliares para decodificação
  private decodeString(response: any): string | null {
    try {
      if (response.returnData && response.returnData.length > 0) {
        return Buffer.from(response.returnData[0], 'base64').toString('utf8');
      }
      return null;
    } catch {
      return null;
    }
  }

  private decodeNumber(response: any): number | null {
    try {
      if (response.returnData && response.returnData.length > 0) {
        const hex = Buffer.from(response.returnData[0], 'base64').toString('hex');
        return hex ? parseInt(hex, 16) : 0;
      }
      return null;
    } catch {
      return null;
    }
  }

  private decodeBool(response: any): boolean {
    try {
      if (response.returnData && response.returnData.length > 0) {
        const hex = Buffer.from(response.returnData[0], 'base64').toString('hex');
        return hex === '01';
      }
      return false;
    } catch {
      return false;
    }
  }

  private decodeAddress(response: any): string {
    try {
      if (response.returnData && response.returnData.length > 0) {
        const hex = Buffer.from(response.returnData[0], 'base64').toString('hex');
        return hex ? `erd1${hex}` : '';
      }
      return '';
    } catch {
      return '';
    }
  }

  // Dados mock para demonstração quando não há propostas
  private getMockProposals(): ProposalData[] {
    return [
      {
        id: 0,
        title: 'Bem-vindo ao ChainBallotX!',
        description: 'Esta é uma proposta de demonstração criada automaticamente. Crie sua primeira proposta real usando o formulário na aba Governança. O sistema permite votação descentralizada e transparente na blockchain MultiversX.',
        creator: 'erd1demo1234567890abcdef1234567890abcdef1234567890abcdef12',
        votesFor: 15,
        votesAgainst: 3,
        status: 'Aberta',
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        endsAt: Date.now() + 5 * 24 * 60 * 60 * 1000
      },
      {
        id: 1,
        title: 'Implementar Sistema de Recompensas',
        description: 'Proposta para implementar um sistema de recompensas para usuários ativos na plataforma. Isso incentivaria maior participação na governança e criaria um ecossistema mais engajado.',
        creator: 'erd1example1234567890abcdef1234567890abcdef1234567890abcdef12',
        votesFor: 28,
        votesAgainst: 7,
        status: 'Aberta',
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        endsAt: Date.now() + 6 * 24 * 60 * 60 * 1000
      },
      {
        id: 2,
        title: 'Melhorar Interface do Usuário',
        description: 'Proposta para redesenhar a interface do usuário com foco em melhor experiência e acessibilidade. Incluiria modo escuro, melhor responsividade e navegação mais intuitiva.',
        creator: 'erd1ui1234567890abcdef1234567890abcdef1234567890abcdef12',
        votesFor: 42,
        votesAgainst: 5,
        status: 'Aberta',
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        endsAt: Date.now() + 4 * 24 * 60 * 60 * 1000
      }
    ];
  }
}