# ENSBook

<img src="public/img/logo-glasses-600x300.png" alt="ENSBook Logo" width="80px" height="40px" />

English [简体中文](./README_CN.md)

Powered by [@ENSUser](https://twitter.com/ensuser) and written by [@forlbb](https://twitter.com/forlbb).

## About

**ENSBook** is a lightweight ENS observation and registration tool which supports:

- Enter and view information of multiple ENS names at one time, includes current usage information and some historical information, etc.
- ENS name automatical registration with one click.
- ENS name registrations in batches.
- Book the registration of the ENS name which is near release.
- Faster registration and less GAS consumption can be achieved through custom configuration.
- You can customize the ethereum addresses to separate the operator and receiver of the ENS name registration to protect the name security.
- Continue to improve and add other features.

### Attention

- ENSBook only supports .eth 2TLD name.
- ENSBook is just an auxiliary tool, please use it according to your own situation.
- ENSBook does not collect any personal information, and all your custom configurations (including private keys) are stored in your local environment.
- ENSBook supports Ropsten network. You can perform functional tests on Ropsten network first.
- ENSBook has not been long and comprehensive testing, can not guarantee that all your operations will be completed successfully.

## Usage

### Quick Start

You can use the Web version of ENSBook directly, or you can download the source code and run it locally.

#### Web Version

1. Open [ensbook.xyz](https://ensbook.xyz/) or [ensbook.eth.link](https://ensbook.eth.link/) in your browser.
2. Click the gear icon at top right corner.
3. [Configure the custom items](#custom-configuration) to suit your own needs.
4. Save your configuration.

#### Local Start

1. `git clone https://github.com/hibbb/ensbook.git && cd ensbook`
2. `yarn`
3. [Configure the custom items](#custom-configuration) ( the "custom" field in /src/conf.json ) to suit your own needs.
4. `yarn build`
5. `serve -s build`
6. Open [http://localhost:3000](http://localhost:3000) with your browser.

### Custom Configuration

Attention: If you are not familiar with these configurations, we recommend that you'd better not change the configurations other than the Global and Display items.

- **Global**
  - **Operator's Private Key** (bytes32, default: [ a test private key ]): The private key of the operator. Transactions for ENS name registrations are made and funded by this operator. If you only use ENSBook as an observation tool, you do not need to change this value.
  - **Network** (string, default: Ethereum Mainnet): The Ethereum network you are using, only the ethereum mainnet and ropsten network are currently supported.
  - **Receiver's Address** (address, default: [ the operator's address ]): An Ethereum address used to receive newly registered ENS names. After this parameter is set, the ENS name will be registered to the address. If this parameter is not set, the ENS name will be registered to the operator address above. Although the operator private key is only stored in the local environment, we recommend that you set this entry to a separate address to improve the security of your registrations.
  - **Infura ID** (string, default: [ a test infura ID ]): Your infura ID. It is recommended to change the default to your own Infura ID to ensure stability.
  - **Page Tag** (string, default: [ null ]): You can set a custom tag for the page. This item is useful when you use the multi-page mode of ENSBook.
- **Commit**
  - **Gas Price** (integer in Gwei, default: [ automatic ]): Gas price for commit transaction.
  - **Gas Limit** (integer, default: 50000): Gas limit for commit transaction.
  - **Confirms** (integer, default: 2): The number of confirmations to wait for after the commit transaction.
- **Register**
  - **Duration** (integer in days, default: 365): Duration of the registration in days.
  - **Value** (decimal in ETH, default: [ automatic ]): Funds to be sent for registering. If this is not set, ENSBook will calculate the cost automatically.
  - **Gas Price** (integer in gwei, default: [ automatic ]): Gas price for the register transaction.
  - **Gas Limit** (integer, default: 300000): Gas limit for the register transaction.
  - **Confirms** (integer, default: 2): The number of confirmations to wait for after the register transaction.
  - **Register With Config** (boolean, default: true): Whether the resolver and addr record are configured together at the registration time. If false, about a third of gas fee will be saved.
- **Book**
  - **Active Duration** (integer in hours, fixed: 24): You can only see the "Book" button and use this function in the 24 hours before the ENS name is released.
  - **Time Slot** (integer in seconds, default: 5): A time slot designed to improve the success rate of book registration.
- **Other**
  - **Time Display** (string, default: Expires Time): You can choose to display the expires time or release time of ENS names according to your personal situation.
  - **Lookup Display** (struct, default: [ Partly Display ]): You can choose which information query links to display in the "Lookup" column of the page according to your personal situation.
- **Donate**
  - **Percentage** (integer, default: 5): The percentage of the ether used for registration. Automatically donate a little ether to the author of ENSBook at the set percentage. In general, no donation will occur because a donation will occur only if the ether used for registration (excluding GAS) is at least 0.05 ETH and the ENS name is successfully registered. If you prefer not to donate even then, you can set this option to 0.

### Usage Tips

In addition to basic observation and registration functions, ENSBook has some features that are not easily discovered.

- **Special Focus**: You can click a name label to change its color so that you can pay special focus to certain ENS names.
- **Sort Display**: You can sort the contents of the table by clicking some parts in the table header.
- **Booking**: If a ENS name has expired, its reg button will change to "Book" within 24 hours before the endpoint of its grace period.
- **Multi-page Mode**: In addition to [ensbook.xyz](https://ensbook.xyz/) and [ensbook.eth.link](https://ensbook.eth.link/), ENSBook provides five additional pages (from [1.ensbook.xyz](https://1.ensbook.xyz/) to [5.ensbook.xyz](https://5.ensbook.xyz/)) to save and display ENS name collections of different categories, and you can also set individual tags for each page in custom configuration.
- **Label Export**: You can click three times in the input box to export the name labels in the current page to the input box for easy sharing and reuse.
