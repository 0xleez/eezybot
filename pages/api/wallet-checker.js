import WalletChecker from "../../lib/WalletsChecker";

export default async function handler(req, res) {
  await WalletChecker.checkBlocks()
  res.status(200).json({ status: true })
}
