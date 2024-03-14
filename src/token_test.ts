import { Connection, clusterApiUrl } from '@solana/web3.js';

// 创建与 Solana 网络的连接
const connection: Connection = new Connection('https://solana-mainnet-archive.allthatnode.com/NsTVN0SB8i8SX4kwS4bVtnDOv5PnYmpj');;

// 指定你想要获取的区块的编号
const blockNumber: number = 238341790;

// 获取区块信息
async function getBlockInfo(blockNumber: number) {
  const blockConfig = {
  
    maxSupportedTransactionVersion: 0
  }
  try {
    // const block = await connection.getBlock(blockNumber,blockConfig);
 
    // console.log('Block Info:', block?.transactions[0].transaction.message.compiledInstructions);

    const Txdata = await connection.getTransaction('26XfpL6B5atx5RR6hqWTXjb5TxPNyFBVXzVqK5NU2GGWhhn4ztPwti4HLse7x6Y5DfTbEuYcmzdurAnitGeWbTq3',blockConfig)

  } catch (error) {
    console.error('Error fetching block:', error);
  }
}

// 调用函数获取区块信息
getBlockInfo(blockNumber);
