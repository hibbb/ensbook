# Changelog

所有重要的变更都会记录在此文件中。
格式遵循 [Conventional Commits](https://www.conventionalcommits.org/)。

## v3.2.4

### <!-- 0 -->🚀 Features

- 实现在其他页面轻松向 Home 页添加域名的功能

### <!-- 1 -->🐛 Bug Fixes

- 在 ETH, WETH 之外，增加对 "USDC", "USDT", "DAI" 价格的支持

### <!-- 2 -->🚜 Refactor

- 重构 useNameTableView，拆分出 useOwnerStats 和 useTableStats
- 优化 Home 页面添加域名时的显示逻辑，采用：本地数据驱动 + 远程数据填充
- 重构 pages 中的页面，创建 NameListView 容器组件封装公共代码
- 封装 ControlHeader 和 ControlCell，同时取代旧的 DeleteHeader

### <!-- 3 -->📚 Documentation

- update changelog for v3.2.3
- 矫正账户页面中查询识别符的名称，以“账户”作为识别符

### <!-- 4 -->⚡ Performance

- 移除 canDelete Prop，改用函数引用的真值检测，消除逻辑冗余

### <!-- 5 -->🎨 Styling

- 提升最右侧管理列的表现细节
- 同步微调 MarketCell 中的 Tooltip 样式
- 初步完成 UI 圆角化
- 仅保留表头吸顶效果，移除其他吸顶及 topOffset 相关逻辑
- 在不显示分页栏时，通过 CSS 动态控制表格最后一行的圆角
- 调整骨架屏样式，使其高度一致，长度更合理

---

Book Your ENS Names at ENSBook.
