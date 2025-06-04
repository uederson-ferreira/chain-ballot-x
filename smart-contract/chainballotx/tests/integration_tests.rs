use multiversx_sc::types::ManagedBuffer;
use multiversx_sc_scenario::*;
use multiversx_sc_scenario::scenario_model::*;
use multiversx_sc_scenario::imports::{
    SetStateStep,             // Para definir o estado inicial do mundo
    FilePath,                 // Para especificar o caminho do arquivo WASM
    ExpectValue,              // Para verificar valores esperados
    ExpectMessage,            // Para verificar mensagens de erro
    TestAddress,              // Para criar endereços de teste
    TestSCAddress,            // Para criar endereços de smart contract de teste
};
use chainballotx::*;
use chainballotx_proxy::ChainBallotXProxy;

mod chainballotx_tests {
    use super::*;

    const WASM_PATH: &str = "output/chainballotx.wasm";
    
    // Endereços de teste constantes
    const OWNER_ADDRESS: TestAddress = TestAddress::new("owner");
    const USER_ADDRESS: TestAddress = TestAddress::new("user");
    const VOTER_ADDRESS: TestAddress = TestAddress::new("voter");
    const VOTER1_ADDRESS: TestAddress = TestAddress::new("voter1");
    const VOTER2_ADDRESS: TestAddress = TestAddress::new("voter2");
    const NEW_OWNER_ADDRESS: TestAddress = TestAddress::new("new_owner");
    const OTHER_USER_ADDRESS: TestAddress = TestAddress::new("other_user");
    const CONTRACT_ADDRESS: TestSCAddress = TestSCAddress::new("contract");

    #[test]
    fn test_init() {
        let mut world = world();

        world.set_state_step(
            SetStateStep::new()
                .put_account(OWNER_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                .new_address(OWNER_ADDRESS, 1, CONTRACT_ADDRESS),
        );

        world
            .tx()
            .from(OWNER_ADDRESS)
            .typed(ChainBallotXProxy)
            .init()
            .code(FilePath(WASM_PATH))
            .run();
    }

    #[test]
    fn test_create_proposal_success() {
        let mut world = world();

        world
            .set_state_step(
                SetStateStep::new()
                    .put_account(OWNER_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                    .new_address(OWNER_ADDRESS, 1, CONTRACT_ADDRESS)
            );

        world
            .tx()
            .from(OWNER_ADDRESS)
            .typed(ChainBallotXProxy)
            .init()
            .code(FilePath(WASM_PATH))
            .run();

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .create_proposal(
                ManagedBuffer::new_from_bytes(b"Proposta de Teste"),
                ManagedBuffer::new_from_bytes(b"Esta e uma descricao de teste"),
                86400u64,
            )
            .run();

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .get_total_proposals()
            .returns(ExpectValue(1u64))
            .run();

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .get_proposal_title(0u64)
            .returns(ExpectValue(ManagedBuffer::new_from_bytes(b"Proposta de Teste")))
            .run();
    }

    #[test]
    fn test_create_proposal_validations() {
        let mut world = world();

        world
            .set_state_step(
                SetStateStep::new()
                    .put_account(OWNER_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                    .put_account(USER_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                    .new_address(OWNER_ADDRESS, 1, CONTRACT_ADDRESS)
            );

        world
            .tx()
            .from(OWNER_ADDRESS)
            .typed(ChainBallotXProxy)
            .init()
            .code(FilePath(WASM_PATH))
            .run();

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .create_proposal(
                ManagedBuffer::new_from_bytes(b""),
                ManagedBuffer::new_from_bytes(b"Descricao valida"),
                86400u64,
            )
            .with_result(ExpectMessage("Title cannot be empty"))
            .run();

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .create_proposal(
                ManagedBuffer::new_from_bytes(b"Titulo valido"),
                ManagedBuffer::new_from_bytes(b""),
                86400u64,
            )
            .with_result(ExpectMessage("Description cannot be empty"))
            .run();

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .create_proposal(
                ManagedBuffer::new_from_bytes(b"Titulo"),
                ManagedBuffer::new_from_bytes(b"Descricao"),
                1800u64,
            )
            .with_result(ExpectMessage("Duration too short"))
            .run();
    }

    #[test]
    fn test_voting_workflow() {
        let mut world = world();

        world
            .set_state_step(
                SetStateStep::new()
                    .put_account(OWNER_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                    .put_account(VOTER1_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                    .put_account(VOTER2_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                    .new_address(OWNER_ADDRESS, 1, CONTRACT_ADDRESS)
            );

        world
            .tx()
            .from(OWNER_ADDRESS)
            .typed(ChainBallotXProxy)
            .init()
            .code(FilePath(WASM_PATH))
            .run();

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .create_proposal(
                ManagedBuffer::new_from_bytes(b"Proposta de Votacao"),
                ManagedBuffer::new_from_bytes(b"Teste de sistema de votacao"),
                86400u64,
            )
            .run();

        world
            .tx()
            .from(VOTER1_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .vote(0u64)
            .run();

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .get_proposal_vote_count(0u64)
            .returns(ExpectValue(1u64))
            .run();

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .get_total_votes()
            .returns(ExpectValue(1u64))
            .run();

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .has_user_voted_on_proposal(0u64, VOTER1_ADDRESS.to_address())
            .returns(ExpectValue(true))
            .run();

        world
            .tx()
            .from(VOTER2_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .vote(0u64)
            .run();

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .get_proposal_vote_count(0u64)
            .returns(ExpectValue(2u64))
            .run();

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .get_total_votes()
            .returns(ExpectValue(2u64))
            .run();
    }

    #[test]
    fn test_voting_validations() {
        let mut world = world();

        world
            .set_state_step(
                SetStateStep::new()
                    .put_account(OWNER_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                    .put_account(VOTER_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                    .new_address(OWNER_ADDRESS, 1, CONTRACT_ADDRESS)
            );

        world
            .tx()
            .from(OWNER_ADDRESS)
            .typed(ChainBallotXProxy)
            .init()
            .code(FilePath(WASM_PATH))
            .run();

        // Teste 1: Votar em proposta que não existe
        world
            .tx()
            .from(VOTER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .vote(999u64)
            .with_result(ExpectMessage("Proposal does not exist"))
            .run();

        // Criar uma proposta para os próximos testes
        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .create_proposal(
                ManagedBuffer::new_from_bytes(b"Proposta"),
                ManagedBuffer::new_from_bytes(b"Descricao"),
                86400u64,
            )
            .run();

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .get_total_proposals()
            .returns(ExpectValue(1u64))
            .run();

        // Teste 2: Primeiro voto (deve funcionar)
        world
            .tx()
            .from(VOTER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .vote(0u64)
            .run();

        // Teste 3: Tentar votar novamente (deve falhar)
        world
            .tx()
            .from(VOTER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .vote(0u64)
            .with_result(ExpectMessage("Already voted on this proposal"))
            .run();

        // Teste 4: Cancelar proposta (só para testar se fica inativa)
        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .cancel_proposal(0u64)
            .run();

        // Verificar se a proposta está inativa
        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .is_proposal_active(0u64)
            .returns(ExpectValue(false))
            .run();

        // Teste 5: Criar proposta com tempo curto e testar expiração
        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .create_proposal(
                ManagedBuffer::new_from_bytes(b"Proposta Expirada"),
                ManagedBuffer::new_from_bytes(b"Teste de expiracao"),
                3600u64,
            )
            .run();

        // Avançar tempo para expirar a proposta
        world
            .set_state_step(
                SetStateStep::new()
                    .block_timestamp(7200u64)
            );

        // Teste 6: Tentar votar em proposta expirada
        world
            .tx()
            .from(VOTER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .vote(1u64)
            .with_result(ExpectMessage("Voting period ended"))
            .run();
    }

    #[test]
    fn test_proposal_management() {
        let mut world = world();

        world
            .set_state_step(
                SetStateStep::new()
                    .put_account(OWNER_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                    .put_account(USER_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                    .new_address(OWNER_ADDRESS, 1, CONTRACT_ADDRESS)
            );

        world
            .tx()
            .from(OWNER_ADDRESS)
            .typed(ChainBallotXProxy)
            .init()
            .code(FilePath(WASM_PATH))
            .run();

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .create_proposal(
                ManagedBuffer::new_from_bytes(b"Proposta Cancelavel"),
                ManagedBuffer::new_from_bytes(b"Sera cancelada pelo criador"),
                86400u64,
            )
            .run();

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .cancel_proposal(0u64)
            .run();

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .is_proposal_active(0u64)
            .returns(ExpectValue(false))
            .run();

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .create_proposal(
                ManagedBuffer::new_from_bytes(b"Nova Proposta"),
                ManagedBuffer::new_from_bytes(b"Para teste de autorizacao"),
                86400u64,
            )
            .run();

        world
            .tx()
            .from(USER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .cancel_proposal(1u64)
            .with_result(ExpectMessage("Only creator or owner can cancel proposal"))
            .run();
    }

    #[test]
    fn test_contract_governance() {
        let mut world = world();

        world
            .set_state_step(
                SetStateStep::new()
                    .put_account(OWNER_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                    .put_account(NEW_OWNER_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                    .put_account(USER_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                    .new_address(OWNER_ADDRESS, 1, CONTRACT_ADDRESS)
            );

        world
            .tx()
            .from(OWNER_ADDRESS)
            .typed(ChainBallotXProxy)
            .init()
            .code(FilePath(WASM_PATH))
            .run();

        world
            .tx()
            .from(USER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .pause()
            .with_result(ExpectMessage("Only owner can call this function"))
            .run();

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .pause()
            .run();

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .is_contract_paused()
            .returns(ExpectValue(true))
            .run();

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .create_proposal(
                ManagedBuffer::new_from_bytes(b"Teste"),
                ManagedBuffer::new_from_bytes(b"Nao deve funcionar"),
                86400u64,
            )
            .with_result(ExpectMessage("Contract is paused"))
            .run();

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .unpause()
            .run();

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .transfer_ownership(NEW_OWNER_ADDRESS.to_address())
            .run();

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .get_owner()
            .returns(ExpectValue(NEW_OWNER_ADDRESS.to_address()))
            .run();

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .pause()
            .with_result(ExpectMessage("Only owner can call this function"))
            .run();

        world
            .tx()
            .from(NEW_OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .pause()
            .run();
    }

    #[test]
    fn test_user_limits() {
        let mut world = world();

        world
            .set_state_step(
                SetStateStep::new()
                    .put_account(OWNER_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                    .put_account(OTHER_USER_ADDRESS, Account::new().nonce(1).balance("1000000000000000000"))
                    .new_address(OWNER_ADDRESS, 1, CONTRACT_ADDRESS)
            );

        world
            .tx()
            .from(OWNER_ADDRESS)
            .typed(ChainBallotXProxy)
            .init()
            .code(FilePath(WASM_PATH))
            .run();

        for i in 0..10 {
            let title = format!("Proposta {}", i);
            let description = format!("Descricao da proposta {}", i);

            world
                .tx()
                .from(OWNER_ADDRESS)
                .to(CONTRACT_ADDRESS)
                .typed(ChainBallotXProxy)
                .create_proposal(
                    ManagedBuffer::new_from_bytes(title.as_bytes()),
                    ManagedBuffer::new_from_bytes(description.as_bytes()),
                    86400u64,
                )
                .run();
        }

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .get_total_proposals()
            .returns(ExpectValue(10u64))
            .run();

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .create_proposal(
                ManagedBuffer::new_from_bytes(b"Proposta 11"),
                ManagedBuffer::new_from_bytes(b"Esta deve falhar"),
                86400u64,
            )
            .with_result(ExpectMessage("Maximum proposals per user exceeded"))
            .run();

        for i in 0..10 {
            let title = format!("Proposta Other {}", i);
            let description = format!("Descricao da proposta other {}", i);

            world
                .tx()
                .from(OTHER_USER_ADDRESS)
                .to(CONTRACT_ADDRESS)
                .typed(ChainBallotXProxy)
                .create_proposal(
                    ManagedBuffer::new_from_bytes(title.as_bytes()),
                    ManagedBuffer::new_from_bytes(description.as_bytes()),
                    86400u64,
                )
                .run();
        }

        world
            .tx()
            .from(OTHER_USER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .create_proposal(
                ManagedBuffer::new_from_bytes(b"Proposta 11 Other"),
                ManagedBuffer::new_from_bytes(b"Esta deve falhar"),
                86400u64,
            )
            .with_result(ExpectMessage("Maximum proposals per user exceeded"))
            .run();
    }

    fn world() -> ScenarioWorld {
        let mut world = ScenarioWorld::new();
        world.register_contract("file:output/chainballotx.wasm", chainballotx::ContractBuilder);
        world
    }
}