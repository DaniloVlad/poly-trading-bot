// ts-ignore
import { Wallet } from "@ethersproject/wallet";
import { ClobClient } from "@polymarket/clob-client";
import {
  POLYMARKET_FUNDER_ADDRESS,
  POLYMARKET_PRIVATE_KEY,
} from "../utils/constants";
import { logger } from "../utils/logger";

const host = "https://clob.polymarket.com";
const funder = POLYMARKET_FUNDER_ADDRESS; //This is the address listed below your profile picture when using the Polymarket site.
const signer = new Wallet(POLYMARKET_PRIVATE_KEY); //This is your Private Key. If using email login export from https://reveal.magic.link/polymarket otherwise export from your Web3 Application

console.log(`Signer Address: ${signer.address}`);

export let clobClient: ClobClient;

export const getClobClient = async () => {
  if (!clobClient) {
    const creds = await new ClobClient(
      host,
      137,
      signer
    ).createOrDeriveApiKey();
    logger.info(`ClobClient API Key: ${creds.key}`);
    clobClient = new ClobClient(host, 137, signer, creds, 0, funder);
  }
  return clobClient;
};

export async function getOpenOrders() {
  try {
    const client = await getClobClient();
    const orders = await client.getOpenOrders();
    logger.info(`Fetched ${orders.length} open orders.`);
    return orders;
  } catch (error) {
    logger.error(`Error fetching open orders: ${error}`);
    throw error;
  }
}
