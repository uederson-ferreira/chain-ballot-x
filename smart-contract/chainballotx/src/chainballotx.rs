// chainballotx.rs
// Localização: contracts/chainballotx.rs

#![no_std]

use multiversx_sc::imports::*;

pub mod chainballotx_proxy;

// Constantes do contrato
const MIN_DURATION: u64 = 3600; // 1 hora
const MAX_PROPOSALS_PER_USER: usize = 10;
const MAX_TITLE_LENGTH: usize = 100;
const MAX_DESCRIPTION_LENGTH: usize = 1000;

#[multiversx_sc::contract]
pub trait ChainBallotX {
    #[init]
    fn init(&self) {
        let caller = self.blockchain().get_caller();
        self.owner().set(&caller);
        self.is_paused().set(false);
        self.total_proposals().set(0u64);
        self.total_votes().set(0u64);
        self.contract_initialized_event(&caller);
    }

    // ============= FUNCÕES ADMINISTRATIVAS =============

    #[endpoint]
    fn pause(&self) {
        self.require_owner();
        self.is_paused().set(true);
        self.contract_paused_event();
    }

    #[endpoint]
    fn unpause(&self) {
        self.require_owner();
        self.is_paused().set(false);
        self.contract_unpaused_event();
    }

    #[endpoint]
    fn transfer_ownership(&self, new_owner: ManagedAddress) {
        self.require_owner();
        require!(!new_owner.is_zero(), "Invalid new owner address");
        
        let old_owner = self.owner().get();
        self.owner().set(&new_owner);
        self.ownership_transferred_event(&old_owner, &new_owner);
    }

    // ============= FUNCÕES DE PROPOSTA =============

    #[endpoint]
    fn create_proposal(
        &self,
        title: ManagedBuffer,
        description: ManagedBuffer,
        duration: u64,
    ) {
        self.require_not_paused();
        let caller = self.blockchain().get_caller();

        // Validações básicas
        require!(!title.is_empty(), "Title cannot be empty");
        require!(!description.is_empty(), "Description cannot be empty");
        require!(title.len() <= MAX_TITLE_LENGTH, "Title too long");
        require!(description.len() <= MAX_DESCRIPTION_LENGTH, "Description too long");
        require!(duration >= MIN_DURATION, "Duration too short");

        // Limitar propostas por usuário
        let user_proposals = self.user_proposal_count(&caller).get();
        require!(
            user_proposals < MAX_PROPOSALS_PER_USER,
            "Maximum proposals per user exceeded"
        );

        // Criar a proposta
        let proposal_id = self.total_proposals().get();
        let current_time = self.blockchain().get_block_timestamp();
        
        self.proposal_title(proposal_id).set(&title);
        self.proposal_description(proposal_id).set(&description);
        self.proposal_creator(proposal_id).set(&caller);
        self.proposal_deadline(proposal_id).set(current_time + duration);
        self.proposal_vote_count(proposal_id).set(0u64);
        self.proposal_active(proposal_id).set(true);

        // Atualizar contadores
        self.total_proposals().update(|x| *x += 1);
        self.user_proposal_count(&caller).update(|x| *x += 1);

        self.proposal_created_event(proposal_id, &caller);
    }

    #[endpoint]
    fn vote(&self, proposal_id: u64) {
        self.require_not_paused();
        
        let caller = self.blockchain().get_caller();
        let current_time = self.blockchain().get_block_timestamp();

        // Validações
        require!(proposal_id < self.total_proposals().get(), "Proposal does not exist");
        require!(self.proposal_active(proposal_id).get(), "Proposal is not active");
        require!(current_time <= self.proposal_deadline(proposal_id).get(), "Voting period ended");
        require!(
            !self.has_voted(proposal_id, &caller).get(),
            "Already voted on this proposal"
        );

        // Registrar voto
        self.proposal_vote_count(proposal_id).update(|x| *x += 1);
        self.has_voted(proposal_id, &caller).set(true);
        self.total_votes().update(|x| *x += 1);

        self.vote_cast_event(proposal_id, &caller);
    }

    #[endpoint]
    fn cancel_proposal(&self, proposal_id: u64) {
        self.require_not_paused();
        let caller = self.blockchain().get_caller();
        
        // Validações
        require!(proposal_id < self.total_proposals().get(), "Proposal does not exist");
        require!(self.proposal_active(proposal_id).get(), "Proposal is not active");
        require!(
            caller == self.proposal_creator(proposal_id).get() || caller == self.owner().get(),
            "Only creator or owner can cancel proposal"
        );

        // Cancelar
        self.proposal_active(proposal_id).set(false);
        self.proposal_cancelled_event(proposal_id, &caller);
    }

    // ============= VIEWS SIMPLES =============

    #[view]
    fn get_proposal_title(&self, proposal_id: u64) -> ManagedBuffer {
        require!(
            proposal_id < self.total_proposals().get(),
            "Proposal does not exist"
        );
        self.proposal_title(proposal_id).get()
    }

    #[view]
    fn get_proposal_description(&self, proposal_id: u64) -> ManagedBuffer {
        require!(
            proposal_id < self.total_proposals().get(),
            "Proposal does not exist"
        );
        self.proposal_description(proposal_id).get()
    }

    #[view]
    fn get_proposal_creator(&self, proposal_id: u64) -> ManagedAddress {
        require!(
            proposal_id < self.total_proposals().get(),
            "Proposal does not exist"
        );
        self.proposal_creator(proposal_id).get()
    }

    #[view]
    fn get_proposal_vote_count(&self, proposal_id: u64) -> u64 {
        require!(
            proposal_id < self.total_proposals().get(),
            "Proposal does not exist"
        );
        self.proposal_vote_count(proposal_id).get()
    }

    #[view]
    fn get_proposal_deadline(&self, proposal_id: u64) -> u64 {
        require!(
            proposal_id < self.total_proposals().get(),
            "Proposal does not exist"
        );
        self.proposal_deadline(proposal_id).get()
    }

    #[view]
    fn is_proposal_active(&self, proposal_id: u64) -> bool {
        require!(
            proposal_id < self.total_proposals().get(),
            "Proposal does not exist"
        );
        self.proposal_active(proposal_id).get()
    }

    #[view]
    fn get_total_proposals(&self) -> u64 {
        self.total_proposals().get()
    }

    #[view]
    fn get_total_votes(&self) -> u64 {
        self.total_votes().get()
    }

    #[view]
    fn has_user_voted_on_proposal(&self, proposal_id: u64, user_address: ManagedAddress) -> bool {
        require!(
            proposal_id < self.total_proposals().get(),
            "Proposal does not exist"
        );
        self.has_voted(proposal_id, &user_address).get()
    }

    #[view]
    fn is_contract_paused(&self) -> bool {
        self.is_paused().get()
    }

    #[view]
    fn get_owner(&self) -> ManagedAddress {
        self.owner().get()
    }

    // ============= FUNCÕES AUXILIARES =============

    fn require_owner(&self) {
        let caller = self.blockchain().get_caller();
        require!(caller == self.owner().get(), "Only owner can call this function");
    }

    fn require_not_paused(&self) {
        require!(!self.is_paused().get(), "Contract is paused");
    }

    // ============= EVENTOS =============

    #[event("contractInitialized")]
    fn contract_initialized_event(&self, #[indexed] owner: &ManagedAddress);

    #[event("proposalCreated")]
    fn proposal_created_event(
        &self,
        #[indexed] proposal_id: u64,
        #[indexed] creator: &ManagedAddress,
    );

    #[event("voteCast")]
    fn vote_cast_event(
        &self,
        #[indexed] proposal_id: u64,
        #[indexed] voter: &ManagedAddress,
    );

    #[event("proposalCancelled")]
    fn proposal_cancelled_event(
        &self, 
        #[indexed] proposal_id: u64, 
        #[indexed] cancelled_by: &ManagedAddress
    );

    #[event("contractPaused")]
    fn contract_paused_event(&self);

    #[event("contractUnpaused")]
    fn contract_unpaused_event(&self);

    #[event("ownershipTransferred")]
    fn ownership_transferred_event(
        &self, 
        #[indexed] old_owner: &ManagedAddress, 
        #[indexed] new_owner: &ManagedAddress
    );

    // ============= STORAGE MAPPERS =============

    #[storage_mapper("owner")]
    fn owner(&self) -> SingleValueMapper<ManagedAddress>;

    #[storage_mapper("isPaused")]
    fn is_paused(&self) -> SingleValueMapper<bool>;

    #[storage_mapper("totalProposals")]
    fn total_proposals(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("totalVotes")]
    fn total_votes(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("userProposalCount")]
    fn user_proposal_count(&self, user: &ManagedAddress) -> SingleValueMapper<usize>;

    #[storage_mapper("hasVoted")]
    fn has_voted(&self, proposal_id: u64, voter: &ManagedAddress) -> SingleValueMapper<bool>;

    #[storage_mapper("proposalTitle")]
    fn proposal_title(&self, proposal_id: u64) -> SingleValueMapper<ManagedBuffer>;

    #[storage_mapper("proposalDescription")]
    fn proposal_description(&self, proposal_id: u64) -> SingleValueMapper<ManagedBuffer>;

    #[storage_mapper("proposalCreator")]
    fn proposal_creator(&self, proposal_id: u64) -> SingleValueMapper<ManagedAddress>;

    #[storage_mapper("proposalDeadline")]
    fn proposal_deadline(&self, proposal_id: u64) -> SingleValueMapper<u64>;

    #[storage_mapper("proposalVoteCount")]
    fn proposal_vote_count(&self, proposal_id: u64) -> SingleValueMapper<u64>;

    #[storage_mapper("proposalActive")]
    fn proposal_active(&self, proposal_id: u64) -> SingleValueMapper<bool>;
}