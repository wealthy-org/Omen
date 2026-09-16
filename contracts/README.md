# Omen Smart Contracts

Modul smart contract untuk platform Omen Web3 Prediction Market yang di-deploy pada jaringan Arbitrum Sepolia (Chain ID: 421614).

## Arsitektur Smart Contract

- **`contracts/PredictionMarket.sol`**: Kontrak utama pasar prediksi biner mewarisi `Ownable` dan `ReentrancyGuard` dari OpenZeppelin Contracts v5.
  - Siklus pasar: `Active`, `ResolvedYes`, `ResolvedNo`, `Cancelled`.
  - Pasang taruhan Native ETH dua arah (YES / NO).
  - Payout proporsional otomatis bagi pemenang berdasarkan pool share.
  - Mekanisme 100% refund bagi seluruh partisipan bila pasar dibatalkan oleh owner.

## Prasyarat & Instalasi

Pastikan Node.js versi 18+ terpasang di sistem.

```bash
cd omen/contracts
npm install
```

## Konfigurasi Variabel Lingkungan (.env)

Salin berkas konfigurasi template:

```bash
cp .env.example .env
```

Isi variabel lingkungan:

- `SEPOLIA_RPC_URL`: Endpoint RPC Arbitrum Sepolia (contoh: `https://sepolia-rollup.arbitrum.io/rpc`).
- `PRIVATE_KEY`: Private key dompet deployer yang memiliki saldo ETH Arbitrum Sepolia.

## Kompilasi & Pengujian

Kompilasi smart contract:

```bash
npx hardhat compile
```

Menjalankan seluruh 19 skenario unit test:

```bash
npx hardhat test
```

Pemeriksaan tipe TypeScript:

```bash
npx tsc --noEmit
```

## Deployment ke Arbitrum Sepolia

Eksekusi script deployment ke testnet:

```bash
npx hardhat run scripts/deploy.ts --network arbitrumSepolia
```

Script deployment akan secara otomatis:
1. Mendeploy smart contract `PredictionMarket.sol` menggunakan akun deployer.
2. Mengekspor ABI JSON ke `omen/web/contracts/PredictionMarket.json`.
3. Mengekspor konfigurasi typed ABI dan contract address ke `omen/web/lib/contracts.ts`.

## Verifikasi Kontrak di Arbiscan Sepolia

Setelah deployment selesai, verifikasi source code smart contract di Arbiscan Sepolia:

```bash
npx hardhat verify --network arbitrumSepolia <CONTRACT_ADDRESS> <DEPLOYER_ADDRESS>
```
