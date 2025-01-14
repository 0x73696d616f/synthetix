## Deploying Synthetix on Harmony

### List of required repos

Synthetix:

```shell
https://github.com/ArtemKolodko/synthetix/tree/harmony_new_deployment
```

Synthetix UI:

```shell
https://github.com/ArtemKolodko/synthetix-js-monorepo/tree/harmony_support
```

Band oracle reader:

```shell
https://github.com/harmony-one/band-oracle-reader
```

Existed Band oracle feeds:

```shell
BTC: 0x4EdeeB8efa8e8dA1a68699D19BA9B85d78EAc565
ONE: 0x6cb4f021d163d38766e90534b21a71b2085b61a8
ETH: 0xf0184d340660cd3ce4944f0c6e1b63c85d78dbcd
1SY: 0xC0565A0aeccC60Ff1636f53c4dF26e228C4Dc139
```

Band oracle updater:

```shell
https://github.com/harmony-one/band-oracle-updater
```

### Deployment steps

1. Build Synthetix contracts (repo: `synthetix`):

```shell
yarn compile
```

2. Compile contracts into `build/compiled`:

```shell
node publish build
```

3. Create folder for new deployment:

```shell
mkdir ./publish/deployed/harmony4
```

4. (Optional) Deploy Band oracles for each token from `publish/deployed/harmony4/feeds.json` (SNX, BTC, ETH, ...):

https://github.com/polymorpher/synthetix-v2/blob/band-oracle/oracle-notes.md

BandOracleReader sources:

[https://github.com/harmony-one/band-oracle-reader](https://github.com/harmony-one/band-oracle-reader)

5. Change oracle feed addresses, using contracts deployed on Step 1, or use existed oracle feeds from previous deployment.

Path: `/publish/deployed/harmony4/feeds.json`

Example with BTC token:

```shell
{
	"BTC": {
		"asset": "BTC",
		"feed": "0x4EdeeB8efa8e8dA1a68699D19BA9B85d78EAc565"
	}
}

```

Replace `/publish/deployed/harmony4/deployment.json` file with following structure:

```shell
{
	"targets": {},
	"sources": {}
}
```

Set all values in `/publish/deployed/harmony4/config.json` to `"deploy":true`.

Example:

```shell
{
	"SystemSettings": {
		"deploy": true
	},
	"SynthetixBridgeToOptimism": {
		"deploy": true
	},
	...
}
```

6. Create `.env` file in root folder and add envs:

```shell
PRIVATE_KEY=0x123
DEPLOY_PRIVATE_KEY=0x123
PROVIDER_URL_MAINNET=https://api.harmony.one
```

Note that deployer account should have ONE tokens on balance

7. Run Synthetix deployment

```shell
node publish deploy --network harmony --deployment-path ./publish/deployed/harmony4 --ignore-safety-checks
```

8. Open [Synthetix UI](https://github.com/ArtemKolodko/synthetix-js-monorepo/pull/1) repo, install dependencies and copy content of a new folder:

```
synthetix/publish/deployed/harmony4
```

to

```
js-monorepo/v2/contracts/publish/deployed/harmony
```

9. In Synthetix UI (`js-monorepo`) run script to build contract bindings:

```shell
cd /v2/contracts
yarn build
```

10. In Synthetix UI navigate to `v2/ui` and run Synthetix client locally:

```shell
yarn dev
```

11. Open http://localhost:3000/, Synthetix V2 client page should be displayed

12. Launch BandOracleUpdater for all price feeds: [https://github.com/harmony-one/band-oracle-updater](https://github.com/harmony-one/band-oracle-updater)

### Create 1SY oracle feed

1\) Create new 1USDC/1SY liquidity pool on [swap.country/pools](https://swap.country/#/pools)

Reference: 1USDC / 1SY
https://info.swap.harmony.one/#/harmony/pools/0xbc4af4ee9164c469b9e90f7d9b5f7854556133d6

2\) Clone https://github.com/polymorpher/synth-oracle and run `forge build`
3\) Create .env file in project root:

```shell
POOL_ADDRESS=0x1234 [pool address from Step1]
DEPLOYER_PRIVATE_KEY=0x5678 [your private key]
```

4\) Deploy new oracle contract:

```shell
./deploy.sh
...
Oracle address: 0xe3EAB0d319908c3Ca68076b208a9870571dDb03F
```

5\) Trade 1USDC / 1SY on swap.country and check the price:

```shell
cast call 0xe3EAB0d319908c3Ca68076b208a9870571dDb03F "latestAnswer()(int256)" --rpc-url https://api.harmony.one
```

6\) Set new oracle feed for 1SY token:

Open [Synthetix](https://github.com/ArtemKolodko/synthetix/tree/harmony_new_deployment) repo and navigate to scripts folder:

```shell
cd harmony-scripts
```

Set `newFeedAddress` in `update-feed.js` script:

```shell
const exchangeRatesAddress = '0x4d6A3E4524a1b269C7E3564a22b908693Aa5186A';
...
const newFeedAddress = '0xe3EAB0d319908c3Ca68076b208a9870571dDb03F';
```

Run update script (you must be the owner of ExchangeRates contract):

```shell
node update-feed.js
```

Feed address updated

### Profitable trades script:

Add the private keys to the `.env` file in the root folder, as they will be used as signers:

```shell
PRIVATE_KEY1=0x123
PRIVATE_KEY2=0x123
PRIVATE_KEY3=0x123
```

Run the profitable trades script:

```shell
node profitable-trade.js
```

Input the Trade Values:

> Follow the prompts in the terminal to input the sizes and prices for the trades. The script will execute the trades on the blockchain.

After running `node profitable-trade.js`, you might see something like this in your terminal:

````Enter size for first long position (signer1): 50
Enter desired fill price for first long position (signer1): 1500
Opening long position with signer1...
Long position opened with signer1: 0x123...abc

Enter size for second long position (signer2): 100
Enter desired fill price for second long position (signer2): 1500
Opening long position with signer2...
Long position opened with signer2: 0x456...def

Enter size for short position (signer3): -50
Enter desired fill price for short position (signer3): 1500
Opening short position with signer3...
Short position opened with signer3: 0x789...ghi

Closing long position with signer1...
Long position closed profitably with signer1: 0x123...abc

Closing long position with signer2...
Long position closed profitably with signer2: 0x456...def

Closing short position with signer3...
Short position closed profitably with signer3: 0x789...ghi```
````
