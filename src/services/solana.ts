import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

export async function createSolanaKeypair() {
  try {
    const keypair = new Keypair();
    return {
      address: keypair.publicKey.toBase58(),
      privateKey: bs58.encode(keypair.secretKey),
    };
  } catch (error) {
    console.error("Error creating Solana keypair:", error);
  }
}
