// tests/mandos_test.rs

use multiversx_sc_scenario::*;
use std::panic;

// Importe o ContractBuilder gerado pelo macro do seu contrato.
// Certifique-se de que o nome "chainballotx" corresponda ao seu crate/namespace.
use chainballotx::ContractBuilder;

const MANDOS_PATH: &str = "mandos";

#[test]
fn test_mandos_scenarios() {
    let scenarios = [
        "create_proposal.scen.json",
        "vote_workflow.scen.json",
        "governance.scen.json",
        "edge_cases.scen.json",
    ];

    for scenario in scenarios.iter() {
        // 1) Cria um ScenarioWorld, registra o contrato WASM e ajusta o diretório de trabalho
        let world = world();
        let scenario_path = format!("{}/{}", MANDOS_PATH, scenario);
        println!("Executando cenário: {}", scenario_path);

        // 2) Captura panic para identificar qual cenário falhou
        let result = panic::catch_unwind(|| {
            world.run(&scenario_path);
        });

        match result {
            Ok(_) => println!("Cenário {} concluído com sucesso", scenario_path),
            Err(e) => panic!("Cenário {} falhou: {:?}", scenario_path, e),
        }
    }
}

// Função que retorna um ScenarioWorld configurado:
//  - seta o diretório base (workspace) para resolver "file:output/chainballotx.wasm"
//  - registra o executor do contrato WASM, atrelando-o ao ContractBuilder Rust
fn world() -> ScenarioWorld {
    let mut world = ScenarioWorld::new();
    world
        .set_current_dir_from_workspace("") // Garante que "file:output/..." seja resolvido a partir da raiz do crate
        .register_contract(
            "file:output/chainballotx.wasm", // caminho DOIS_NÍVEIS acima de mandos/, mas já estamos no crate root
            ContractBuilder                  // builder gerado pelo #[multiversx_sc::contract]
        );
    world
}