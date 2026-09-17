# OMEN Contracts — Smart Contract Subsystem (Foundry & Multi-Chain)

Sub-repositori ini memuat seluruh implementasi *smart contract*, pengujian, dan skrip *deployment* on-chain untuk protokol OMEN V1 menggunakan toolkit **Foundry**.

---

## 1. Prasyarat & Instalasi

Pastikan toolchain **Foundry** terpasang di sistem:

```bash
# Instalasi Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Instalasi dependensi contracts:

```bash
# Di direktori omen/contracts
npm install
forge install foundry-rs/forge-std --no-commit
```

---

## 2. Struktur Direktori

```text
omen/contracts/
├── src/                     # Source code smart contract (OmenFactory.sol, OmenMarket.sol)
│   ├── interfaces/          # Interface kontrak (IOmenFactory.sol, IOmenMarket.sol)
│   └── types/               # Type definitions & structs (MarketTypes.sol)
├── test/                    # Foundry unit & invariant testing suite (*.t.sol)
├── script/                  # Foundry deployment scripts (*.s.sol)
├── foundry.toml             # Konfigurasi compiler, optimizer, & multi-chain RPC
├── remappings.txt           # Pemetaan dependensi OpenZeppelin & forge-std
└── .env.example             # Template variabel lingkungan RPC & Private Keys
```

---

## 3. Kompilasi & Pengujian

```bash
# Kompilasi smart contracts
forge build

# Menjalankan seluruh test suite dengan gas report
forge test --gas-report

# Menjalankan test spesifik dengan verbosity tinggi
forge test --match-test test_Sanity -vvvv
```

---

## 4. Deployment Multi-Chain

```bash
# Deploy ke Ethereum Sepolia
forge script script/DeploySepolia.s.sol --rpc-url sepolia --broadcast --verify

# Deploy ke Robinhood Chain Testnet (Chain ID 46630)
forge script script/DeployRobinhood.s.sol --rpc-url robinhood_testnet --broadcast
```
