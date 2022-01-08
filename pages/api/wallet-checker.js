import WalletsChecker from "../../lib/WalletsChecker";
import accounts from '../../lib/walets.json'

export default async function handler(req, res) {
  let txChecker = new WalletsChecker(process.env.INFURA_ID, accounts);
  await txChecker.checkBlocks()
  res.status(200).json({ status: true })
}
