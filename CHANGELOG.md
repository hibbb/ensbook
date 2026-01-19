## [3.1.0] - 2026-01-19

### 🚀 Features

- 增加 Account 页面，用于显示账户持仓信息
- 为注册和续费增加日期选择模式
- 在 设置>数据管理 增加一键清空自定义数据功能
- 为 Account 页面增加一个返回按钮
- _(filter)_ 实现按所有者进行筛选
- _(bulkRenewal)_ 更新批量续费的函数调用逻辑，支持新的 Advanced Bulk Renew 合约
- _(bulkRenewal)_ 增加“按日期”批量续费，支持将多个域名续费至相同的过期时间

### 🐛 Bug Fixes

- 补充更新 cells 中各文件中的 i18n 引用键值
- 修复集合名称显示问题
- 修正作者 X 链接地址
- 修复一个未及时更新的文本引用
- 规范化两处说明文字
- 解决 React Router 刷新 404 问题 & 生产环境屏蔽 Source Maps
- 修复 Home 和 Mine 页面清空时，视图状态未清理的情况
- 更新一处语言包调用

### 💼 Other

- 更新版本号，v3.0.3: 正式测试版本
- Eb 重构基本完成，v3.0.6，将启动增量开发

### 🚜 Refactor

- _(pages)_ 整理页面代码并提取公用代码
- 移除对测试网的支持
- 重构视图状态清空逻辑，在 useNameTableView 中引入“事件监听机制”
- 简化“仅显示我的”按钮显示和提示逻辑
- _(stats)_ 清理多余的数据统计结构
- 优先显示表格中的 ens 主名称，延迟显示筛选框中的
- 将“仅显示有备注的”按钮转移到 Nameheader 的筛选框中
- 更新批量续费合约地址和 ABI
- 对 ProcessModal 进行重构，避免单文件代码过于复杂
- 调整优化注册和续费时 Modal 内容的显示逻辑

### 📚 Documentation

- 更新语言包，使用“域名”代替“名称”

### 🎨 Styling

- 优化颜色标记的相关称呼
- 改善 Account 页面显示内容和样式，增加持仓总数
- 调整个别样式，对移动端更友好
- _(filter)_ 统一筛选操作样式，修复显示异常
- 调整备注图标空间
- 防过期和删除按钮颜色个性化
- 调整表格显示样式

### ⚙️ Miscellaneous Tasks

- 更新 README.md 并增加 README.zh.md
- 创建 truncateAddress 函数，替换 4 处类似的硬编码逻辑
- 提取 formatDate 和 displayNumber 到 format.ts 供全局引用
- 规范几个名称和样式
- 优化个别文本的语义
- 整理 VITE_ENS_REFERRER_HASH
- _(release)_ Merge dev into main
