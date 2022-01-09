import Web3 from 'web3'
import fetch from 'isomorphic-unfetch'

const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_ID}`));
let hashes = []

const sleep = ms =>  new Promise((resolve) => setTimeout(resolve, ms))

class WalletsChecker {
  
  static async getAccounts() {
    const response = await fetch(process.env.WALLETS_URL)
    return await response.json()
  }

  static async checkBlocks() {
    const accounts = await WalletsChecker.getAccounts()
    const { number: endBlock } = await web3.eth.getBlock('latest')
    // 1 block at every ~15s, check 20 blocks every minute to make sure we don't miss any blocks
    // (cron running every 5 minutes) 
    const startBlock = endBlock - 25
    console.log(`check blocks: ${startBlock} to ${endBlock}`)
    for (let [name, account] of Object.entries(accounts)) {
      const response = await fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=${startBlock}&endblock=${endBlock}&sort=asc&apikey=${process.env.ETHERSCAN_KEY}`)
      const data = await response.json()
      const { result: transactions } = data
      for (let tx of transactions) {
        console.log('tx: ', name, tx.hash)
        if (!hashes.includes(tx.hash)) {
          await WalletsChecker.sendDiscordMessage(`Hey @everyone! A new txn on ${name}'s wallet! https://etherscan.io/tx/${tx.hash} https://debank.com/profile/${account}/history`)
          console.log('name:', name, tx.hash)
          hashes.push(tx.hash)
        }
      }
      await sleep(250)
    }

    WalletsChecker.resetHashesArr()
  }

  static resetHashesArr() {
    if (hashes.length > 500) {
      hashes = []
    }
  }
  
  static async sendDiscordMessage(message) {
    await fetch(`https://discord.com/api/webhooks/${process.env.DISCORD_WEBHOOK}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username:'Wallet Tracker',
        content: message
      })
    })
  }
}

export default WalletsChecker
