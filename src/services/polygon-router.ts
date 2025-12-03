import {
  createWalletClient,
  erc20Abi,
  getContract,
  http,
  maxUint256,
  publicActions,
  WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";
import { POLYMARKET_FUNDER_ADDRESS } from "../utils/constants";
import { toHexString } from "../utils/hex";
import { BotContext } from "./telegram";

const POLY_NODE_URL = process.env.POLY_NODE_URL || "";

const polygonClient = createWalletClient({
  chain: polygon,
  transport: http(POLY_NODE_URL),
}).extend(publicActions);

export function getUserEvmClient(privateKey: string): WalletClient {
  return createWalletClient({
    chain: polygon,
    transport: http(POLY_NODE_URL),
    account: privateKeyToAccount(toHexString(privateKey)),
  });
}

const ZERO_EX_API_KEY = process.env["0X_SWAP_API_KEY"] || "";

const POL_ADDRESS = "0x455e53cbb86018ac2b8092fdcd39d8444affc3f6";
const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

const usdc = getContract({
  address: USDC_ADDRESS,
  abi: [erc20Abi],
  client: polygonClient,
});

// fetch headers
const headers = new Headers({
  "Content-Type": "application/json",
  "0x-api-key": ZERO_EX_API_KEY,
  "0x-version": "v2",
});

function buildSwapParams(address: string, amount: number) {
  return {
    sellToken: POL_ADDRESS,
    buyToken: USDC_ADDRESS,
    sellAmount: amount.toString(),
    taker: address,
  };
}

export async function deposit(ctx: BotContext) {
  if (!ctx.user) {
    await ctx.reply("User not found.");
    return;
  }
  const client = getUserEvmClient(ctx.user.ethPrivateKey);
  if (!client.account) {
    await ctx.reply("EVM account not found.");
    return;
  }

  const balance = await getUserBalance(ctx.user.ethAddress);
  if (!balance) {
    await ctx.reply(`The address ${ctx.user.ethAddress} has no balance.`);
    return;
  }
  await ctx.reply(
    `Swapping ${String(Number(balance) / 10 ** 18)} POL to USDC\n`
  );
  const quote = await getPolyToUsdcQuote(ctx.user.ethAddress, Number(balance));
  if (!quote || !quote.buyAmount) {
    await ctx.reply("Unable to get a quote for the swap.");
    return;
  }
  await ctx.reply(
    `You will receive approximately ${String(
      Number(quote?.buyAmount) / 10 ** 6
    )} USDC for your POL.\n`
  );
  await approvePolyToUsdcSwap(client, quote);
  await ctx.reply("Approved POL transfer for swap.\n");

  const hash = await client.sendTransaction({
    to: quote?.transaction.to,
    data: quote?.transaction.data,
    value: quote?.transaction.value
      ? BigInt(quote.transaction.value)
      : undefined, // value is used for native tokens
    account: client.account,
    chain: polygon,
  });
  await ctx.reply(
    `Swap transaction sent: ${hash}\nWaiting for confirmation...`
  );

  await polygonClient.waitForTransactionReceipt({ hash });
  await ctx.reply("Swap transaction confirmed!\nUSDC has been deposited.");

  const usdcTransfer = await usdc.write.transfer([
    POLYMARKET_FUNDER_ADDRESS,
    BigInt(quote.buyAmount),
  ]);
  await ctx.reply(`Depositing USDC to PolyStrategy`);
  await polygonClient.waitForTransactionReceipt({ hash: usdcTransfer });
}

async function getUserBalance(address: string) {
  const _balance = await polygonClient.getBalance({
    address: toHexString(address),
  });
  const balance = Number(_balance);
  const minimumBalance = 2.5 * Math.pow(10, 18); // 2.5 POL in wei
  return balance > minimumBalance ? balance - minimumBalance : 0; // minimum 2.5 POL to proceed
}

//  "https://api.0x.org/swap/allowance-holder/quote?sellAmount=100000000000000000000000&taker=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045&chainId=1&sellToken=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&buyToken=0x6b175474e89094c44da98b954eedeac495271d0f"
async function getPolyToUsdcQuote(address: string, amount: number) {
  const params = new URLSearchParams(buildSwapParams(address, amount));
  const quote = await fetch(
    `https://api.0x.org/swap/v1/quote?${params.toString()}`,
    {
      method: "GET",
      headers,
    }
  );
  return (await quote.json()) as any;
}

async function approvePolyToUsdcSwap(client: WalletClient, price: any) {
  if (price.issues.allowance !== null) {
    try {
      const { request } = await usdc.simulate.approve([
        price.issues.allowance.spender,
        maxUint256,
      ]);
      if (!request || !request.args) {
        console.log("No approval request generated");
        return;
      }
      console.log("Approving AllowanceHolder to spend USDC...", request);
      // set approval
      const hash = await usdc.write.approve(request.args);
      await polygonClient.waitForTransactionReceipt({ hash });
      console.log("Approval transaction confirmed:", hash);
    } catch (error) {
      console.log("Error approving AllowanceHolder:", error);
    }
  } else {
    console.log("USDC already approved for AllowanceHolder");
  }
}
