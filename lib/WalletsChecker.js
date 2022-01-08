import Web3 from 'web3'
import fetch from 'isomorphic-unfetch'

class WalletsChecker {
    web3;
    accounts=[];

    constructor(projectId, accounts) {
        this.web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${projectId}`));
        this.accounts = accounts
    }
    
    async checkBlocks() {
      const latestBlock = await this.web3.eth.getBlock('latest');
      // 1 block at every ~15s, check 5 blocks every minute to make sure we don't miss any blocks
      // (cron running every minute) 
      const blockEnd = latestBlock.number
      const blockStart = blockEnd - 5 
      
      for (let i = blockStart; i<=blockEnd; i++) {
        console.log('Searching block ' + i);
        const block = await this.web3.eth.getBlock(i);
        if (block != null && block.transactions != null) {
            for (let txHash of block.transactions) {
              const tx = await this.web3.eth.getTransaction(txHash);
              if (!tx.to) continue
                
              for (let [name, account] of Object.entries(this.accounts)) {
                if (account.toLowerCase() === tx?.to.toLowerCase() || account.toLowerCase() === tx.from.toLowerCase()) {
                  await this.sendDiscordMessage(`Hey @everyone! A new txn on ${name}'s wallet! https://etherscan.io/tx/${tx.hash}`)
                  console.log('name:', name, tx.hash)
              }
            } 
          }
        }
      }
    }

    async sendDiscordMessage(message) {
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
