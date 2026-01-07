# ENSBook

> **Your private, efficient, and intelligent ENS portfolio manager.**
>
> 你的私有化、高效、智能的 ENS 资产管理专家。

<p align="center">
  <img src="./public/logo-glasses-with-title-870-500.png" alt="ENSBook Logo" width="300">
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

## 📖 简介 | Introduction

**ENSBook** 是一款坚持 **Local-First（本地优先）** 哲学的 ENS 域名管理终端。

我们摒弃了繁重的中心化后端数据库，完全基于链上数据（The Graph）和浏览器本地存储构建。它不仅解决了官方 App 在多域名管理和个性化备注上的痛点，更通过内置的多线程解析引擎和智能缓存策略，为你提供极速、流畅且隐私安全的资产管理体验。

## ✨ 核心特性 | Key Features

### ⚡ **极速批量检索 (High-Performance Search)**

- **Web Worker 引擎**：内置多线程解析器，支持文本、地址、混合格式的毫秒级处理。无论是粘贴 10 个还是 1000 个域名，界面始终流畅不卡顿。
- **智能分类**：自动识别并分类处理普通域名、以太坊地址（反向解析）及特定持仓查询（`@user` / `#tag`）。

### 🛡️ **健壮的注册系统 (Robust Registration)**

- **状态自动恢复**：采用状态机管理 ENS 的 Commit-Reveal 两步注册流程。即使你刷新页面或意外关闭浏览器，也能从本地精准恢复注册进度，防止 Gas 浪费。
- **安全防抢跑**：注册所需的随机 Secret 仅在本地生成并存储，杜绝中间人攻击。

### 🔒 **数据主权与隐私 (Data Sovereignty)**

- **零后端依赖**：您的**关注列表**、**私有备注 (Memos)** 及**视图偏好**完全存储在浏览器本地 (`localStorage`)。我们不收集任何用户数据。
- **完整备份方案**：支持生成标准 JSON 备份文件，提供“合并”与“覆盖”两种恢复策略，确保您的资产配置永不丢失。

### 🏷️ **智能视图与管理 (Smart Management)**

- **上下文隔离**：Home（关注列表）与 Collection（如 999 Club、助记词集合）的数据与视图状态物理隔离，互不干扰。
- **视图状态持久化**：自动记忆您在不同页面下的筛选（状态、长度、Wrap状态）与排序偏好，打造最顺手的工作台。
- **续费提醒**：一键生成 `.ics` 日历文件或添加到 Google Calendar，精准设置续费提醒。

## 🛠️ 技术栈 | Tech Stack

- **Core**: React 18, TypeScript, Vite
- **Web3**: Wagmi v2, Viem, ConnectKit
- **Data**: The Graph (GraphQL), Apollo Client
- **State**: TanStack Query (React Query), Custom Local Store
- **Styling**: Tailwind CSS, FontAwesome

## 📄 许可证 | License

MIT License
