# Changelog

All notable changes to this project will be documented in this file.

## [3.0.1] - 2026-01-07

### ✨ "自由飞翔" 功能增强 (Fly Freely Features)

- **Mine 页面常驻**: 移除动态显示逻辑，Mine 页面现在作为导航栏的永久入口，提供更好的功能发现性。
- **自定义首页**: 新增“设为默认首页”功能。用户可以在设置中开启此项，使 ENSBook 启动时默认进入 Mine 页面。
- **智能重定向**: 引入根路径分发机制，根据用户偏好自动导向 `/home` 或 `/mine`。

### ⚡ 搜索逻辑简化 (Search Logic Refactor)

- **重构为 Version 2**:
  - 自动识别 `0x` 开头的以太坊地址，无需前缀。
  - 保留 `@` 前缀用于查找域名持有者持有的所有域名。
  - 移除了复杂的 `#` 关联搜索逻辑 (`linkOwners`)，提升解析效率。
- **Hook 同步**: 更新 `useEnsLabels` 以支持 `ethAddresses` 的长度检查，确保搜索触发准确。

### 🎨 UI/UX 优化

- **开关组件重构**: 修复了“设为默认首页”开关在部分浏览器下的错位问题，采用了更稳定的 CSS Peer 方案。
- **说明文档扁平化**: 重新设计了设置页的引导说明，去除冗余卡片背景，风格更加简洁、现代。

### 🛡️ 健壮性与一致性 (Data Integrity)

- **级联清理**: 当用户清空“我的集合”源字符串时，系统现在会自动重置 Mine 页面的视图状态（筛选与排序），消除隐形状态干扰。
- **类型修复**: 解决了 `useNameRecords` 在解析期间可能出现的 `undefined` 类型不匹配问题。

## [3.0.0] - 2026-01-05

### ✨ Added

- **Smart View State**: Introduced `isViewStateDirty` and `resetViewState` logic to track and clear table filters/sorting.
- **ViewStateReset UI**: Added a floating "Reset View" button that intelligently avoids overlap with the batch action bar.
- **Metadata Injection**: Project name, version, and author links are now synced directly from `package.json` to the UI and browser title.
- **Dynamic Titles**: Browser tab titles now update dynamically based on the current page or collection name (e.g., "ENSBook - BIP39 Club").

### ⚡ Improved

- **UX Guardrails**: The Home page now automatically resets all filters when the list becomes empty (via manual delete or bulk clear) to prevent "hidden filter" confusion.
- **Data Architecture**: Separated view states between Home and Collection detail pages for better context isolation.

### 🐛 Fixed

- **TypeScript Strictness**: Resolved TS2322 error in `CollectionDetail.tsx` regarding optional data length checks.
- **Wagmi Config**: Centralized `appName` source of truth using the injected `__APP_NAME__` constant.

### 📝 Documentation

- **README Update**: Fully revamped the README with the new "Local-First" positioning and feature highlights.
