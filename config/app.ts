export const APP_CONFIG = {
  name: "ChainBallotX",
  description: "Sistema de votação descentralizado na MultiversX",
  version: "1.0.0",
  network: {
    chainId: "D",
    name: "MultiversX Devnet",
    apiUrl: "https://devnet-api.multiversx.com",
    explorerUrl: "https://devnet-explorer.multiversx.com",
  },
  contract: {
    address:
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "erd1qqqqqqqqqqqqqpgqehrq4xr838lrlv0h4ht20fnl9ywsw3v7sjus85qv7x",
  },
}
