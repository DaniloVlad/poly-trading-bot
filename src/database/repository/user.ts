import { createEthKeypair } from "../../services/eth";
import { createSolanaKeypair } from "../../services/solana";
import { User } from "../models";

export async function getOrCreateUser(telegramId: number) {
  let user = await User.findOne({ where: { telegramId } });
  if (!user) {
    const solanaKeypair = await createSolanaKeypair();
    const ethKeypair = await createEthKeypair();
    if (!solanaKeypair || !ethKeypair) {
      throw new Error("Failed to create keypairs");
    }

    user = await User.create({
      telegramId,
      ethPrivateKey: ethKeypair.privateKey,
      ethAddress: ethKeypair.address,
      solPrivateKey: solanaKeypair.privateKey,
      solAddress: solanaKeypair.address,
    });
  }

  return user;
}
