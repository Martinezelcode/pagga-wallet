import { celoAlfajores, flowTestnet, gnosisChiado, hederaTestnet, lineaTestnet, morphSepolia, oasisTestnet, rootstockTestnet, sepolia, base } from "wagmi/chains";

// Contract addresses per chain
export const devContracts: Record<number, { claim: `0x${string}`}> = {
  [sepolia.id]: {
    claim: "0x6540c58a7236df1dc9ff563d4a75960f32926fe2",
  },
  [celoAlfajores.id]: {
    claim: "0xE47845dac04A7C91E73B8f09b441785810D40f69", // Replace with the actual Celo contract address
  },
  [gnosisChiado.id]: {
    claim: "0x7cFD096A93dD589fdB94F168158a6c631fFc22c8", // Replace with the actual Gnosis contract address
  },
  [hederaTestnet.id]: {
    claim: "0x7cfd096a93dd589fdb94f168158a6c631ffc22c8", // Replace with the actual Hedera contract address
  },
  [rootstockTestnet.id]: {
    claim: "0x7cfd096a93dd589fdb94f168158a6c631ffc22c8", // Replace with the actual Rootstock contract address
  },
  [lineaTestnet.id]: {
    claim: "0xLineaClaimAddress", // Replace with the actual Linea contract address
  },
  [flowTestnet.id]: {
    claim: "0x7cFD096A93dD589fdB94F168158a6c631fFc22c8", // Replace with the actual Flow testnet contract address
  },
  [oasisTestnet.id]: {
    claim: "0x7cFD096A93dD589fdB94F168158a6c631fFc22c8", // Replace with the actual Oasis testnet contract address
  },
  [morphSepolia.id]: {
    claim: "0x7cFD096A93dD589fdB94F168158a6c631fFc22c8", // Replace with the actual Morph Sepolia contract address
  },
  [base.id]: {
    claim: "0xa7bc316fa35c9eac97bd8f05fe6404ffda826308", // Replace with the actual Base contract address
  },
  [80084]: {
    claim: "0xaC0d56E871DbeecE3e576A4B64183eCd9a479195", // Replace with the actual Base contract address
  },
};

const prodContracts: Record<number, { claim: `0x${string}`}> = {
  [base.id]: {
    claim: "0xa7bc316fa35c9eac97bd8f05fe6404ffda826308", // Replace with the actual Base contract address
  },
  [80084]: {
    claim: "0xaC0d56E871DbeecE3e576A4B64183eCd9a479195", // Replace with the actual Base contract address
  },
  // Add other production chain contracts
}

export const contracts = import.meta.env.DEV ? devContracts : prodContracts