# Changelog

所有重要的变更都会记录在此文件中。
格式遵循 [Conventional Commits](https://www.conventionalcommits.org/)。

## v3.2.3

### <!-- 0 -->🚀 Features

- 加入 Optimistic Updates 解决 The Graph 索引延迟导致的用户体验问题
- 在注册过程中引入 “放弃” 当前注册流程的机制

### <!-- 2 -->🚜 Refactor

- 将“倒计时结束”与“发起注册交易”解耦，避免重复发起交易请求
- 调整注册时间排序循环次序，优先降序

### <!-- 5 -->🎨 Styling

- 调整 index 列和溢价的字重
- 使用 font-semibold 替换 font-bold；connectKit 字重恢复默认值

### <!-- 7 -->⚙️ Miscellaneous Tasks

- 移除未使用的 currentAddress 信息，保持代码清洁

## v3.2.2

### <!-- 0 -->🚀 Features

- 为本地的 metadata 数据加入垃圾回收

### <!-- 3 -->📚 Documentation

- update changelog for v3.2.1

### <!-- 5 -->🎨 Styling

- 规范化字体和颜色，引入等宽字体 DM Mono
- 移除未使用的字体文件
- 仅保留必要字体及其预加载，调节个别字重字号

---

Book Your ENS Names at ENSBook.
