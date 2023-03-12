# [EVM web3 hook](https://www.npmjs.com/package/evm-web3-hooks) npm package

[![](https://i.imgur.com/3xau6hk.png)](https://drive.google.com/file/d/1q3y5JkCIbhdkzgZPZdOx3xqNoMaLEqdF/view?usp=sharing)

[This video](https://youtu.be/saeeys0AWUk) guid through how to extract existing react project's hook and publish it onto npm, so it will be come available everywhere by installing the npm pacakge
`yarn add` or `npm install`.

## How to use

0. npm install package

```
yarn add evm-web3-hooks
//or
npm install evm-web3-hooks
```

1. Wrap the top level <App/> component by <Web3Provider>

```
import Web3Provider from "evm-web3-hook";

<Web3Provider>
  <App/>
</Web3Provider>
```

2. Use global web3Context everywhere

```
const web3Context = useWeb3()
```

3. The example [EVM Dapp boilerplate](https://github.com/happyeric77/evm-dapp-boilerplate-ts.git)

# Release note

## 0.1.0

- Add default value for web3Data (default chain id = 1)
