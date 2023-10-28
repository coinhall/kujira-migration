# Kujira Migration

Node.js CLI tool to migrate KUJI from Terra Classic, powered by [CosmES](https://github.com/coinhall/cosmes).

> [!WARNING]
> The use of this software does not make Coinhall liable for any loss of funds, direct or indirect, caused by the use of the software. The software is provided "as is" and without warranty of any kind, express or implied. The user assumes all risks associated with using the software.

## Getting Started

This assumes that you have some coding experience. Before continuing, please take some time to [audit the code](./src/index.js). **PSA: do not blindly give away your seed phrase without knowing what you are doing!**

### 1. Install Node.js v18+

If you haven't already, install Node.js v18+: <https://nodejs.org/en/download>.

### 2. Clone this repository

```sh
git clone https://github.com/coinhall/kujira-migration
cd kujira-migration
```

### 3. Install all dependencies

```sh
npm i
# or yarn
# or pnpm i
```

### 4. Run the script

```sh
node src/index.js
```

When prompted, enter the 12 or 24 words seed phrase of your Terra Classic wallet which held KUJI or SKUJI on the 13 May 2022 snapshot. If all goes well, all KUJI will be fully migrated and you may proceed to use the same seed phrase in wallets like Keplr or Sonar to interact with your migrated KUJI.
