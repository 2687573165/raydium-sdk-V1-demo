import {
  PoolInfoLayout,
  SqrtPriceMath,
  Liquidity,
} from '@raydium-io/raydium-sdk';
import { PublicKey } from '@solana/web3.js';

import { connection } from '../config';

async function getClmmPoolInfo() {
  const id = new PublicKey('Rj3bJwmPeQs3v8ymCvVpjAtFo4izEGrJgoojhNvAXNg')

  const accountInfo = await connection.getAccountInfo(id)

  if (accountInfo === null) throw Error(' get pool info error ')

  // const { state: LiquidityStateLayout } = Liquidity.getLayouts(4);
  const poolData = PoolInfoLayout.decode(accountInfo.data)
  console.log(poolData)
  // console.log('current price -> ', SqrtPriceMath.sqrtPriceX64ToPrice(poolData.sqrtPriceX64, poolData.mintDecimalsA, poolData.mintDecimalsB))
}

getClmmPoolInfo()
