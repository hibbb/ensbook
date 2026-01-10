# ENSBook (eb)

> **你的私有化、高效、智能的 ENS 资产管理专家。**

<p align="center">
  <img src="./public/logo-glasses-with-title-870-500.png" alt="ENSBook Logo" width="300">
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh.md"><strong>简体中文</strong></a>
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

## 📖 简介

**ENSBook** 是一款坚持 **Local-First（本地优先）** 哲学的 ENS 域名管理终端。

我们摒弃了繁重的中心化后端数据库，完全基于链上数据（The Graph）和浏览器本地存储构建。它不仅解决了官方 App 在多域名管理和个性化备注上的痛点，更通过内置的多线程解析引擎和智能缓存策略，为你提供极速、流畅且隐私安全的资产管理体验。

## ✨ 核心特性

### ⚡ **极速批量检索**

- **Web Worker 引擎**：内置多线程解析器，支持文本、地址、混合格式的毫秒级处理。无论是粘贴 10 个还是 1000 个域名，界面始终流畅不卡顿。
- **智能分类**：自动识别并分类处理普通域名、以太坊地址及特定持仓查询（`@ensname`）。

### 🛡️ **健壮的注册系统**

- **状态自动恢复**：采用状态机管理 ENS 的 Commit-Reveal 两步注册流程。即使你刷新页面或意外关闭浏览器，也能从本地精准恢复注册进度，防止 Gas 浪费。
- **安全防抢跑**：注册所需的随机 Secret 仅在本地生成并存储，杜绝中间人攻击。

### 🔒 **数据主权与隐私**

- **零后端依赖**：您的**关注列表**、**私有备注 (Memos)** 及**视图偏好**完全存储在浏览器本地 (`localStorage`)。我们不收集任何用户数据。
- **完整备份方案**：支持生成标准 JSON 备份文件，提供“合并”与“覆盖”两种恢复策略，确保您的资产配置永不丢失。

### 🏷️ **智能视图与管理**

- **全局元数据**：备注和重要性等级在首页、集合页和搜索页之间全局同步，确保数据一致性。
- **视图状态持久化**：自动记忆您在不同页面下的筛选（状态、长度、Wrap状态）与排序偏好，打造最顺手的工作台。
- **跨标签页同步**：支持多窗口操作，数据实时同步更新。

### 🌍 **原生国际化支持**

- **双语系统**：内置 **English** 和 **简体中文** 支持，深度适配 Web3 社区语言习惯。
- **持久化设置**：语言偏好自动保存，并在下次访问时自动加载。

## 🛠️ 技术栈

- **核心**: React 18, TypeScript, Vite
- **Web3**: Wagmi v2, Viem, ConnectKit
- **数据**: The Graph (GraphQL), Apollo Client
- **状态**: TanStack Query (React Query), Custom Local Store
- **国际化**: i18next, react-i18next
- **样式**: Tailwind CSS, FontAwesome
