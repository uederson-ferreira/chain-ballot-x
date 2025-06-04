import contractABI from "../contracts/chainballotx.abi.json"

export const getContractABI = () => contractABI

export const getEndpointByName = (name: string) => {
  return contractABI.endpoints.find((endpoint) => endpoint.name === name)
}

export const getEventByName = (name: string) => {
  return contractABI.events.find((event) => event.identifier === name)
}

// Função para validar se o contrato tem uma função específica
export const hasEndpoint = (name: string): boolean => {
  return contractABI.endpoints.some((endpoint) => endpoint.name === name)
}

// Listar todas as funções disponíveis
export const getAvailableEndpoints = () => {
  return contractABI.endpoints.map((endpoint) => ({
    name: endpoint.name,
    mutability: endpoint.mutability,
    inputs: endpoint.inputs.length,
    outputs: endpoint.outputs.length,
  }))
}

// Função para debug - mostrar informações do contrato
export const logContractInfo = () => {
  console.log("📋 Informações do Contrato ChainBallotX:")
  console.log("Nome:", contractABI.name)
  console.log("Endpoints disponíveis:", getAvailableEndpoints())
  console.log(
    "Eventos:",
    contractABI.events.map((e) => e.identifier),
  )
}
