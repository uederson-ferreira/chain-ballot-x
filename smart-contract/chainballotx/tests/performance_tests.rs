use multiversx_sc::types::ManagedBuffer;
use multiversx_sc_scenario::*;
use multiversx_sc_scenario::scenario_model::*;
use multiversx_sc_scenario::imports::{
    SetStateStep,
    FilePath,
    ExpectMessage,
    ExpectValue,
    TestAddress,
    TestSCAddress,
};
use std::time::Instant;
use chainballotx::*;
use chainballotx_proxy::ChainBallotXProxy;

const WASM_PATH: &str = "output/chainballotx.wasm";
const MAX_PROPOSALS_PER_USER: usize = 10;
//const TOKEN_ID: &str = "TEST-123456"; // Replace with your actual ESDT token identifier

mod chainballotx_performance_tests {
    use super::*;

    // Endereços de teste constantes
    const OWNER_ADDRESS: TestAddress = TestAddress::new("owner");
    const CONTRACT_ADDRESS: TestSCAddress = TestSCAddress::new("contract");
    
    // Arrays de endereços para diferentes testes
    const VOTER_0: TestAddress = TestAddress::new("voter0");
    const VOTER_1: TestAddress = TestAddress::new("voter1");
    const VOTER_2: TestAddress = TestAddress::new("voter2");
    const VOTER_3: TestAddress = TestAddress::new("voter3");
    const VOTER_4: TestAddress = TestAddress::new("voter4");
    const VOTER_5: TestAddress = TestAddress::new("voter5");
    const VOTER_6: TestAddress = TestAddress::new("voter6");
    const VOTER_7: TestAddress = TestAddress::new("voter7");
    const VOTER_8: TestAddress = TestAddress::new("voter8");
    const VOTER_9: TestAddress = TestAddress::new("voter9");
    const VOTER_10: TestAddress = TestAddress::new("voter10");
    const VOTER_11: TestAddress = TestAddress::new("voter11");
    const VOTER_12: TestAddress = TestAddress::new("voter12");
    const VOTER_13: TestAddress = TestAddress::new("voter13");
    const VOTER_14: TestAddress = TestAddress::new("voter14");
    const VOTER_15: TestAddress = TestAddress::new("voter15");
    const VOTER_16: TestAddress = TestAddress::new("voter16");
    const VOTER_17: TestAddress = TestAddress::new("voter17");
    const VOTER_18: TestAddress = TestAddress::new("voter18");
    const VOTER_19: TestAddress = TestAddress::new("voter19");

    #[test]
    fn test_large_scale_voting() {
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
                ManagedBuffer::new_from_bytes(b"Proposta de Stress Test"),
                ManagedBuffer::new_from_bytes(b"Teste com muitos votantes"),
                86400u64,
            )
            .run();

        let start_time = Instant::now();
        let mut vote_times = Vec::new();

        let voters = [
            VOTER_0, VOTER_1, VOTER_2, VOTER_3, VOTER_4,
            VOTER_5, VOTER_6, VOTER_7, VOTER_8, VOTER_9,
            VOTER_10, VOTER_11, VOTER_12, VOTER_13, VOTER_14,
            VOTER_15, VOTER_16, VOTER_17, VOTER_18, VOTER_19,
        ];

        for (i, voter_address) in voters.iter().enumerate() {
            world
                .set_state_step(
                    SetStateStep::new()
                        .put_account(*voter_address, Account::new().nonce(1).balance("1000000000000000000"))
                );

            let vote_start = Instant::now();
            world
                .tx()
                .from(*voter_address)
                .to(CONTRACT_ADDRESS)
                .typed(ChainBallotXProxy)
                .vote(0u64)
                .run();
            vote_times.push(vote_start.elapsed().as_millis());

            if i % 5 == 0 {
                println!("Votos processados: {}/20", i + 1);
            }
        }

        let duration = start_time.elapsed();
        let avg_time_per_vote = duration.as_millis() as f64 / 20.0;
        let max_vote_time = vote_times.iter().max().unwrap_or(&0);
        let min_vote_time = vote_times.iter().min().unwrap_or(&0);
        
        println!("Estatísticas de tempo de voto:");
        println!("Tempo médio por voto: {:.2}ms", avg_time_per_vote);
        println!("Tempo máximo de voto: {}ms", max_vote_time);
        println!("Tempo mínimo de voto: {}ms", min_vote_time);
        
        assert!(
            avg_time_per_vote < 5.0,
            "Tempo médio por voto ({:.2}ms) excede o limite de 5ms",
            avg_time_per_vote
        );
        assert!(
            *max_vote_time < 10,
            "Tempo máximo de voto ({}ms) excede o limite de 10ms",
            max_vote_time
        );

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .get_proposal_vote_count(0u64)
            .returns(ExpectValue(20u64))
            .run();

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .get_total_votes()
            .returns(ExpectValue(20u64))
            .run();
    }

    #[test]
    fn test_max_proposals_performance() {
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

        let start_time = Instant::now();

        for i in 0..MAX_PROPOSALS_PER_USER {
            let title = format!("Proposta {}", i);
            let description = format!("Descricao detalhada da proposta numero {}", i);

            println!("Creating proposal {} for user {:?}", i, OWNER_ADDRESS); // Usar {:?} para TestAddress
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
                .gas(50_000_000)
                .run();
        }

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .create_proposal(
                ManagedBuffer::new_from_bytes(b"Proposta Extra"),
                ManagedBuffer::new_from_bytes(b"Esta deve falhar"),
                86400u64,
            )
            .gas(50_000_000)
            .with_result(ExpectMessage("Maximum proposals per user exceeded"))
            .run();

        let creation_duration = start_time.elapsed();
        println!("Tempo para criar {} propostas: {:?}", MAX_PROPOSALS_PER_USER, creation_duration);

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .get_total_proposals()
            .returns(ExpectValue(10u64))
            .run();
    }

    #[test]
    fn test_concurrent_voting_simulation() {
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

        // Criar múltiplas propostas para teste de concorrência
        for i in 0..5 {
            let title = format!("Proposta Concorrente {}", i);
            let description = format!("Proposta {} para teste de concorrencia", i);

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

        let start_time = Instant::now();
        let mut vote_times = Vec::new();
        let mut proposal_votes = vec![0u64; 5];

        let voters = [
            VOTER_0, VOTER_1, VOTER_2, VOTER_3, VOTER_4,
            VOTER_5, VOTER_6, VOTER_7, VOTER_8, VOTER_9,
            VOTER_10, VOTER_11, VOTER_12, VOTER_13, VOTER_14,
            VOTER_15, VOTER_16, VOTER_17, VOTER_18, VOTER_19,
        ];

        // Simular votos concorrentes (usando apenas 20 voters para simplificar)
        for (i, voter_address) in voters.iter().enumerate() {
            let proposal_id = i % 5;

            world
                .set_state_step(
                    SetStateStep::new()
                        .put_account(*voter_address, Account::new().nonce(1).balance("1000000000000000000"))
                );

            let vote_start = Instant::now();
            world
                .tx()
                .from(*voter_address)
                .to(CONTRACT_ADDRESS)
                .typed(ChainBallotXProxy)
                .vote(proposal_id as u64)
                .run();
            vote_times.push(vote_start.elapsed().as_millis());
            proposal_votes[proposal_id] += 1;

            if i % 5 == 0 {
                println!("Votos processados: {}/20", i + 1);
            }
        }

        let duration = start_time.elapsed();
        let avg_time_per_vote = duration.as_millis() as f64 / 20.0;
        let max_vote_time = vote_times.iter().max().unwrap_or(&0);
        
        println!("Estatísticas de votos concorrentes:");
        println!("Tempo médio por voto: {:.2}ms", avg_time_per_vote);
        println!("Tempo máximo de voto: {}ms", max_vote_time);
        println!("Distribuição de votos por proposta:");
        for (i, votes) in proposal_votes.iter().enumerate() {
            println!("Proposta {}: {} votos", i, votes);
        }

        assert!(
            avg_time_per_vote < 5.0,
            "Tempo médio por voto ({:.2}ms) excede o limite de 5ms",
            avg_time_per_vote
        );
        assert!(
            *max_vote_time < 10,
            "Tempo máximo de voto ({}ms) excede o limite de 10ms",
            max_vote_time
        );

        // Verificar contagens de votos
        for i in 0..5 {
            world
                .query()
                .to(CONTRACT_ADDRESS)
                .typed(ChainBallotXProxy)
                .get_proposal_vote_count(i as u64)
                .returns(ExpectValue(proposal_votes[i as usize]))
                .run();
        }

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .get_total_votes()
            .returns(ExpectValue(20u64))
            .run();
    }

    #[test]
    fn test_memory_efficiency() {
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

        let large_description = "A".repeat(400);

        world
            .tx()
            .from(OWNER_ADDRESS)
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .create_proposal(
                ManagedBuffer::new_from_bytes(b"Proposta com Descricao Grande"),
                ManagedBuffer::new_from_bytes(large_description.as_bytes()),
                86400u64,
            )
            .run();

        // Usar apenas 20 voters para simplificar
        let voters = [
            VOTER_0, VOTER_1, VOTER_2, VOTER_3, VOTER_4,
            VOTER_5, VOTER_6, VOTER_7, VOTER_8, VOTER_9,
            VOTER_10, VOTER_11, VOTER_12, VOTER_13, VOTER_14,
            VOTER_15, VOTER_16, VOTER_17, VOTER_18, VOTER_19,
        ];

        for voter_address in voters.iter() {
            world
                .set_state_step(
                    SetStateStep::new()
                        .put_account(*voter_address, Account::new().nonce(1).balance("1000000000000000000"))
                );

            world
                .tx()
                .from(*voter_address)
                .to(CONTRACT_ADDRESS)
                .typed(ChainBallotXProxy)
                .vote(0u64)
                .run();
        }

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .get_proposal_vote_count(0u64)
            .returns(ExpectValue(20u64))
            .run();

        world
            .query()
            .to(CONTRACT_ADDRESS)
            .typed(ChainBallotXProxy)
            .get_total_votes()
            .returns(ExpectValue(20u64))
            .run();
    }

    fn world() -> ScenarioWorld {
        let mut world = ScenarioWorld::new();
        world.register_contract("file:output/chainballotx.wasm", chainballotx::ContractBuilder);
        world
    }
}