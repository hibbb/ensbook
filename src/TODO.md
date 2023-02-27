# TODO LIST

## Priority 1

- [ ] check uppercase letters with @/# ahead
- [ ] show if the name is listed on opensea/gem
- [ ] differ owners with the color derived from its address
- [ ] move related info to the left

## Priority 2

- [ ] support multi-owners-manage

## Priority 3

- [ ] add reminder feature for names which will reopen, according to its time/price, maybe we need a email reminder.
- [ ] MetaMask: 'ethereum.enable()' is deprecated and may be removed in the future. Please use the 'eth_requestAccounts' RPC method instead. For more information, see: https://eips.ethereum.org/EIPS/eip-1102

## Completed From v1.4.0

- [x] migrate testnet to Goerli after Merge
- [x] preload fonts
- [x] disable sorting while fetching
- [x] let main input get focus after addNames
- [x] multiple name deletion methods
- [x] move sort of level approach to the label column
- [x] support inputing an address to get all name owned by the address
- [x] add more sort methods such as length, characters, level
- [x] disable del button when fetching
- [x] read fixed config only from the app instead of localstorage
- [x] support selecting which name to reg or renew
- [x] add the owner's inventory in lookups
- [x] double check the status before every signle registration when bulk registering
- [x] add favourite feature (keep red labels when click del button once)
- [x] add looksrare & gem.xyz
- [x] display the names before regNames
- [x] add custom receiver input on reg Modal
- [x] learn the new rentPrice function in EP9
- [x] Price Range of Concern
- [x] add renew feature
- [x] support ENS for registration receiver
- [x] rebuild configure UI and features
- [x] remove displaytime and confirms in configureForm
- [x] only support mainnet and ropsten
- [x] check the offchavs display when leaving the configureform
- [x] remove toastify and recover bootstrap-toast as need
- [x] registration modal UI: show name info before reg
- [x] disable all the consume actions when using default provider
- [x] insert regStep 0.5 and 1.5
- [x] seperate reg function into 4 pieces: regPrepare, regStep1, regStep2, regStep3
- [x] WalletConnect test
- [x] add lookupAddress for operator's address
- [x] collate account and network display logic
- [x] move refresh button to the status column
- [x] remove book feature
- [x] add more tooltip
- [x] optional duration for registration & renewal
- [x] rebuild ConfigureForm
- [x] disable the whole page when updating name
- [x] remove donation feature
- [x] move deleteAll to the table header
- [x] add a button that can hide unregistrable names
- [x] match mobile display

## Deserted

- [ ] insert registrant to state.nameInfo for every name
- [ ] get registration data from metadata
