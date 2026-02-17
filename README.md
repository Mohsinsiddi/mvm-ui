# MVM Explorer

The frontend explorer and developer toolkit for the [MVM (Mohsin Virtual Machine)](https://github.com/Mohsinsiddi/mohsin-blockchain) blockchain.

**Live API:** [mvm-chain.duckdns.org](https://mvm-chain.duckdns.org)
**Backend Source:** [github.com/Mohsinsiddi/mohsin-blockchain](https://github.com/Mohsinsiddi/mohsin-blockchain)

## Features

- **Block Explorer** — Browse blocks, transactions, accounts, contracts, and tokens in real-time
- **Mosh IDE** — Monaco-based code editor with full Mosh language support (syntax highlighting, autocomplete, snippets), compile and deploy contracts
- **Token Creator** — Deploy MVM-20 tokens with a form-based UI and live deployment console
- **Wallet** — Create, import, send/receive MVM, view balances, QR code receive, faucet
- **Wallet Lab** — Interactive 5-step walkthrough: Private Key → Public Key → SHA-256 → RIPEMD-160 → bech32
- **Vanity Generator** — Generate custom `mvm1...` addresses with a chosen prefix
- **Terminal** — CLI-style blockchain terminal for querying data
- **Leaderboard** — Top holders, token creators, contract deployers, most active accounts
- **API Docs** — Interactive Swagger-style API reference with "Try it" buttons
- **Documentation** — Feature guide, Mosh language reference, and architecture overview
- **Real-time Updates** — WebSocket connection for live block and transaction feeds
- **Responsive** — Fully responsive across desktop, tablet, and mobile (iPhone 14 tested)

## Quick Start

```bash
# Clone
git clone https://github.com/Mohsinsiddi/mvm-ui.git
cd mvm-ui

# Install dependencies
npm install

# Start dev server (backend must be running on port 8545)
npm run dev

# Build for production
npm run build
```

### Environment Variables

```env
VITE_API_URL=http://localhost:8545        # Backend API URL
VITE_WS_URL=ws://localhost:8545/ws        # WebSocket URL
VITE_CHAIN_NAME=MVM Mainnet              # Display name
VITE_CHAIN_ID=mvm-mainnet                # Chain identifier
```

### Running with Production API

To use the live backend without running a local node:

```env
VITE_API_URL=https://mvm-chain.duckdns.org
VITE_WS_URL=wss://mvm-chain.duckdns.org/ws
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Landing page with live stats, blocks, transactions, feature cards |
| `/explorer` | Explorer | Tabbed browser for blocks, transactions, tokens, contracts |
| `/block/:height` | Block Detail | Single block with metadata and transactions |
| `/tx/:hash` | TX Detail | Transaction details with status, gas, sender/receiver |
| `/address/:addr` | Address Detail | Account balance, nonce, transaction history, token holdings |
| `/wallet` | Wallet | Send, receive, balances, QR code, faucet |
| `/contracts` | Contract IDE | Mosh code editor, compile, deploy, interact with contracts |
| `/tokens/create` | Token Creator | Deploy MVM-20 tokens with form UI |
| `/terminal` | Terminal | CLI-style blockchain interface |
| `/node` | Node Info | Connection status, network topology, peers |
| `/leaderboard` | Leaderboard | Rankings across 4 categories |
| `/learn/wallet` | Wallet Lab | Interactive key derivation walkthrough |
| `/learn/vanity` | Vanity Generator | Custom address prefix generation |
| `/docs` | Documentation | Feature guide, Mosh language, architecture |
| `/docs/api` | API Reference | Interactive Swagger-style API docs |

## Project Structure

```
src/
  components/
    animations/     # TxRain, BlockPulse
    common/         # Card, Modal, StatsCard, LoadingSpinner, CopyButton
    dashboard/      # LiveBlocks, LiveTxs
    explorer/       # SearchBar, BlockCard, TxCard
    ide/            # MoshEditor (Monaco)
    layout/         # Header, Footer, Layout, Logo, NetworkStatus
    wallet/         # WalletModal
  hooks/            # useApi (React Query), useWebSocket
  lib/
    api.ts          # API client with signing support
    moshCompiler.ts # Full Mosh-to-MVM compiler (lexer, parser, codegen)
    crypto.ts       # Ed25519, SHA-256, RIPEMD-160, bech32
    format.ts       # Address, balance, time formatting
    constants.ts    # URLs, chain config, tx types
  pages/            # All route pages (15 pages)
  store/            # Zustand wallet store (persistent)
  types/            # TypeScript interfaces
```

## Mosh Compiler

The frontend includes a full Mosh-to-MVM compiler (`src/lib/moshCompiler.ts`) that:

1. **Lexes** Mosh source code into tokens
2. **Parses** tokens into a contract AST
3. **Generates** MVM-compatible JSON operations
4. Supports both Mosh syntax (`forge`, `fn`, `guard`, `signal`) and legacy Solidity-style syntax
5. Includes 6 sample contracts: Counter, Token, Vault, Empty, Lottery, Calculator

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS (custom cyber/neon theme) |
| State | Zustand (wallet), React Query (API cache) |
| Editor | Monaco Editor (custom Mosh language) |
| Animations | Framer Motion |
| UI Components | Radix UI (dialog, tabs, toast, tooltip) |
| Icons | Lucide React |
| Crypto | @noble/secp256k1, @noble/hashes, bech32 |
| QR | qrcode.react |
| Testing | Playwright (E2E) |

## Scripts

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Type check + production build
npm run preview      # Preview production build
npm run test         # Run Playwright E2E tests
npm run test:ui      # Playwright with UI
npm run test:headed  # Playwright headed mode
```

## Related

- **Backend:** [github.com/Mohsinsiddi/mohsin-blockchain](https://github.com/Mohsinsiddi/mohsin-blockchain) — Rust blockchain with Mosh VM, MVM-20 tokens, REST + WebSocket API
- **Live API:** [mvm-chain.duckdns.org](https://mvm-chain.duckdns.org) — Production API endpoint
