import WalletsChecker from "../../lib/WalletsChecker";

export default async function handler(req, res) {
  await WalletsChecker.checkBlocks()
  res.status(200).json({ status: true })
}
