# ENSBook

<img src="public/img/logo-glasses-600x300.png" alt="ENSBook Logo" width="80px" height="40px" />

English [简体中文](./README_CN.md)

Powered by [@ENSUser](https://twitter.com/ensuser) and written by [@forlbb](https://twitter.com/forlbb).

## About

**ENSBook** is a lightweight tool used for observing, registering or renewing ENS names. It supports:

- Enter and view information of multiple ENS names at one time, includes current usage information and some historical information, etc.
- Faster registration and less GAS consumption can be achieved through custom configuration.
- You can customize the ethereum addresses to separate the operator and receiver of the ENS name registration to protect the name security.
- There are two connection modes: Web3 wallet and custom wallet, the default connection mode is Web3 wallet.
- ENS name automatical registration with one click and continuing registration after interruption.
- Continue to improve and add other features.

### Attention

- ENSBook only supports .eth 2TLD name.
- ENSBook is just an auxiliary tool, please use it according to your own situation.
- ENSBook does not collect any personal information, and all your custom configurations are stored in your local environment.
- ENSBook supports Ethereum Mainnet and Goerli network. You can perform functional tests on Goerli network first.

## Usage

### Quick Start

You can use the Web version of ENSBook directly, or you can download the source code and run it locally.

#### Web Version

1. Open [ensbook.xyz](https://ensbook.xyz/) or [ensbook.eth.limo](https://ensbook.eth.limo/) in your browser.
2. Connect your wallet, or ignore the connection and use read-only mode.
3. Click the gear icon at top right corner.
4. Configure the custom items to suit your own needs.
5. Save your configuration.

#### Local Start

1. `git clone https://github.com/hibbb/ensbook.git && cd ensbook`
2. `yarn`
3. Configure the custom items (the "custom" field in /src/conf.json) to suit your own needs.
4. `yarn build`
5. `yarn global add serve`
6. `serve -s build`
7. Open [http://localhost:3000](http://localhost:3000) with your browser.

### Usage Tips

In addition to basic observation and registration functions, ENSBook has some features that are not easily discovered.

- **Shortcut Input**: You can take advantage of the input box for:
  - 1. Getting a bulk result through entering more than one name label separated by spaces at a time.
  - 2. Getting all ENS names held by the owner of a specific NAME through the `@NAME` format (e.g. @liubenben.eth).
  - 3. Getting all ENS names held by the address which a specific NAME resolved to through the `#NAME` format (e.g. #liubenben.eth).
  - 4. Getting all the ENS names held by a specific ADDRESS through the `@ADDRESS` or `#ADDRESS` format (e.g. @0x123... or #0x123...).
- **Mark Names**: You can click a name label to mark it in red so that you can pay special focus to certain ENS names.
- **Multi-page Mode**: In addition to [ensbook.xyz](https://ensbook.xyz/) and [ensbook.eth.limo](https://ensbook.eth.limo/), ENSBook provides five additional pages (from [1.ensbook.xyz](https://1.ensbook.xyz/) to [5.ensbook.xyz](https://5.ensbook.xyz/)) to save and display ENS name collections of different categories, and you can also set individual tags for each page in custom configuration.
- **Label Export**: You can click three times in the input box to export the name labels in the current page to the input box for easy sharing and reuse.