# ENSBook

<img src="public/img/logo-glasses-600x300.png" alt="ENSBook Logo" width="80px" height="40px" />

[English](./README.md) 简体中文

由 [@ENSUser](https://twitter.com/ensuser) 支持，并由 [@forlbb](https://twitter.com/forlbb) 编写。

## 介绍

**ENSBook** 是一个轻量级的 ENS 观察和注册工具，它支持:

- 一次输入并即时查看多个 ENS 名称的信息，包括当前的使用信息和一些历史信息等。
- 可通过自定义配置实现更快的注册速度、更少的 GAS 消耗。
- 可自定义接收名称的以太坊地址，将名称注册的操作员和接收者分离，保护名称安全。
- Web3 钱包和自定义钱包两种连接模式 (默认情况下为 Web3 钱包模式)。
- ENS 名称一键注册和批量注册 (该功能仅在自定义钱包模式下可用)。
- 继续改进和增加其他功能。

### 更新

2022 年 3 月, ENSBook 上线了 V2 版本。这个版本的新功能如下:

- 添加了对 Web3 钱包的支持，如: Metamask, WalletConnect。
- 添加了名称续费功能。
- 重新设计了 UI。
- 重新设计了注册和续费流程交互界面，提示信息更丰富。
- 支持注册流程分步操作和中断后的继续操作。
- 支持精确地对注册时长和续费时长进行自定义。
- 重新设计了更加简洁实用的配置界面。
- 一些其他的更新。

### 注意

- ENSBook 仅支持 .eth 二级域名 (类似 ensbook.eth)。
- ENSBook 只是一个辅助工具，请根据自己的情况使用。
- ENSBook 不收集任何个人信息，所有自定义配置都存储在您的本地环境中。
- ENSBook 支持以太坊主网和 Ropsten 网络，您可以先在 Ropsten 网络上进行功能测试。

## 使用

### 开始

您可以直接使用 ENSBook 的 Web 版本，也可以下载源码并在本地运行。

#### Web 版本

1. 在浏览器中打开 [ensbook.xyz](https://ensbook.xyz/) 或者 [ensbook.eth.link](https://ensbook.eth.link/)
2. 连接钱包，或者忽略连接使用只读模式。
3. 点击右上角的齿轮。
4. 按照需求 [配置自定义项](#自定义配置)。
5. 保存配置。

#### 本地运行

1. `git clone https://github.com/hibbb/ensbook.git && cd ensbook`
2. `yarn`
3. 按照需求 [配置自定义项](#自定义配置)（修改文件 /src/conf.json 中的 custom 部分）。
4. `yarn build`
5. `yarn global add serve`
6. `serve build`
7. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

### 使用提示

- **特别关注**: 单击某个域名标签，可以改变它的颜色，以便特别关注某些 ENS 域名。
- **多页模式**: 除了 [ensbook.xyz](https://ensbook.xyz/) 和 [ensbook.eth.link](https://ensbook.eth.link/) 之外，ENSBook 还开放了另外 5 个页面 (从 [1.ensbook.xyz](https://1.ensbook.xyz/) 至 [5.ensbook.xyz](https://5.ensbook.xyz/))，以便于保存和显示不同类别的域名集合，您还可以在自定义设置中给每个页面进行个性化标记。
- **标签导出**: 在输入文本框中连续单击三次，可以将目前列表中的域名标签导出到文本框中，方便分享和复用。
