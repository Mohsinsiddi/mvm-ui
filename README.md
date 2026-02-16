# MVM Explorer

The frontend explorer and developer toolkit for the MVM (Mohsin Virtual Machine) blockchain. Includes a block explorer, Mosh IDE with Monaco editor, token creator, wallet lab, and more.

## Features

- **Block Explorer** — Browse blocks, transactions, accounts, contracts, and tokens in real-time
- **Mosh IDE** — Monaco-based code editor with full Mosh language support (syntax highlighting, autocomplete, snippets), compile and deploy contracts
- **Token Creator** — Deploy MVM-20 tokens with a form-based UI and live deployment console
- **Wallet** — Create, import, send/receive MVM, view balances, QR code receive, faucet
- **Wallet Lab** — Interactive 5-step walkthrough showing how wallets are created (private key -> public key -> SHA-256 -> RIPEMD-160 -> bech32)
- **Vanity Generator** — Generate custom `mvm1...` addresses with a chosen prefix
- **Leaderboard** — Top holders, token creators, contract deployers, and most active accounts
- **Dashboard** — Landing page with hero section, live stats, code preview, and feature cards
- **Real-time Updates** — WebSocket connection for live block and transaction feeds

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (backend must be running on port 8545)
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS (custom cyber/neon theme)
- **State:** Zustand (wallet), React Query (API cache)
- **Editor:** Monaco Editor (custom Mosh language)
- **Animations:** Framer Motion
- **Crypto:** @noble/secp256k1, @noble/hashes, bech32
- **UI:** Radix UI (dialog), Lucide icons, qrcode.react

## Project Structure

```
src/
  components/       # Reusable UI components
    animations/     # TxRain, BlockPulse
    common/         # Card, StatsCard, LoadingSpinner
    dashboard/      # LiveBlocks, LiveTxs
    ide/            # MoshEditor (Monaco)
    wallet/         # WalletModal
  hooks/            # useApi, useWebSocket
  lib/              # api client, moshCompiler, crypto, format, constants
  pages/            # All route pages
  store/            # Zustand wallet store
  types/            # TypeScript interfaces
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Landing page with stats, live data, features |
| `/explorer` | Explorer | Block and transaction browser |
| `/block/:height` | BlockDetail | Single block view |
| `/tx/:hash` | TxDetail | Single transaction view |
| `/address/:addr` | AddressDetail | Account details, balances, transactions |
| `/wallet` | Wallet | Send, receive, balances, settings |
| `/contracts` | Contracts | All deployed contracts |
| `/tokens` | Tokens | All MVM-20 tokens |
| `/tokens/create` | TokenCreator | Deploy new tokens |
| `/ide` | ContractIDE | Mosh code editor + deploy |
| `/learn/wallet` | WalletLab | Interactive key derivation |
| `/learn/vanity` | VanityGenerator | Custom address generation |
| `/leaderboard` | Leaderboard | Top accounts |
| `/terminal` | Terminal | CLI-style blockchain terminal |

## Mosh Compiler

The frontend includes a full Mosh-to-MVM compiler (`src/lib/moshCompiler.ts`) that:
- Lexes Mosh source code into tokens
- Parses tokens into a contract AST
- Generates MVM-compatible JSON operations
- Supports both new Mosh syntax and legacy Solidity-style syntax
- Includes 6 sample contracts (Counter, Token, Vault, Empty, Lottery, Calculator)

## Environment Variables

```env
VITE_API_URL=http://localhost:8545
VITE_WS_URL=ws://localhost:8545/ws
VITE_CHAIN_NAME=MVM Mainnet
VITE_CHAIN_ID=mvm-mainnet
```
