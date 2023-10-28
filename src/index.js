// @ts-check
import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";

import { MnemonicWallet } from "cosmes/wallet";
import { MsgSend, getNativeBalances } from "cosmes/client";
import { CosmosBaseV1beta1Coin as Coin } from "cosmes/protobufs";

(async () => {
  const reader = createInterface({
    input: stdin,
    output: stdout,
  });
  const mnemonic = (
    await reader.question("Enter your 12 or 24 words seed phrase:\n")
  ).trim();
  if (!mnemonic) {
    console.error("Please enter a valid seed phrase!");
    process.exit(1);
  }

  const walletOpts = {
    mnemonic,
    bech32Prefix: "kujira",
    chainId: "kaiyo-1",
    rpc: "https://kujira-rpc.publicnode.com",
    gasPrice: {
      amount: "0.002",
      denom: "ukuji",
    },
  };
  const wallet = new MnemonicWallet({ ...walletOpts, coinType: 330 });
  const { address: targetAddress } = new MnemonicWallet({
    ...walletOpts,
    coinType: 118,
  });

  console.log(`Querying for KUJI in ${wallet.address}...`);
  const balance = await getNativeBalances(walletOpts.rpc, wallet);
  const coin = balance.find(({ denom }) => denom === "ukuji");
  if (!coin) {
    console.error("No KUJI balance detected!");
    process.exit(1);
  }
  console.log(`KUJI balance: ${(Number(coin.amount) / 1_000_000).toFixed(6)}`);

  console.log(`Estimating gas fees to send KUJI to ${targetAddress}...`);
  const fee = await wallet.estimateFee(
    {
      msgs: [
        new MsgSend({
          fromAddress: wallet.address,
          toAddress: targetAddress,
          amount: [coin],
        }),
      ],
      memo: "Migration powered by Coinhall/CosmES",
    },
    1.5
  );
  const feeAmount = fee.amount[0].amount;
  console.log(
    `Gas fees required: ${(Number(feeAmount) / 1_000_000).toFixed(6)} KUJI`
  );

  const amountToSend = BigInt(coin.amount) - BigInt(feeAmount);
  if (amountToSend <= 0n) {
    console.error("Not enough KUJI to send after accounting for gas fees!");
    process.exit(1);
  }
  const coinToSend = new Coin({
    denom: "ukuji",
    amount: amountToSend.toString(),
  });
  console.log(
    `Sending ${(Number(coinToSend.amount) / 1_000_000).toFixed(
      6
    )} KUJI to ${targetAddress}...`
  );

  const { txResponse } = await wallet.broadcastTxSync(
    {
      msgs: [
        new MsgSend({
          fromAddress: wallet.address,
          toAddress: targetAddress,
          amount: [coinToSend],
        }),
      ],
      memo: "Migration powered by Coinhall/CosmES",
    },
    fee
  );
  if (txResponse.code !== 0) {
    console.error(
      `Failed to migrate to ${targetAddress}: ${txResponse.rawLog}`
    );
    console.error(`Tx hash: ${txResponse.txhash}`);
    process.exit(1);
  }
  console.log(`Successfully migrated to ${targetAddress}!`);
  console.log(
    "You may now use the same seed phrase in any wallet that supports Kujira to interact with your migrated KUJI."
  );
  console.log(`Tx hash: ${txResponse.txhash}`);
})();
