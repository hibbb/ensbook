# ENSBook

<img src="public/img/logo-glasses-600x300.png" alt="ENSBook Logo" width="80px" height="40px" />

[English](./README.md) 简体中文

由 [@ENSUser](https://twitter.com/ensuser) 支持，并由 [@forlbb](https://twitter.com/forlbb) 编写。

## 介绍

**[ENSBook](https://ensbook.xyz/)** 是一个用于观察、注册或更新 ENS 名称的轻量级工具。它支持:

- 一次输入并即时查看多个 ENS 名称的信息，包括当前的使用信息和一些历史信息等。
- 可通过自定义配置实现更快的注册速度、更少的 GAS 消耗。
- 可自定义接收名称的以太坊地址，将名称注册的操作员和接收者分离，保护名称安全。
- Web3 钱包和自定义钱包两种连接模式 (默认情况下为 Web3 钱包模式)。
- ENS 名称一键注册，以及中断后继续注册。
- 继续改进和增加其他功能。

### 注意

- ENSBook 仅支持 .eth 二级名称 (类似 ensbook.eth)。
- ENSBook 只是一个辅助工具，请根据自己的情况使用。
- ENSBook 不收集任何个人信息，所有自定义配置都存储在您的本地环境中。
- ENSBook 支持以太坊主网和 [Goerli 测试网](https://goerli.net/)，您可以先在 Goerli 网络上进行功能测试。

## 使用

### 开始

您可以直接使用 ENSBook 的 Web 版本，也可以下载源码并在本地运行。

#### Web 版本

1. 在浏览器中打开 [ensbook.xyz](https://ensbook.xyz/) 或者 [ensbook.eth.limo](https://ensbook.eth.limo/)
2. 连接钱包，或者忽略连接使用只读模式。
3. 点击右上角的齿轮。
4. 按照需求配置自定义项。
5. 保存配置。

#### 本地运行

1. `git clone https://github.com/hibbb/ensbook.git && cd ensbook`
2. `yarn`
3. 按照需求配置 `/src/conf.json` 文件中的自定义项。
4. `yarn build`
5. `yarn global add serve`
6. `serve build`
7. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

### 使用提示

- **快捷输入**: 利用输入框，您可以：
  - 1. 一次性可以输入多个用空格分开的名称标签。
  - 2. 通过 `@名称` 的格式（比如 @liubenben.eth）来获取这个名称所有者持有的全部 ENS 名称。
  - 3. 通过 `#名称` 的格式（比如 #liubenben.eth）来获取这个名称的解析记录持有的全部 ENS 名称。
  - 4. 通过 `@地址` 或 `#地址` 的格式（比如 @0x123... 或 #0x123...）来获取这个地址持有的全部 ENS 名称。
- **标记名称**: 单击某个名称标签，可以将其标记为红色，以便特别关注某些 ENS 名称。
- **多页模式**: 除了 [ensbook.xyz](https://ensbook.xyz/) 和 [ensbook.eth.limo](https://ensbook.eth.limo/) 之外，ENSBook 还开放了另外 5 个页面 (从 [1.ensbook.xyz](https://1.ensbook.xyz/) 至 [5.ensbook.xyz](https://5.ensbook.xyz/))，以便于保存和显示不同类别的名称集合，您还可以在自定义设置中给每个页面进行个性化标记。
- **标签导出**: 在输入文本框中连续单击三次，可以将目前列表中的名称标签导出到文本框中，方便分享和复用。
