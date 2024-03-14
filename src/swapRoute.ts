import BN from 'bn.js';

import {
  Clmm,
  ApiClmmPoolsItem,
  ApiPoolInfo,
  Currency,
  CurrencyAmount,
  ENDPOINT,
  fetchMultipleMintInfos,
  Percent,
  Token,
  TokenAmount,
  TradeV2,
} from '@raydium-io/raydium-sdk';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import {
  Keypair,
  PublicKey,
} from '@solana/web3.js';

import {
  connection,
  DEFAULT_TOKEN,
  makeTxVersion,
  PROGRAMIDS,
  RAYDIUM_MAINNET_API,
  wallet,
} from '../config';
import {
  buildAndSendTx,
  getWalletTokenAccount,
} from './util';

type WalletTokenAccounts = Awaited<ReturnType<typeof getWalletTokenAccount>>
type TestTxInputInfo = {
  inputToken: Token | Currency
  outputToken: Token | Currency
  inputTokenAmount: TokenAmount | CurrencyAmount
  slippage: Percent
  walletTokenAccounts: WalletTokenAccounts
  wallet: Keypair

  feeConfig?: {
    feeBps: BN,
    feeAccount: PublicKey
  }
}

/**
 * pre-action: fetch Clmm pools info and ammV2 pools info
 * step 1: get all route
 * step 2: fetch tick array and pool info
 * step 3: calculation result of all route
 * step 4: create instructions by SDK function
 * step 5: compose instructions to several transactions
 * step 6: send transactions
 */
async function routeSwap(input: TestTxInputInfo) {
  // -------- pre-action: fetch Clmm pools info and ammV2 pools info --------
  const clmmPools: ApiClmmPoolsItem[] = [{"id":"HNeta6oxYy6DHT5gwEBFbxNeAj7U3wutUWzZtcjc2W17",
  "mintProgramIdA":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "mintProgramIdB":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "mintA":"So11111111111111111111111111111111111111112",
  "mintB":"BgNSCjWzeruX7wcDxedh5Q8Z9dw8CRLJJvyZwtD2XHji",
  "vaultA":"AYUtAjiHPV8nKN2SWNfhCGFAHnPELncMgZV4GbD1T5W9",
  "vaultB":"BoUeV5ZWwtvn4nCJ3fLX171DMA5twbb1UBnczRnMqYxt",
  "mintDecimalsA":9,
  "mintDecimalsB":9,
  "ammConfig":{"id":"E64NGkDLLCdQ2yFNPcavaKptrEgmiQaNykUuLC1Qgwyp",
  "index":1,
  "protocolFeeRate":0,
  "tradeFeeRate":0,
  "tickSpacing":60,
  "fundFeeRate":0,
  "fundOwner":"FundHfY8oo8J9KYGyfXFFuQCHe7Z1VBNmsj84eMcdYs4",
  "description":"Best for most pairs"},
  "rewardInfos":[],
  "tvl":0,
  "day":{"volume":0,"volumeFee":0,"feeA":0,"feeB":0,"feeApr":0,"rewardApr":{"A":0,"B":0,"C":0},"apr":0,"priceMin":0,"priceMax":0},
  "week":{"volume":0,"volumeFee":0,"feeA":0,"feeB":0,"feeApr":0,"rewardApr":{"A":0,"B":0,"C":0},"apr":0,"priceMin":0,"priceMax":0},
  "month":{"volume":0,"volumeFee":0,"feeA":0,"feeB":0,"feeApr":0,"rewardApr":{"A":0,"B":0,"C":0},"apr":0,"priceMin":0,"priceMax":0},
  "lookupTableAccount":"BWiG4jvKLJrhka8UF4fNqRgLUfVZhkHaqA4aAdAAVV5B"}] // If the clmm pool is not required for routing, then this variable can be configured as undefined
 
  const clmmList = Object.values(
    await Clmm.fetchMultiplePoolInfos({ connection, poolKeys: clmmPools, chainTime: new Date().getTime() / 1000 })
  ).map((i) => i.state)
  console.log(clmmList)
  // const sPool: ApiPoolInfo = await (await fetch(ENDPOINT + RAYDIUM_MAINNET_API.poolInfo)).json() // If the Liquidity pool is not required for routing, then this variable can be configured as undefined


  // -------- step 1: get all route --------
  const getRoute = TradeV2.getAllRoute({
    inputMint: input.inputToken instanceof Token ? input.inputToken.mint : PublicKey.default,
    outputMint: input.outputToken instanceof Token ? input.outputToken.mint : PublicKey.default,
    // apiPoolList: sPool,
    clmmList,
  })

  // -------- step 2: fetch tick array and pool info --------
  const [tickCache, poolInfosCache] = await Promise.all([
    await Clmm.fetchMultiplePoolTickArrays({ connection, poolKeys: getRoute.needTickArray, batchRequest: true }),
    await TradeV2.fetchMultipleInfo({ connection, pools: getRoute.needSimulate, batchRequest: true }),
  ])
 
// console.log(tickCache)
  // -------- step 3: calculation result of all route --------
  const [routeInfo] = TradeV2.getAllRouteComputeAmountOut({
    directPath: getRoute.directPath,
    routePathDict: getRoute.routePathDict,
    simulateCache: poolInfosCache,
    tickCache,
    inputTokenAmount: input.inputTokenAmount,
    outputToken: input.outputToken,
    slippage: input.slippage,
    chainTime: new Date().getTime() / 1000, // this chain time

    feeConfig: input.feeConfig,

    mintInfos: await fetchMultipleMintInfos({connection, mints: [
      ...clmmPools.map(i => [{mint: i.mintA, program: i.mintProgramIdA}, {mint: i.mintB, program: i.mintProgramIdB}]).flat().filter(i => i.program === TOKEN_2022_PROGRAM_ID.toString()).map(i => new PublicKey(i.mint)),
    ]}),

    epochInfo: await connection.getEpochInfo(),
  })
  // console.log(routeInfo)
  // -------- step 4: create instructions by SDK function --------



  const { innerTransactions } = await TradeV2.makeSwapInstructionSimple({
    routeProgram: PROGRAMIDS.Router,
    connection,
    swapInfo: routeInfo,
    ownerInfo: {
      wallet: input.wallet.publicKey,
      tokenAccounts: input.walletTokenAccounts,
      associatedOnly: true,
      checkCreateATAOwner: true,
    },
    
    computeBudgetConfig: { // if you want add compute instruction
      units: 400000, // compute instruction
      microLamports: 1, // fee add 1 * 400000 / 10 ** 9 SOL
    },
    makeTxVersion,
  })
 
  console.log(innerTransactions[0].instructions)
  return { txids: await buildAndSendTx(innerTransactions) }
}

async function howToUse() {
  // sol -> new Currency(9, 'SOL', 'SOL')
  const outputToken = DEFAULT_TOKEN.gptx // USDC
  // const inputToken = DEFAULT_TOKEN.WSOL // RAY
  const inputToken = new Currency(9, 'SOL', 'SOL')

  const inputTokenAmount = new (inputToken instanceof Token ? TokenAmount : CurrencyAmount)(inputToken, 100)
  // console.log(inputTokenAmount)
  const slippage = new Percent(1, 100)
  const walletTokenAccounts = await getWalletTokenAccount(connection, wallet.publicKey)
  // console.log(wallet.publicKey.toBase58())
  routeSwap({
    inputToken,
    outputToken,
    inputTokenAmount,
    slippage,
    walletTokenAccounts,
    wallet,

    // feeConfig: {
    //   feeBps: new BN(25),
    //   feeAccount: Keypair.generate().publicKey // test
    // }
  }).then(({ txids }) => {
    /** continue with txids */
    console.log('txids', txids)
  })
}

howToUse()
