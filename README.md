# ENSBook (eb)

> **Your private, efficient, and intelligent ENS portfolio manager.**

<p align="center">
  <img src="./public/logo-glasses-with-title-870-500.png" alt="ENSBook Logo" width="300">
</p>

<p align="center">
  <a href="./README.md"><strong>English</strong></a> | <a href="./README.zh.md">简体中文</a>
</p>

<p align="center">
  <a href="https://reactjs.org/">
    <img src="https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react" alt="React">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript">
  </a>
  <a href="https://wagmi.sh/">
    <img src="https://img.shields.io/badge/Wagmi-v2-grey?style=flat-square" alt="Wagmi">
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/Vite-Fast-yellow?style=flat-square&logo=vite" alt="Vite">
  </a>
</p>

---

## 📖 Introduction

**ENSBook** is a decentralized ENS management terminal built on the **Local-First** philosophy.

Unlike traditional ENS tools that rely on heavy backend databases, ENSBook is built entirely on on-chain data (The Graph), decentralized APIs, and browser local storage. It solves the friction points of official apps in multi-domain management, bulk operations, and personalized notes, providing a lightning-fast, privacy-secure, and professional asset management experience.

## ✨ Key Features

### ⚡ **High-Performance Search**

- **Web Worker Engine**: Built-in multi-threaded parser handles text, addresses, and mixed formats in milliseconds. Whether pasting 10 or hundreds of domains, the interface remains fluid.
- **Smart Classification**: Automatically identifies and categorizes standard domains, Ethereum addresses, and specific holder queries (`@example.eth`).

### 🔍 **Intelligent Table Views**

- **Multi-Dimensional Filtering**: Drill down into your data by **Status** (Available, Grace, Premium), **Length**, **Wrapped State**, **Ownership**, or **Memo** presence.
- **Instant Sorting**: Sort thousands of names instantly by Expiry Date, Registration Date, Name, or Length to find what matters most.
- **Context Awareness**: View states (filters & sorting) are saved independently for each collection, remembering exactly how you left them.

### ☯️ **Dual-Mode Workflow**

ENSBook designs two complementary workspaces for different user needs:

- **Home (The Scratchpad)**: A free-form area for **temporary, high-frequency operations**. Paste text, filter, batch renew, and clear. Perfect for quick tasks and bulk processing.
- **Mine (The Portfolio)**: A persistent workspace defined by **rules** (e.g., "my wallet address", "specific keywords"). It automatically tracks your long-term assets and synchronizes view states.

### 🔒 **Data Sovereignty & Backup**

- **Zero Backend**: Your **Watchlist**, **Private Memos**, and **View Preferences** are stored entirely in your browser's `localStorage`. We do not collect any user data.
- **Full Portability**: Supports one-click export to standard JSON files with flexible **"Merge"** and **"Overwrite"** import strategies, ensuring your asset configuration is safe, portable, and never lost.

### 🚀 **Advanced Bulk Renewal**

Powered by the **`AdvancedBulkRenewal`** contract (deployed by ENSBook), we offer flexibility that traditional tools cannot match:

- **Align Expiry Dates**: With the **"Renew Until"** feature, you can align the expiration dates of multiple domains to a specific day in a single transaction.
- **Independent Durations**: Supports renewing different names for different durations in one go, optimizing your gas usage.
- **Trustless**: The contract is stateless and holds no funds, ensuring maximum security.

### 🛡️ **Robust Registration System**

- **State Recovery**: Uses a state machine to manage the ENS Commit-Reveal process. Even if you refresh the page or accidentally close the browser, registration progress is recovered locally via "breakpoints," preventing gas waste.
- **Anti-Front-Running**: Registration secrets are generated and stored locally, eliminating the risk of man-in-the-middle attacks.

### 💎 **Curated Collections**

- **Built-in Access**: Comes pre-loaded with iconic ENS communities like the **999 Club** and **BIP39 Club**.
- **Instant Insight**: Instantly monitor the registration status, expiration timeline, and ownership distribution of these foundational assets without manual configuration.

### 🌍 **Native Internationalization**

- **Dual Language Support**: Built-in support for **English** and **Simplified Chinese**, respecting user habits in the Web3 community.
- **Persistent Settings**: Language preferences are saved locally and automatically applied upon return.

## 🛠️ Tech Stack

- **Core**: React 18, TypeScript, Vite
- **Web3**: Wagmi v2, Viem, ConnectKit
- **Contract**: Solidity (AdvancedBulkRenewal)
- **Data**: The Graph (GraphQL)
- **State**: TanStack Query (React Query), Custom Local Store
- **i18n**: i18next, react-i18next
- **Styling**: Tailwind CSS, FontAwesome
