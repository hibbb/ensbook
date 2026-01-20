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

与依赖繁重中心化数据库的传统工具不同，ENSBook 完全基于链上数据（The Graph）、去中心化协议和浏览器本地存储构建。它不仅解决了官方 App 在多域名管理、批量操作和个性化备注上的痛点，更通过自研合约和智能缓存策略，为你提供极速、流畅且隐私安全的专业级资产管理体验。

## ✨ 核心特性

### ⚡ **极速批量检索**

- **Web Worker 引擎**：内置多线程解析器，支持文本、地址、混合格式的毫秒级处理。无论是粘贴 10 个还是数百个域名，界面始终流畅不卡顿。
- **智能分类**：自动识别并分类处理普通域名、以太坊地址及特定持仓查询（`@example.eth`）。

### 🔍 **智能表格视图**

- **多维筛选**：支持按 **状态**（可用、宽限期、溢价等）、**长度**、**包装状态**、**所有者** 以及 **备注** 进行组合筛选，精准定位目标资产。
- **即时排序**：支持按过期时间、注册时间、名称或长度对数千条数据进行毫秒级排序。
- **上下文记忆**：每个集合的视图状态（筛选/排序）独立保存，自动还原您上次的工作环境。

### ☯️ **双模工作流**

ENSBook 为不同的使用场景设计了互补的工作台：

- **首页 (草稿纸)**：自由的**临时高频操作区**。支持粘贴文本、筛选、批量续费及一键清空。专为快速处理杂乱数据而设计。
- **我的 (资产库)**：基于**规则**（如“我的钱包地址”、“特定关键词”）定义的持久化工作台。它会自动追踪你的长期资产，并记住你的视图偏好。

### 🔒 **数据主权与备份**

- **零后端依赖**：您的**关注列表**、**私有备注 (Memos)** 及**视图偏好**完全存储在浏览器本地 (`localStorage`)。我们不收集任何用户数据。
- **完整备份方案**：支持一键导出标准 JSON 备份文件，并提供 **“合并 (Merge)”** 与 **“覆盖 (Overwrite)”** 两种恢复策略，轻松实现跨设备迁移与数据回滚。

### 🚀 **高级批量续费 (Advanced Bulk Renewal)**

由 ENSBook 部署的 **`AdvancedBulkRenewal`** 合约驱动，提供传统工具无法比拟的灵活性：

- **对齐过期时间**：通过 **“续费至 (Renew Until)”** 功能，你可以在单笔交易中将多个域名的过期时间精准对齐到同一天，方便统一管理。
- **独立时长**：支持在一次操作中为不同域名设定不同的续费时长，最大化利用 Gas。
- **免信任安全**：合约无状态且不持有资金，采用余额透传机制，确保资产绝对安全。

### 🛡️ **健壮的注册系统**

- **断点续传**：采用状态机管理 ENS 的 Commit-Reveal 两步注册流程。即使刷新页面或意外关闭浏览器，也能通过本地“断点”精准恢复注册进度，防止 Gas 浪费。
- **安全防抢跑**：注册所需的随机 Secret 仅在本地生成并存储，杜绝中间人攻击。

### 💎 **精选集合 (Curated Collections)**

- **内置访问**：预置 **999 Club** 和 **BIP39 Club** 等标志性 ENS 社区视图。
- **即时洞察**：无需繁琐配置，即可即时查看这些基石资产的注册状态、过期时间线与持有分布情况。

### 🌍 **原生国际化支持**

- **双语系统**：内置 **English** 和 **简体中文** 支持，深度适配 Web3 社区语言习惯。
- **持久化设置**：语言偏好自动保存，并在下次访问时自动加载。

## 🛠️ 技术栈

- **核心**: React 18, TypeScript, Vite
- **Web3**: Wagmi v2, Viem, ConnectKit
- **合约**: Solidity (AdvancedBulkRenewal)
- **数据**: The Graph (GraphQL)
- **状态**: TanStack Query (React Query), Custom Local Store
- **国际化**: i18next, react-i18next
- **样式**: Tailwind CSS, FontAwesome
