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

We have abandoned heavy centralized backend databases, building entirely on on-chain data (The Graph) and browser local storage. It solves the pain points of multi-domain management and personalized notes found in official apps, providing a lightning-fast, smooth, and privacy-secure asset management experience through a built-in multi-threaded parsing engine and smart caching strategies.

## ✨ Key Features

### ⚡ **High-Performance Search**

- **Web Worker Engine**: Built-in multi-threaded parser handles text, addresses, and mixed formats in milliseconds. Whether pasting 10 or 1000 domains, the interface remains fluid.
- **Smart Classification**: Automatically identifies and categorizes standard domains, Ethereum addresses, and specific holder queries (`@ensname`).

### 🛡️ **Robust Registration System**

- **State Recovery**: Uses a state machine to manage the ENS Commit-Reveal process. Even if you refresh the page or accidentally close the browser, registration progress is recovered locally, preventing gas waste.
- **Anti-Front-Running**: Registration secrets are generated and stored locally, eliminating the risk of man-in-the-middle attacks.

### 🔒 **Data Sovereignty & Privacy**

- **Zero Backend**: Your **Watchlist**, **Private Memos**, and **View Preferences** are stored entirely in your browser's `localStorage`. We do not collect any user data.
- **Full Backup**: Supports generating standard JSON backup files with "Merge" and "Overwrite" strategies, ensuring your asset configuration is never lost.

### 🏷️ **Smart Management**

- **Global Metadata**: Memos and importance levels are synchronized globally across Home, Collections, and Search views.
- **Context-Aware Views**: While data is global, view states (filters, sorting) are isolated per context (e.g., Home vs. 999 Club), remembering your preferences for each specific workflow.
- **Cross-Tab Sync**: Real-time data synchronization across multiple browser tabs.

### 🌍 **Native Internationalization**

- **Dual Language Support**: Built-in support for **English** and **Simplified Chinese**, respecting user habits in the Web3 community.
- **Persistent Settings**: Language preferences are saved locally and automatically applied upon return.

## 🛠️ Tech Stack

- **Core**: React 18, TypeScript, Vite
- **Web3**: Wagmi v2, Viem, ConnectKit
- **Data**: The Graph (GraphQL), Apollo Client
- **State**: TanStack Query (React Query), Custom Local Store
- **i18n**: i18next, react-i18next
- **Styling**: Tailwind CSS, FontAwesome
