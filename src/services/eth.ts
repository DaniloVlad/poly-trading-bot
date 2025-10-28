import { Wallet } from "@ethersproject/wallet";

export async function createEthKeypair() {
  try {
    const wallet = Wallet.createRandom();
    return {
      privateKey: wallet.privateKey,
      address: wallet.address,
    };
  } catch (error) {
    console.error("Error creating wallet:", error);
  }
}
