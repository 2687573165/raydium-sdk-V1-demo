

import bs58 from "bs58";
import { InnerSimpleV0Transaction,Liquidity , Market, Percent, Token, TokenAmount,CurrencyAmount,TokenAccount,SPL_ACCOUNT_LAYOUT,LiquidityPoolKeys, publicKey} from "@raydium-io/raydium-sdk";
import {
  makeTxVersion,
} from '../config';
import {
  buildAndSendTx,
} from './util';
import {TransactionMessage,VersionedTransaction, Connection, clusterApiUrl, Logs, Context ,PublicKey,Keypair,Transaction,Signer,PublicKeyInitData,SystemProgram,TransactionInstruction,ComputeBudgetProgram} from '@solana/web3.js';
import { AnchorProvider } from "@coral-xyz/anchor";
import { DecimalUtil, Percentage } from "@orca-so/common-sdk";
import {
  WhirlpoolContext, buildWhirlpoolClient, 
  PDAUtil, swapQuoteByInputToken, IGNORE_CACHE
} from "@orca-so/whirlpools-sdk";
import Decimal from "decimal.js";
import * as anchor from '@project-serum/anchor';
import  {searcher,bundle} from 'jito-ts';
import express, { Request, Response } from 'express';
import cors  from 'cors';
import axios from 'axios';

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const LP_MINT_ASSOCIATED_SEED = Buffer.from("lp_mint_associated_seed", 'utf-8'); 
const AMM_ASSOCIATED_SEED =  Buffer.from("amm_associated_seed", 'utf-8'); 
const PC_VAULT_ASSOCIATED_SEED= Buffer.from("pc_vault_associated_seed", 'utf-8'); 
const COIN_VAULT_ASSOCIATED_SEED= Buffer.from("coin_vault_associated_seed", 'utf-8'); 
const OPEN_ORDER_ASSOCIATED_SEED =  Buffer.from("open_order_associated_seed", 'utf-8'); 
const TARGET_ASSOCIATED_SEED=Buffer.from("target_associated_seed"); 

const  Raydium_PId = new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8")
const OpenBook_PID = new PublicKey("srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX")
// const connection: Connection =new Connection("https://mainnet.helius-rpc.com/?api-key=f3112d20-201b-4377-bde3-6d7222a2057c", 'confirmed');
const connection: Connection =new Connection("https://api.devnet.solana.com", 'confirmed');
const Ankr_connection: Connection = new Connection( 'https://rpc.ankr.com/solana/8eeea1727223c7cfa93a7ec0f4bdeac5e009b47a365e89b759c852fec72d4180', 'confirmed');
let TokenMap: Map<string, boolean> = new Map();
TokenMap.set("So11111111111111111111111111111111111111112",true)
TokenMap.set("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",true)


const Mysecretkey = bs58.decode("hDwP6axbYSQEvSwA7V7t1LP5QJEDAq6LVffXHEaGTWNZhz7uzXqeN7pvj5RSDwnPLmhrUzg1rPeSPbnPXzuqyQb");
const MyownerKeypair = Keypair.fromSecretKey(Mysecretkey);

const app = express();
// 配置CORS中间件
app.use(cors());
const port = 8876;

// 跑延迟时间
let stoptime:string | undefined
// 跑订单数
let txlimt :string | undefined
// 池子地址
let _Pool :string
// // 跑状态
let PaoType :boolean;
// 监听状态
let JTType :boolean;
// 市场id
let MarketId :PublicKey | undefined
// 监听token
let Target_token :PublicKey | undefined
// 开盘时间
let OpenTime :Number| undefined
// 状态信息
let Type_Msg :string|undefined
// 加池hax
let  AddPool_hax :string
// 初始化市场hax
let  Market_hax :string
// 购买金额
let Amount :string|undefined
// 捆绑金额
let Binding_Amount :string|undefined
// 捆绑 信息
let Binding_msg :string

let TipAccount : PublicKey

let My_new_hax:any
let Raydium_inst: {
  address: {};
  innerTransactions: InnerSimpleV0Transaction[];
}

let Hash_info: Readonly<{
  blockhash: string;
  lastValidBlockHeight: number;
}>
// mev rpc
const enginesecretkey = bs58.decode("3TmA3659qeYRJdKBmjKfTMnxTcAedBCAonSwe7WP7S12bjVeaSYgT9sNm6XF3d7k3cMkpHh2vBxVUiky3XbSLky6");
const engineownerKeypair = Keypair.fromSecretKey(enginesecretkey);
const blockNodes = [
  // searcher.searcherClient('amsterdam.mainnet.block-engine.jito.wtf',engineownerKeypair),
  // searcher.searcherClient('frankfurt.mainnet.block-engine.jito.wtf',engineownerKeypair),
  searcher.searcherClient('ny.mainnet.block-engine.jito.wtf',engineownerKeypair),
  // searcher.searcherClient('tokyo.mainnet.block-engine.jito.wtf',engineownerKeypair),
      ]


// rpc
const rpcNodes = [
  // 'https://solana-mainnet.core.chainstack.com/da98ce20d4f577fde35b5435a59ea2e5',
  //  'https://api.mainnet-beta.solana.com', 
  // new Connection( 'https://solana-mainnet.core.chainstack.com/da98ce20d4f577fde35b5435a59ea2e5', 'confirmed'),
  // new Connection( 'https://api.mainnet-beta.solana.com', 'confirmed'),
  new Connection( 'https://mainnet.helius-rpc.com/?api-key=f3112d20-201b-4377-bde3-6d7222a2057c', 'confirmed'),
   new Connection( 'https://responsive-wandering-meme.solana-mainnet.quiknode.pro/46e39652fff5a03b2c66d58430b08111941ac9f2/', 'confirmed'),
   new Connection( 'https://rpc.ankr.com/solana/8eeea1727223c7cfa93a7ec0f4bdeac5e009b47a365e89b759c852fec72d4180', 'confirmed'),
  //  new Connection("https://solana-mainnet-archive.allthatnode.com/NsTVN0SB8i8SX4kwS4bVtnDOv5PnYmpj", 'confirmed'),
  // new Connection("https://frankfurt.mainnet.rpc.jito.wtf/?access-token=07340e8b-3f24-4757-956a-2b7a14bcf541",'confirmed'),
  new Connection("https://solana-mainnet.g.alchemy.com/v2/0ubZSQwYePcyB2-z_O80DgVyZhRFznby",'confirmed'),
  // new Connection( 'http://3.67.75.15:54832/', 'confirmed'),
   new Connection( 'https://solana-mainnet.core.chainstack.com/da98ce20d4f577fde35b5435a59ea2e5', 'confirmed'),
  ]; // RPC节点地址列表
  

async function Swap(pool:string) {
  // Create WhirlpoolClient
  const provider = AnchorProvider.env();
  const ORCA_WHIRLPOOL_PROGRAM_ID = new PublicKey("whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc");
  const ctx = WhirlpoolContext.withProvider(provider, ORCA_WHIRLPOOL_PROGRAM_ID);
  const client = buildWhirlpoolClient(ctx);

  console.log("endpoint:", ctx.connection.rpcEndpoint);
  console.log("wallet pubkey:", ctx.wallet.publicKey.toBase58());


  const fromToken = {mint: new PublicKey("BgNSCjWzeruX7wcDxedh5Q8Z9dw8CRLJJvyZwtD2XHji"), decimals: 9};
  const toToken = {mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), decimals: 6};




  const whirlpool_pubkey = new PublicKey(pool)
  const whirlpool = await client.getPool(whirlpool_pubkey);
  
  const amount_in = new Decimal("50" /* devUSDC */);

  // // Obtain swap estimation (run simulation)
  const quote = await swapQuoteByInputToken(
    whirlpool,
    // Input token and amount
    fromToken.mint,
    DecimalUtil.toBN(amount_in, fromToken.decimals),
    // Acceptable slippage (10/1000 = 1%)
    Percentage.fromFraction(10, 1000),
    ctx.program.programId,
    ctx.fetcher,
    IGNORE_CACHE,
  );

  // // Output the estimation
  console.log("estimatedAmountIn:", DecimalUtil.fromBN(quote.estimatedAmountIn, fromToken.decimals).toString(), "fromToken");
  console.log("estimatedAmountOut:", DecimalUtil.fromBN(quote.estimatedAmountOut, toToken.decimals).toString(), "toToken");
  console.log("otherAmountThreshold:", DecimalUtil.fromBN(quote.otherAmountThreshold, toToken.decimals).toString(), "toToken");

  // // Send the transaction
  const tx = await whirlpool.swap(quote);
  // tx.build
  const signature = await tx.buildAndExecute();
  console.log("signature:", signature);

  // // Wait for the transaction to complete
  // const latest_blockhash = await ctx.connection.getLatestBlockhash();
  // await ctx.connection.confirmTransaction({signature, ...latest_blockhash}, "confirmed");
}

// 正则匹配OpenBook                                                   
function containsDynamicPattern(str: string): boolean {
  const pattern = /Program srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX consumed \d+ of \d+ compute units/;
  return pattern.test(str);
}

// 日志订阅
async function Block_Logs(url:string,programId:PublicKey) {
  // console.log(programId.toBase58())
  const Logsconnection: Connection = new Connection(url, 'confirmed');

  const programIds = [
    // new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'), // orca
    // new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'), // Raydium

    // new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX'), // OpenBook
    
    // 添加更多程序ID...
  ];
  // const subscriptionIds =  programIds.map(programId => 
    Logsconnection.onLogs(programId, async (logs, context) => {
           
          if(logs.err == null){
            // console.log(logs.err)
            let OpenBookLET = 0
            for (let index = 0; index < logs.logs.length; index++) {
              const element = logs.logs[index];
              // console.log(element)
              //raydium
              if( programId.toBase58() == "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"){
                // console.log("Raydium  signature")
                // if (JTType == false){
                //   console.log("关闭Raydium监听")
                //   await Logsconnection.removeOnLogsListener(0);
                //   return
                // }
              if(element.includes("initialize2: InitializeInstruction2")){
                // console.log(`New logs for program ${programId.toBase58()}:`);
                // console.log('Block:', context.slot);
                // console.log('Logs:', logs.logs);
                       // 获取当前时间的时间戳（毫秒）
                const timestampInMilliseconds = Date.now();
  
                // 将毫秒时间戳转换为秒
                const timestampInSeconds = Math.floor(timestampInMilliseconds / 1000);
  
                // 打印时间戳
      
                console.log('Raydium  signature:', logs.signature,"time:",timestampInSeconds,"url:",url);
                let data = await GetTransaction(logs.signature,Raydium_PId)
                if (data.type || JTType == false){
                  console.log("关闭Raydium监听")
                  await Logsconnection.removeOnLogsListener(0);
                  return
                }
              }
            }
                 // orca
            if( programId.toBase58() == "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"){
              console.log("orca signature")
              if(element == "Program log: Instruction: InitializePool"){
                // console.log(`New logs for program ${programId.toBase58()}:`);
                // console.log('Block:', context.slot);
                // console.log('Logs:', logs.logs);
                console.log('orca signature:', logs.signature);
                let data = await GetTransaction(logs.signature,programId)
                }
              }
              //OpenBook
              if( programId.toBase58() == "srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX" && logs.logs.length == 13){
                // console.log("OpenBook signature")
                console.log('OpenBook signature:', logs.signature);
                if(element.includes("Program 11111111111111111111111111111111")){
                  OpenBookLET += 1
                }
                if( containsDynamicPattern(element) && OpenBookLET == 10){
                  
                  console.log('OpenBook signature:', logs.signature);
                  let data = await GetTransaction(logs.signature,OpenBook_PID)

                  if (data.type  || PaoType == false){
                    console.log("关闭OpenBook监听")
                    await Logsconnection.removeOnLogsListener(0);
                    return
                  }
                }
              }
            }
          }

  
    })
  // );

}

// jito订阅
async function jito_block(nodes:searcher.SearcherClient,programId: PublicKey) {
  const onBundleResult =  nodes.onBundleResult(
    result => {

      let data = result.rejected
      if(data != undefined ){
        if(data.simulationFailure != undefined && data.simulationFailure.msg != undefined){
          Binding_msg = data.simulationFailure.msg
          console.log('received bundle data:', result);
        }
        // console.log('received bundle data:', result);
        // onBundleResult()
      }
    },
    e => {
      console.log("onBundleResult",e)
      // throw e;
    }
  );
  let cli =  nodes
  // let accounts :PublicKey[] = []
  let regions :string[]=[];
  // accounts.push(new PublicKey("5XRMqyBbF9k6wXSpRa7k8HmPozqwizv3Du9nXqUYyMb5"))


  const _tipAccount = (await cli.getTipAccounts())[0];
  console.log('tip account:', _tipAccount);
   TipAccount = new PublicKey(_tipAccount);

  let Programs :PublicKey[] = []
  Programs.push(programId)

    cli.onProgramUpdate(  Programs,
      regions,
      async (transactions: VersionedTransaction[]) => {
        // console.log(`received ${transactions.length} transactions`,);
      
        for (let index = 0; index < transactions.length; index++) {
          // console.log("version",transactions[index].version)
          // 获取交易哈希（第一个签名）
          let transactionHash = transactions[index].signatures[0];
          
          // 将 Uint8Array 转换为 Base58 字符串
          let transactionHashBase58 = bs58.encode(transactionHash);
  
          let Signer:PublicKey| undefined
          if(transactions[index].version == 0){
  
            Signer = transactions[index].message.staticAccountKeys[0]
            let staticAccountKeys = transactions[index].message.staticAccountKeys
            let Instructions =  transactions[index].message.compiledInstructions
  
            for (let ind = 0; ind < Instructions.length; ind++) {
              const element = Instructions[ind];
            // console.log(element.accountKeyIndexes);
            // 加池子 Raydium_PId
              if(element.accountKeyIndexes.length == 21 && programId.toBase58() == Raydium_PId.toBase58()){
                let pool = staticAccountKeys[element.accountKeyIndexes[4]]||null
                if(pool!= null){
                  console.log("Transaction Hash:", transactionHashBase58,pool.toBase58());
                  // let tokenA =  staticAccountKeys[element.accountKeyIndexes[8]].toBase58()
                  //  let tokenB = staticAccountKeys[element.accountKeyIndexes[9]].toBase58()
                  // if(JTType == false){
                  //   console.log("关闭jito订阅")
                  //   return
                  // }
                  if(pool.toBase58() == _Pool){ 
                      JTType = true
                      try {
                        if (MarketId  != undefined){
                          console.log("监听开始发单"); 
                            // 假设你有适当的参数传递给这些函数
                            const result = await Promise.all([
                              Build_bundle(  Raydium_inst.innerTransactions[0].instructions,cli,transactions[index],5,MyownerKeypair,TipAccount,parseInt(Binding_Amount||"0")),
                              raydiumSwapPao(MarketId,false,0,10)
                            ]);
                        }else{
                          console.log("MarketId为空监听不发单"); 
                        }
                     
                        // result[0] 是 raydiumSwapPao 的结果
                        // result[1] 是 Build_bundle 的结果
                        // console.log('raydiumSwapPao result:', result[0]);
                        // console.log('Build_bundle result:', result[1]);
                        return
                    } catch (error) {
                        // 如果任何一个函数失败
                        console.error('An error occurred:', error);
                    }
                 
                    return
                  }
                }
  
                // console.log("Transaction Hash:", transactionHashBase58);
   
              } 
            }
          }else{
            Signer = transactions[index].message.getAccountKeys().get(0)
     
          }
  
          // 发单测试
          if(Signer?.toBase58() == new PublicKey("5XRMqyBbF9k6wXSpRa7k8HmPozqwizv3Du9nXqUYyMb5").toBase58()){
  
  
            // let data = await Build_bundle(cli,transactions[index],5,MyownerKeypair,TipAccount)
            // console.log(data,nodes)
        
          }
          
         
          
        }
       
        // let transactionHash = transactions[0].signatures[0];
  
        // // 将 Uint8Array 转换为 Base58 字符串
        // let transactionHashBase58 = bs58.encode(transactionHash);
  
        // console.log("Transaction Hash:", transactionHashBase58);
      
      },
      (e: Error) => {
        console.log("onProgramUpdate",e)
        // throw e;
      }
      );
  



  // cli.onAccountUpdate(
  //     accounts,
  //     regions,
  //     async (transactions: VersionedTransaction[]) => {
  //       console.log(`received ${transactions.length} transactions`);
  
         
 
  //               // 获取交易哈希（第一个签名）
  //         let transactionHash = transactions[0].signatures[0];

  //         // 将 Uint8Array 转换为 Base58 字符串
  //         let transactionHashBase58 = bs58.encode(transactionHash);

  //         console.log("Transaction Hash:", transactionHashBase58);
  //     },
  //     (e: Error) => {
  //       throw e;
  //     }
  //   );
}


// RPC 订阅选择
async function RuncompareRpcNodes(programId:PublicKey,jito_type:boolean) {


  const rpcUrls = [
    // "https://solana-mainnet.core.chainstack.com/ws/da98ce20d4f577fde35b5435a59ea2e5",
    // "https://responsive-wandering-meme.solana-mainnet.quiknode.pro/46e39652fff5a03b2c66d58430b08111941ac9f2/",
    // "https://api.mainnet-beta.solana.com",
    "https://rpc.ankr.com/solana/ws/8eeea1727223c7cfa93a7ec0f4bdeac5e009b47a365e89b759c852fec72d4180"
    // 其他 RPC URLs
  ];

  if(jito_type){
    console.log("开始jito订阅")
    const results = await Promise.all(blockNodes.map(url => jito_block(url,programId))); 
  }else{
    console.log("开始Block_Logs订阅")
    const results = await Promise.all(rpcUrls.map(url => Block_Logs(url,programId)));
  }   
  
  

  



}



// 账户订阅测试
async function test22():Promise<VersionedTransaction> {
  Hash_info = (await connection.getLatestBlockhashAndContext()).value;
  // let co = new Connection("https://atlas-mainnet.helius-rpc.com?api-key=f3112d20-201b-4377-bde3-6d7222a2057c","processed")
  let co2 = new Connection( 'http://3.67.75.15:54832/', 'processed')
  // co.onAccountChange(new PublicKey("5XRMqyBbF9k6wXSpRa7k8HmPozqwizv3Du9nXqUYyMb5"), async (logs, context) => {
    // console.log(logs.data)

        const auxiliaryInstruction = SystemProgram.transfer({
          fromPubkey: MyownerKeypair.publicKey,
          toPubkey: MyownerKeypair.publicKey,
          lamports: 1000 // 使用最小金额（1 lamport）作为辅助操作
        });
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ 
          microLamports: 200000
        });        
        const instructions = [addPriorityFee,auxiliaryInstruction];
        const messageV0 = new TransactionMessage({
        payerKey: MyownerKeypair.publicKey,
        recentBlockhash: Hash_info.blockhash,
        instructions,
        }).compileToV0Message();
        const tx = new VersionedTransaction(messageV0);
        tx.sign([MyownerKeypair]);
        co2.sendRawTransaction(tx.serialize(), {
          skipPreflight: true,
        })
        return tx
        // const currentTimestamp = Date.now();
        // console.log(currentTimestamp)
        // // connection.sendRawTransaction(tx.serialize())
        // const promises = rpcNodes.map(node => node.sendRawTransaction(tx.serialize()));
        // const results = await Promise.all(promises);
        // console.log('所有节点的结果:', results);

    


    
    
  // },"processed")
}

// 处理交易
async function GetTransaction(tx:string,programId:PublicKey) {
   
    let data = {type:false}
    let Market: PublicKey | undefined
    let BaseMint: PublicKey | undefined
    let QuoteMint: PublicKey | undefined
    // InitializePool
   await  Ankr_connection.getTransaction(tx, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 })
      .then(async transactionInfo => {
        if (transactionInfo != null){
          console.log(tx)
          if ('instructions' in transactionInfo.transaction.message) {
            const getAccountKeys = transactionInfo.transaction.message.getAccountKeys()
            // console.log(getAccountKeys)
            let accounts = transactionInfo.transaction.message.instructions
            for (let index = 0; index < accounts.length; index++) {
              const element = accounts[index];
       
              if(element.accounts.length == 11 && programId.toBase58() == "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"){
                console.log(getAccountKeys.get(element.accounts[1])?.toBase58())
                console.log(getAccountKeys.get(element.accounts[2])?.toBase58())
                console.log(getAccountKeys.get(element.accounts[4])?.toBase58())
              }

              //OpenBook_PID
              if(element.accounts.length == 10 && programId.toBase58() == OpenBook_PID.toBase58()){
                Market  = getAccountKeys.get(element.accounts[0])
                BaseMint   = getAccountKeys.get(element.accounts[7])
                QuoteMint   = getAccountKeys.get(element.accounts[8])
                // console.log(BaseMint,QuoteMint)
              }
            }
          } else {
    
           let staticAccountKeys = transactionInfo.transaction.message.staticAccountKeys
           let Instructions =  transactionInfo.transaction.message.compiledInstructions
           
              for (let index = 0; index < Instructions.length; index++) {
                const element = Instructions[index];
             
              // console.log(element.accountKeyIndexes);
              // 加池子 Raydium_PId
                if(element.accountKeyIndexes.length == 21 && programId.toBase58() == Raydium_PId.toBase58()){
                  let pool = staticAccountKeys[element.accountKeyIndexes[4]].toBase58()                          
                  let tokenA =  staticAccountKeys[element.accountKeyIndexes[8]].toBase58()
                  let tokenB = staticAccountKeys[element.accountKeyIndexes[9]].toBase58()
                  console.log("pool",pool)
                  if(pool == _Pool){
                    // 记录hax
                    AddPool_hax = tx
                    // 停止跑
                    PaoType = false
                    // 获取池子信息
                    try{
                      const pool_keys = await fetchPoolKeys(Ankr_connection,new PublicKey(pool),4);
                      const poolKeys = pool_keys as unknown as LiquidityPoolKeys;
                      const poolInfo = await Liquidity.fetchInfo({connection:Ankr_connection,poolKeys})
                      // 判断池子开放时间是否大于当前时间戳
                      console.log("开放时间:",poolInfo.startTime.toString())
  
                      OpenTime =  poolInfo.startTime.toNumber() 
                      const targetTimestamp = poolInfo.startTime.toNumber() * 1000; // Convert to milliseconds
                      const currentTimestamp = Date.now();
  
                      if (currentTimestamp > targetTimestamp) {
                        Type_Msg = "已开盘"
                          console.log("当前时间戳大于");
                      } else {
                        const delay = (targetTimestamp - currentTimestamp) - 1000;
                        JTType = true
                        Type_Msg = "当前时间戳小于开盘 启动定时发单"
                        setTimeout(() => raydiumSwapPao(MarketId,false,10,10), delay);
                        console.log("当前时间戳小于 启动定时发单",delay);
                      }
                      data =  {type:true}
                    }catch (error){
                      console.log("错误重新获取",error,tx)
                      return await GetTransaction(tx,programId)
                    }
                   
     
                  }
            
                }
                // 初始化OpenBook
                if(element.accountKeyIndexes.length == 10 && programId.toBase58() == OpenBook_PID.toBase58()){
                   Market  = staticAccountKeys[element.accountKeyIndexes[0]]
                   BaseMint   = staticAccountKeys[element.accountKeyIndexes[7]]
                   QuoteMint   = staticAccountKeys[element.accountKeyIndexes[8]]
                  //  console.log(BaseMint,QuoteMint)
         
               
                }
                
              }
          } 



          if (BaseMint?.toBase58() == Target_token?.toBase58() || QuoteMint?.toBase58() == Target_token?.toBase58() ){
            if (Market !== undefined) {
              MarketId = Market
              //启动监听
              _Pool = (await computeAssociatedAddress(Raydium_PId,Market,AMM_ASSOCIATED_SEED,Raydium_PId)).toBase58()
              //mev 监听
              JTType = true
            //   RuncompareRpcNodes(Raydium_PId,true).catch(err => {
            //     console.error(err);
            // });
            // rpc_日志监听
            RuncompareRpcNodes(Raydium_PId,false).catch(err => {
              console.error(err);
          });

             Market_hax = tx 
             Type_Msg = "运行中"
              // 启动跑
              PaoType = true
              await raydium_instruct(Market)
              raydiumSwapPao(Market,true,parseInt(stoptime||"0"),parseInt(txlimt||"0"))
              // buildraydiumSwapPao(true,parseInt(stoptime||"0"),parseInt(txlimt||"0"))
              console.log("Market1:",Market,"_Pool:",_Pool)
            }
            data =  {type:true}
            return data
          }
        }else{
          console.log("交易获取为空重新获取",tx)
          return await GetTransaction(tx,programId)
        }

        // console.log(transactionInfo.transaction.message.compiledInstructions)
        // console.log(transactionInfo.transaction.message.addressTableLookups)

     
   
      })
      .catch(err => {
        console.error(err);
      });   

      return data
}

async function Build_bundle(instructions: TransactionInstruction[],cli: searcher.SearcherClient,tx: VersionedTransaction|undefined,bundleTransactionLimit:number, keypair: Keypair,tipAccount: PublicKey,Amount:number) {

  // let txdata = await test22()

    if(Amount != 0){
      let b 
      if(tx == undefined){
         b = new bundle.Bundle([], bundleTransactionLimit);

      }else{
         b = new bundle.Bundle([tx], bundleTransactionLimit);

      }
      
      let maybeBundle = b.addTransactions(
        // txdata
        // buildMemoTransaction(keypair, Hash_info.blockhash)
        buildSwap(instructions)
      );

      if ( maybeBundle instanceof Error) {
        throw maybeBundle;
      }
    
      maybeBundle = maybeBundle.addTipTx(
        keypair,
        Amount,
        tipAccount,
        Hash_info.blockhash
      );
  
      if ( maybeBundle instanceof Error) {
        throw maybeBundle;
      }
      console.log(maybeBundle)
      try {
        const resp = await cli.sendBundle(maybeBundle);
        console.log('resp:', resp);
      } catch (e) {
        console.error('error sending bundle:', e);
      }
      // const onBundleResult =  cli.onBundleResult(
      //   result => {
      //     console.log('received bundle result:', result);
      //     let data = result.rejected
      //     if(data != undefined ){
      //       console.log('received bundle data:', data);
      //       // onBundleResult()
      //     }
      //   },
      //   e => {
      //     throw e;
      //   }
      // );
    }
   
  // bundles.map(async b => {
  //   try {
  //     const resp = await c.sendBundle(b);
  //     console.log('resp:', resp);
  //   } catch (e) {
  //     console.error('error sending bundle:', e);
  //   }
  // });
}
const MEMO_PROGRAM_ID = 'Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo';

const buildMemoTransaction = (
  keypair: Keypair,
  recentBlockhash: string
): VersionedTransaction => {
  const ix = new TransactionInstruction({
    keys: [
      {
        pubkey: keypair.publicKey,
        isSigner: true,
        isWritable: true,
      },
    ],
    programId: new PublicKey(MEMO_PROGRAM_ID),
    data: Buffer.from('Jito Backrun'),
  });

  const instructions = [ix];

  const messageV0 = new TransactionMessage({
    payerKey: keypair.publicKey,
    recentBlockhash: recentBlockhash,
    instructions,
  }).compileToV0Message();

  const tx = new VersionedTransaction(messageV0);

  tx.sign([keypair]);

  return tx;
};



function buildSwap(instructions: TransactionInstruction[]) {
  // instructions[2].programId = new PublicKey("Ee6yU6Dk1SQmtcSsXkrf4X6BEykwEbrGgW1JtqpK1SF2")
  // const Data = Buffer.concat([
  //   Buffer.from("faaed4d92f54d4e780969800000000000100000000000000", "hex"), // 第一个字节可能是方法选择器，取决于您的Anchor程序
  // ]);
  // instructions[2].data = Data
  // console.log(instructions[2].data,Data)

  // let firstElement = instructions[2].keys.shift();
  // if(firstElement != undefined){
  //   instructions[2].keys.unshift(  {
  //     pubkey: new PublicKey("HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8"),
  //     isWritable: false,
  //     isSigner: false
  //   })
  //   instructions[2].keys.push(firstElement)
  // }
  console.log(instructions[2].keys)
  const messageV0 = new TransactionMessage({
    payerKey: MyownerKeypair.publicKey,
    recentBlockhash: Hash_info.blockhash,
    instructions,
  }).compileToV0Message();

  const tx = new VersionedTransaction(messageV0);

  tx.sign([MyownerKeypair]);

  return tx;

 
} 

async function getTokenAccountsByOwner(
    connection: Connection,
    owner: PublicKey,
  ) {
    const tokenResp = await connection.getTokenAccountsByOwner(
      owner,
      {
        programId: TOKEN_PROGRAM_ID
      },
    );
  
    const accounts: TokenAccount[] = [];
  
    for (const { pubkey, account, } of tokenResp.value) {
      accounts.push({
        
        programId:TOKEN_PROGRAM_ID,
        pubkey,
        accountInfo:SPL_ACCOUNT_LAYOUT.decode(account.data)
      });
    }
  
    return accounts;
  }

async function get_token_amount(poolId:string, buying:boolean){

    try{
        

        const rpc_url = "https://api.mainnet-beta.solana.com";


        const version :  4 | 5 = 4


        const connection = new Connection(rpc_url); 

        const account = await connection.getAccountInfo(new PublicKey(poolId));
        const { state: LiquidityStateLayout }  = Liquidity.getLayouts(version)
      
        //@ts-ignore
        const fields = LiquidityStateLayout.decode(account?.data);

        const { status, baseMint, quoteMint, lpMint, openOrders, targetOrders, baseVault, quoteVault, marketId, baseDecimal, quoteDecimal, } = fields;
        
        var is_valid:boolean = false;

        [quoteMint,baseMint,lpMint].forEach((e)=>{
            if (e.toBase58() != '11111111111111111111111111111111'){
                is_valid = true;
            }
        })
        if (!is_valid){return -1}
        
        //fetching token data
        const secretkey = bs58.decode("hDwP6axbYSQEvSwA7V7t1LP5QJEDAq6LVffXHEaGTWNZhz7uzXqeN7pvj5RSDwnPLmhrUzg1rPeSPbnPXzuqyQb");
        const ownerKeypair = Keypair.fromSecretKey(secretkey);

        const owner_address = ownerKeypair.publicKey;

        
        const tokenAddress = buying?quoteMint:baseMint

        //console.log(tokenAddress.toBase58());

        const bal = await connection.getBalance(new PublicKey(owner_address.toBase58()));

        if (bal < 0.01){
            return -2
        }
        
        if (tokenAddress.toBase58() == 'So11111111111111111111111111111111111111112'){
            return (bal / 1000000000) - 0.0099 
        }else{

            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner_address, { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')});
        
            for (var cand in tokenAccounts.value){
                if (tokenAccounts.value[cand].account.data.parsed.info.mint === tokenAddress.toBase58()){
                    const tokenAccount = tokenAccounts.value[cand];
                    const tokenBalance:number = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
                    return tokenBalance
                }
            }
            return 0

        }

    }catch(e){
        console.log(e)
        return -1
    }

}

// 读取池子信息 
async function fetchPoolKeys(
    connection: Connection,
    poolId: PublicKey,
    version :  4 | 5 = 4
  ) {
  
    const serumVersion = 10
    const marketVersion:3 = 3
  
    // const programId = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');
    // const programId = new PublicKey('ChzxeEKAvFWcV7evQ7Zp3jig2xCMJDyZYQLUdYmbVwJz');
    const programId = new PublicKey('HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8');
  

    // const serumProgramId = new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX')
    const serumProgramId = new PublicKey('EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj')
 
    const account = await connection.getAccountInfo(poolId)

    const { state: LiquidityStateLayout }  = Liquidity.getLayouts(version)
  
    //@ts-ignore
    const fields = LiquidityStateLayout.decode(account?.data);
    const { status, baseMint, quoteMint, lpMint, openOrders, targetOrders, baseVault, quoteVault, marketId, baseDecimal, quoteDecimal, } = fields;

    let withdrawQueue, lpVault;
    if (Liquidity.isV4(fields)) {
      withdrawQueue = fields.withdrawQueue;
      lpVault = fields.lpVault;
    } else {
      withdrawQueue = PublicKey.default;
      lpVault = PublicKey.default;
    }
    
    // uninitialized
    // if (status.isZero()) {
    //   return ;
    // }
  
    const associatedPoolKeys = Liquidity.getAssociatedPoolKeys({
      version:version,
      marketVersion,
      marketId,
      baseMint: baseMint,
      quoteMint:quoteMint,
      baseDecimals: baseDecimal.toNumber(),
      quoteDecimals: quoteDecimal.toNumber(),
      programId,
      marketProgramId:serumProgramId,
    });
  
    const poolKeys = {
      id: poolId,
      baseMint,
      quoteMint,
      lpMint,
      version,
      programId,
  
      authority: associatedPoolKeys.authority,
      openOrders,
      targetOrders,
      baseVault,
      quoteVault,
      withdrawQueue,
      lpVault,
      marketVersion: serumVersion,
      marketProgramId: serumProgramId,
      marketId,
      marketAuthority: associatedPoolKeys.marketAuthority,
    };

    let marketInfo = await connection.getAccountInfo(marketId);
    if(marketInfo == null){
      marketInfo = await connection.getAccountInfo(marketId);
    }
    const { state: MARKET_STATE_LAYOUT } = Market.getLayouts(marketVersion);
    //@ts-ignore
    const market = MARKET_STATE_LAYOUT.decode(marketInfo.data);
    // console.log(market)
    const {
      baseVault: marketBaseVault,
      quoteVault: marketQuoteVault,
      bids: marketBids,
      asks: marketAsks,
      eventQueue: marketEventQueue,
    } = market;
  
    // const poolKeys: LiquidityPoolKeys;
    return {
      ...poolKeys,
      ...{
        marketBaseVault,
        marketQuoteVault,
        marketBids,
        marketAsks,
        marketEventQueue,
      },
    };
  }
// 计算池子信息 
async function NEWfetchPoolKeys(
    connection: Connection,

    marketId:PublicKey,
    version :  4 | 5 = 4
  ) {
  
    const serumVersion = 10
    const marketVersion:3 = 3
  
    const programId = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');
    const serumProgramId = new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX');
    



    const lpMint = await computeAssociatedAddress(programId,marketId,LP_MINT_ASSOCIATED_SEED,programId)
    const openOrders = await computeAssociatedAddress(programId,marketId,OPEN_ORDER_ASSOCIATED_SEED,programId)
    const targetOrders = await computeAssociatedAddress(programId,marketId,TARGET_ASSOCIATED_SEED,programId)
    const baseVault = await computeAssociatedAddress(programId,marketId,COIN_VAULT_ASSOCIATED_SEED,programId)
    const quoteVault = await computeAssociatedAddress(programId,marketId,PC_VAULT_ASSOCIATED_SEED,programId)
    const poolId = await computeAssociatedAddress(programId,marketId,AMM_ASSOCIATED_SEED,programId)
    console.log("pool:",poolId)
    let withdrawQueue, lpVault = new PublicKey("11111111111111111111111111111111")
    // if (Liquidity.isV4(fields)) {
    //   withdrawQueue = fields.withdrawQueue;
    //   lpVault = fields.lpVault;
    // } else {
    //   withdrawQueue = PublicKey.default;
    //   lpVault = PublicKey.default;
    // }
    
   
    let marketInfo = await connection.getAccountInfo(marketId);
    if(marketInfo == null){
      marketInfo = await connection.getAccountInfo(marketId);
    }
    const { state: MARKET_STATE_LAYOUT } = Market.getLayouts(marketVersion);
    //@ts-ignore
    const market = MARKET_STATE_LAYOUT.decode(marketInfo.data);
  
    const {
      baseVault: marketBaseVault,
      quoteVault: marketQuoteVault,
      bids: marketBids,
      asks: marketAsks,
      eventQueue: marketEventQueue,
      baseMint:baseMint,
      quoteMint:quoteMint,
    } = market;
  
    const associatedPoolKeys = Liquidity.getAssociatedPoolKeys({
      version:version,
      marketVersion,
      marketId,
      baseMint: baseMint,
      quoteMint:quoteMint,
      baseDecimals: 9,
      quoteDecimals: 9,
      programId,
      marketProgramId:serumProgramId,
    });
  
    const poolKeys = {
      id: poolId,
      baseMint,
      quoteMint,
      lpMint,
      version,
      programId,
      
      authority: associatedPoolKeys.authority,
      openOrders,
      targetOrders,
      baseVault,
      quoteVault,
      withdrawQueue,
      lpVault,
      marketVersion: serumVersion,
      marketProgramId: serumProgramId,
      marketId,
      marketAuthority: associatedPoolKeys.marketAuthority,
    };

    // const poolKeys: LiquidityPoolKeys;
    return {
      ...poolKeys,
      ...{
        marketBaseVault,
        marketQuoteVault,
        marketBids,
        marketAsks,
        marketEventQueue,
      },
    };
  }


// raydium模拟
async function compute(
    connection: Connection, poolKeys: any,
    curr_in:PublicKey , curr_out:PublicKey, 
    amount_in:number, slip:number
    ){
    try{

        const poolInfo = await Liquidity.fetchInfo({connection,poolKeys})
        console.log("开放时间:",poolInfo.startTime.toString())
        //setting up decimals
        var in_decimal:number; 
        var out_decimal:number; 

        if(curr_in.toBase58() === poolKeys.baseMint.toBase58()){
            in_decimal = poolInfo.baseDecimals
            out_decimal = poolInfo.quoteDecimals
        }else{
            out_decimal = poolInfo.baseDecimals;
            in_decimal = poolInfo.quoteDecimals;
        }
    
        //priming and computing
        let tokenAmount = amount_in / Math.pow(10, in_decimal);

  
        if(tokenAmount == 0){
          tokenAmount = 1
        }
        console.log(tokenAmount)
        const amountIn = new TokenAmount(new  Token(TOKEN_PROGRAM_ID,curr_in, in_decimal),tokenAmount, false);

        const currencyOut = new Token(TOKEN_PROGRAM_ID ,curr_out, out_decimal);
      
        const slippage = new Percent(slip, 100)
      
        const {
            amountOut,
            minAmountOut,
            currentPrice,
            executionPrice,
            priceImpact,
            fee,
        } = Liquidity.computeAmountOut({ poolKeys, poolInfo, amountIn, currencyOut, slippage})
        
        return [
            amountOut,
            minAmountOut,
            currentPrice,
            executionPrice,
            priceImpact,
            fee,
            amountIn,
        ]

    }catch(e){
        console.log(e);
        return 1
    }  
}



async function raydiumSwap(pool:string,bool:boolean,amount_In:number) {
  Hash_info = (await connection.getLatestBlockhashAndContext()).value;
  console.log(pool,bool)
    let _amountIn = amount_In
    const secretkey = bs58.decode("hDwP6axbYSQEvSwA7V7t1LP5QJEDAq6LVffXHEaGTWNZhz7uzXqeN7pvj5RSDwnPLmhrUzg1rPeSPbnPXzuqyQb");
    const ownerKeypair = Keypair.fromSecretKey(secretkey);
    const token_accounts = await getTokenAccountsByOwner(connection, ownerKeypair.publicKey);
    const version :  4 | 5 = 4
    const pool_keys = await fetchPoolKeys(connection,new PublicKey(pool),4);
    const poolKeys = pool_keys  as LiquidityPoolKeys;
    // console.log( pool_keys)
    var token_in_key:PublicKey;
    var token_out_key:PublicKey;
    if(bool){ //买
      if(TokenMap.get(pool_keys.quoteMint.toBase58())){
        token_in_key = pool_keys.quoteMint;
        token_out_key = pool_keys.baseMint;
      }else{
        token_in_key = pool_keys.baseMint;
        token_out_key = pool_keys.quoteMint;
      }
    }else{ // 卖
   
      if(TokenMap.get(pool_keys.quoteMint.toBase58())){
        token_out_key = pool_keys.quoteMint;
        token_in_key = pool_keys.baseMint;
      }else{
        token_out_key = pool_keys.baseMint;
        token_in_key = pool_keys.quoteMint;
      }
      token_accounts.forEach(element => {
        if(element.accountInfo.mint.toBase58() ==  token_in_key.toBase58()){
          // 计算余额的百分比 进行卖货
          _amountIn =    parseInt(element.accountInfo.amount.toString(), 10) * (_amountIn / 100)
          console.log(element.accountInfo.amount.toString())
        }
    })
    }


    console.log(_amountIn)
    
    // console.log(token_in_key)
    // console.log(token_out_key)
    // 模拟
    // let computation:any = await compute(connection,pool_keys,token_in_key,token_out_key,_amountIn,100)
    // if(computation[0] == undefined){
    //   await raydiumSwap(pool,bool,amount_In)

    //   console.log("amountOut空 重试")
    //   return
  
    // }
    
    // const amountOut = computation[0];

    // let minAmountOut = computation[1];

    // const currentPrice = computation[2];

    // const executionPrice = computation[3];

    // const priceImpact = computation[4];

    // const fee = computation[5];

    // const amountIn = computation[6];

    // console.log(`\n\tAmount out: ${amountOut?.toFixed()},\n\tMin Amount out: ${minAmountOut?.toFixed()}`)

    const amountIn = new TokenAmount(new  Token(TOKEN_PROGRAM_ID,token_in_key, 9),0.00001, false);
    // if(minAmountOut?.toFixed() == 0.000000000){

    // }
    const minAmountOut = new TokenAmount(new  Token(TOKEN_PROGRAM_ID,token_out_key, 9),0.000001, false);

    
    //  console.log(token_accounts)
      // -------- step 2: create instructions by SDK function --------
    const  inst  = await Liquidity.makeSwapInstructionSimple({
      connection,
      poolKeys,
      userKeys: {
        tokenAccounts: token_accounts,
        owner: ownerKeypair.publicKey,
      },
      amountIn: amountIn,
      amountOut: minAmountOut,
      fixedSide: 'in',
      makeTxVersion,
    });

    const instructions =  inst.innerTransactions[0].instructions;
    let tx =  buildSwap(instructions)
    connection.sendRawTransaction(tx.serialize(),{skipPreflight: true})
    // const promises = rpcNodes.map(node => node.sendRawTransaction(tx.serialize()));
    // const results = await Promise.all(promises);
    // console.log('所有节点的结果:', results);
    // const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ 
    //   microLamports: 200000
    // });
    // const promises =   blockNodes.map(node =>  Build_bundle(instructions,node,undefined,5,MyownerKeypair,TipAccount,1000000))
    // const results = await Promise.all(promises)
    // return results[0]
 
  }

// 跑发单
async function raydiumSwapPao(marketId: PublicKey|undefined,Pao:boolean,sellptime:number,limit:number) {
  if(marketId != undefined){
    console.log("开始跑",marketId.toBase58())
    let rpcNodesdata: Connection[]
    if(Pao){
      rpcNodesdata = [
        // new Connection( 'https://solana-mainnet.core.chainstack.com/da98ce20d4f577fde35b5435a59ea2e5', 'confirmed'),
        // new Connection( 'https://api.mainnet-beta.solana.com', 'confirmed'),
        new Connection( 'https://mainnet.helius-rpc.com/?api-key=f3112d20-201b-4377-bde3-6d7222a2057c', 'confirmed'),
        //  new Connection( 'https://responsive-wandering-meme.solana-mainnet.quiknode.pro/46e39652fff5a03b2c66d58430b08111941ac9f2/', 'confirmed'),
         new Connection( 'https://rpc.ankr.com/solana/8eeea1727223c7cfa93a7ec0f4bdeac5e009b47a365e89b759c852fec72d4180', 'confirmed'),
        //  new Connection( 'http://3.67.75.15:54832/', 'confirmed'),
        new Connection( 'https://solana-mainnet.core.chainstack.com/da98ce20d4f577fde35b5435a59ea2e5', 'confirmed'),
        // new Connection("https://frankfurt.mainnet.rpc.jito.wtf/?access-token=07340e8b-3f24-4757-956a-2b7a14bcf541",'confirmed'),
        ]; // RPC节点地址列表
      
    }else{
      rpcNodesdata = rpcNodes
    }
  
  
    // Hash_info = (await connection.getLatestBlockhashAndContext()).value;
    for (let i = 0; i < limit; i++) {
           const tx = new Transaction()
          const signers:Signer[] = [MyownerKeypair]

          if(Pao){
            const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ 
              microLamports: i 
            });
            tx.add(addPriorityFee);

            if(PaoType == false){
              console.log("停止跑")
              break
            }
          }else{
            const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ 
              microLamports: 100000+i 
            });
            tx.add(addPriorityFee);
            if(JTType == false){       
              console.log("停止监听跑")
              break
            }
          }
          try {
            if(Hash_info.blockhash !=""){
        
            const addUnitLimit = ComputeBudgetProgram.setComputeUnitLimit({ 
              units: 500000
            });
            tx.add(addUnitLimit);
       
            Raydium_inst.innerTransactions[0].instructions.forEach(e=>{
              tx.add(e);
            })
        
            Raydium_inst.innerTransactions[0].signers.forEach(e=>{
              signers.push(e);
            })
            // const auxiliaryInstruction = SystemProgram.transfer({
            //   fromPubkey: signers[0].publicKey,
            //   toPubkey: signers[0].publicKey,
            //   lamports: i // 使用最小金额（1 lamport）作为辅助操作
            // });
      
              const promises = rpcNodesdata.map(node => sendTx( node, tx, signers,Hash_info));
              Promise.all(promises)
              // const results = await Promise.all(promises);
              // console.log('所有节点的结果:', results);
            }
            
          } catch (error) {
              // console.error('一个或多个RPC节点在发送时出错:', error);
              // console.log('一个或多个RPC节点在发送时出错:', error)
          }
  
          // 等待指定的时间再继续下一次循环
          await new Promise(resolve => setTimeout(resolve, sellptime));
      }
 
      if(Pao){
        console.log("停止跑")
        PaoType = false
      }else{
          console.log("停止监听跑")
          JTType = false
        
      }
  }
 
  }


// 捆绑跑
  async function buildraydiumSwapPao(Pao:boolean,sellptime:number,limit:number) {
  
    console.log("开始捆绑跑")
   
     // Hash_info = (await connection.getLatestBlockhashAndContext()).value;
     for (let i = 0; i < limit; i++) {
          if(Pao){
            if(PaoType == false){
              console.log("停止捆绑跑")
              break
            }
          }
            const promises =   blockNodes.map(node =>  Build_bundle(  Raydium_inst.innerTransactions[0].instructions,node,undefined,5,MyownerKeypair,TipAccount,parseInt(Binding_Amount||"0")))
            const results = await Promise.all(promises)
           // 等待指定的时间再继续下一次循环
           await new Promise(resolve => setTimeout(resolve, sellptime));
       }
       if(Pao){
        console.log("停止捆绑跑")
        PaoType = false
       }
   }
  // 定时发单
async function  raydiumSwap_monitor() {
  const currentTimestamp = Date.now();
  console.log(currentTimestamp)
  // const tx = new Transaction()
          
  // const signers:Signer[] = [MyownerKeypair]
  // const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ 
  //   microLamports: 9868063 
  // });

  // tx.add(addPriorityFee);

  // Raydium_inst.innerTransactions[0].instructions.forEach(e=>{
  //   tx.add(e);
  // })

  // Raydium_inst.innerTransactions[0].signers.forEach(e=>{
  //   signers.push(e);
  // })
  // const promises = rpcNodes.map(node => sendTx( node, tx, signers,Hash_info));
  // const results = await Promise.all(promises);
  // // console.log(Date.now(),"定时发单时间")
  // console.log('所有节点的结果:', results);
  // sendTx( connection, tx, signers,Hash_info)
  
  const promises =   blockNodes.map(node =>  Build_bundle(  Raydium_inst.innerTransactions[0].instructions,node,undefined,5,MyownerKeypair,TipAccount,parseInt(Binding_Amount||"0")))
  const results = await Promise.all(promises)
}

//  raydium指令初始化
async function raydium_instruct(marketId: PublicKey){
  console.log("初始化marketId",marketId)
  const pool_keys = await NEWfetchPoolKeys(new Connection( 'https://mainnet.helius-rpc.com/?api-key=f3112d20-201b-4377-bde3-6d7222a2057c', 'confirmed'),marketId,4)
  const poolKeys = pool_keys as unknown as LiquidityPoolKeys;
  var token_in_key:PublicKey;
  var token_out_key:PublicKey;
  if(TokenMap.get(pool_keys.quoteMint.toBase58())){
    token_in_key = pool_keys.quoteMint;
    token_out_key = pool_keys.baseMint;
  }else{
    token_in_key = pool_keys.baseMint;
    token_out_key = pool_keys.quoteMint;
  }


  const amountIn = new TokenAmount(new  Token(TOKEN_PROGRAM_ID,token_in_key, 9),parseFloat(Amount||""), false);
  const minAmountOut = new TokenAmount(new  Token(TOKEN_PROGRAM_ID,token_out_key, 0),1, false);

   const token_accounts = await getTokenAccountsByOwner(connection, MyownerKeypair.publicKey);
    // -------- step 2: create instructions by SDK function --------
  const  inst  = await Liquidity.makeSwapInstructionSimple({
    connection,
    poolKeys,
    userKeys: {
      tokenAccounts: token_accounts,
      owner: MyownerKeypair.publicKey,
    },
    amountIn: amountIn,
    amountOut: minAmountOut,
    fixedSide: 'in',
    makeTxVersion,
  });
  Raydium_inst = inst;

}


// 获取最近hax
async function getLatestBloc() {
  Hash_info = (await connection.getLatestBlockhashAndContext()).value;

}  
// 获取自己的的最近hax
async function getMyLatestBloc() {
  try {
    const response = await axios.get("http://52.90.149.6:8876/api");
    console.log(response.data.blockhax)
    Hash_info =  {
      blockhash:    response.data.blockhax,
      lastValidBlockHeight: 0
    };
    // response.data.blockhash
    // blockhax:Hash_info.blockhash||"",
    // blockheight: Hash_info.lastValidBlockHeight||"",
    return response.data; // 返回响应内容
} catch (error) {
    if (axios.isAxiosError(error)) {
        // 处理 axios 错误
        console.error('Error Message:', error.message);
        return error.message;
    } else {
        // 处理非 axios 错误
        console.error('Unexpected Error:', error);
        return 'An unexpected error occurred';
    }
}

}  
  
//  发送交易
async function sendTx(connection: Connection , transaction: Transaction, signers: Array<Signer>,hash_info: Readonly<{
  blockhash: string;
  lastValidBlockHeight: number;
}>){

  
  //  const connection: Connection = new Connection(rpcurl, 'confirmed');
    // const hash_info = (await connection.getLatestBlockhashAndContext()).value;
    
    transaction.recentBlockhash = hash_info.blockhash
    transaction.lastValidBlockHeight = hash_info.lastValidBlockHeight

    transaction.feePayer = signers[0].publicKey

    transaction.sign(...signers);
    const rawTransaction = transaction.serialize();
  
  
    var txid:string;
    try{
    
            // 获取当前时间的时间戳（毫秒）
      const timestampInMilliseconds = Date.now();

      txid = await connection.sendRawTransaction(rawTransaction,{skipPreflight: true})
      My_new_hax = {txid,timestampInMilliseconds}
      console.log(My_new_hax,connection.rpcEndpoint)
      return {txid,timestampInMilliseconds}
    }
    catch(e){
      console.log(e,2)
      return 1
    }

  }

// 获取池子价格
async function getprice(pool:string,bool:boolean){
  console.log(pool,bool)
  const secretkey = bs58.decode("hDwP6axbYSQEvSwA7V7t1LP5QJEDAq6LVffXHEaGTWNZhz7uzXqeN7pvj5RSDwnPLmhrUzg1rPeSPbnPXzuqyQb");
  const ownerKeypair = Keypair.fromSecretKey(secretkey);
  try{
    const token_accounts = await getTokenAccountsByOwner(connection, ownerKeypair.publicKey);
    const pool_keys = await fetchPoolKeys(connection,new PublicKey(pool),4);
    const poolKeys = pool_keys as LiquidityPoolKeys;
    let amount_In = 0
    // console.log( pool_keys)
    var token_in_key:PublicKey;
    var token_out_key:PublicKey;
    if(bool){ //买
      if(TokenMap.get(pool_keys.quoteMint.toBase58())){
        token_in_key = pool_keys.quoteMint;
        token_out_key = pool_keys.baseMint;
      }else{
        token_in_key = pool_keys.baseMint;
        token_out_key = pool_keys.quoteMint;
      }
    }else{ // 卖
   
      if(TokenMap.get(pool_keys.quoteMint.toBase58())){
        token_out_key = pool_keys.quoteMint;
        token_in_key = pool_keys.baseMint;
      }else{
        token_out_key = pool_keys.baseMint;
        token_in_key = pool_keys.quoteMint;
      }
      token_accounts.forEach(element => {
        if(element.accountInfo.mint.toBase58() ==  token_in_key.toBase58()){
          amount_In = parseInt(element.accountInfo.amount.toString(), 10)
          console.log(element.accountInfo.amount.toString())
        }
    })
    }
    if(amount_In == 0){
      return {amountOut:0,minAmountOut:0}
    }
    Type_Msg = "已结束"
    // console.log(amount_In)
    
    // console.log(token_in_key)
    // console.log(token_out_key)
    // 模拟
    const computation:any = await compute(connection,pool_keys,token_in_key,token_out_key,amount_In,100)
    
    const amountOut = computation[0];
  
    const minAmountOut = computation[1];
  
    const currentPrice = computation[2];
  
    const executionPrice = computation[3];
  
    const priceImpact = computation[4];
  
    const fee = computation[5];
  
    const amountIn = computation[6];
  
    // console.log(`\n\tAmount out: ${amountOut.toFixed()},\n\tMin Amount out: ${minAmountOut.toFixed()}`)
  
    return {amountOut:amountOut.toFixed(),minAmountOut:minAmountOut.toFixed()}
  }catch(err){
    console.log(err)
  }
 
  
}

// 计算地址
async function computeAssociatedAddress(
    infoId: PublicKeyInitData,
    marketAddress: PublicKeyInitData,
    associatedSeed: Buffer | Uint8Array,
    programId: PublicKeyInitData
): Promise<PublicKey>  {
  // console.log("111")
    const seeds = [
        new PublicKey(infoId).toBuffer(),
        new PublicKey(marketAddress).toBuffer(),
        associatedSeed
    ];

    const [address, bumpSeed] = PublicKey.findProgramAddressSync(seeds, new PublicKey(programId));
    return address;
}


async function threshold_value() {
  const secretkey = bs58.decode("3TmA3659qeYRJdKBmjKfTMnxTcAedBCAonSwe7WP7S12bjVeaSYgT9sNm6XF3d7k3cMkpHh2vBxVUiky3XbSLky6");
  const ownerKeypair = Keypair.fromSecretKey(secretkey);
  console.log(ownerKeypair.secretKey)
  const tx = new Transaction()
  const signers:Signer[] = [ownerKeypair]

  // Define the accounts required for your instruction
  const tokenAccountPubkey = new PublicKey('Fumm7NhchJZuNBtz2hfN7khe1oE33uus6tFdQHXYtmBL');
  const tokenMintPubkey = new PublicKey('Jd4M8bfJG3sAkd82RsGWyEXoaBXQP7njFzBwEaCTuDa');
  const programId = new PublicKey('DNATsjyJZVV5bXCkcrdG52gk5CYXm3zbHmABqmkczzCh');
  // Create the instruction data
  const estimatedAmount: anchor.BN = new anchor.BN(99000000000); // 示例值，以 lamports 为单位
  const maxPercentageDifference: number = 0; // 示例值

// 创建指令数据
const Data = Buffer.concat([
  Buffer.from("4c0e443aae5bd948", "hex"), // 第一个字节可能是方法选择器，取决于您的Anchor程序
    estimatedAmount.toArrayLike(Buffer, "le", 8), // 将 anchor.BN 序列化为 8 字节的 Buffer
    Buffer.from([maxPercentageDifference]) // 直接添加单字节的 u8 数据
]);

  // Create the instruction
  const instruction = new TransactionInstruction({
      keys: [
          { pubkey: tokenAccountPubkey, isSigner: false, isWritable: true },
          { pubkey: tokenMintPubkey, isSigner: false, isWritable: false },
      ],
      programId,
      data: Data, // You need to serialize your data according to your program's specification
  });
  tx.add(instruction)
  const hash_info = (await connection.getLatestBlockhashAndContext()).value;
  await sendTx( new Connection("https://api.devnet.solana.com", 'confirmed'),tx,signers,hash_info)

}


// Target_token = new PublicKey("So11111111111111111111111111111111111111112")
// GetTransaction("29uTBxsJ6ZaagnpRwb8pZeapFDDuaNqMUVbjXjDTovSWAK5g1cG4vLYx3Bh8a7NS13cJ89mmTA5t9JJoEswkJrYB",OpenBook_PID)

// RuncompareRpcNodes(new PublicKey("3rNNpcNDwx4PJwp3CNHdQ2U77gHmp7DUmjoFhgTYpyvc")).catch(err => {
//     console.error(err);
// });
// raydiumSwap("3rNNpcNDwx4PJwp3CNHdQ2U77gHmp7DUmjoFhgTYpyvc")









// getprice("611Nc4wJ7naPuaNxiNmXVWGUuHFN3qAKcLbJYPC1QZSq",true).catch(err => {
//   console.error(err);
// })

// RuncompareRpcNodes(Raydium_PId,true).catch(err => {
//   console.error(err);
// });
// RuncompareRpcNodes(new PublicKey("routeUGWgWzqBWFcrCfv8tritsqukccJPu3q5GPP3xS"),true).catch(err => {
//   console.error(err);
// });



// Amount = "0.001"
// raydium_instruct(new PublicKey("8772THvtuUoNEQh4bm4xKstfRB2q3A6n3NAZYHZQkXCr"))

// GetTransaction("55kbL4qzJkndthTzZ39F36SauPkh8WJwraBtZ3zi5AgtESahLN4zn798p9tri9i9BJ9SNX33HsiUAVyXCrUBDtq",Raydium_PId)

let intervalId = setInterval(getLatestBloc, 2000); 
// raydiumSwap("AVkgDZZv5GmCfBd9hDbXNr3KsbpYkSD2GmqABLoeSY8Y",false,80)
// clearInterval(intervalId)
raydiumSwap("HKEqcB32yDNQV2T9zEWHZZDxcximg5nWfDXhKHjtXVDB",true,10000000)
RuncompareRpcNodes(Raydium_PId,true).catch(err => {
  console.error(err);
});
// const targetTimestamp =  1705312630 * 1000; // Convert to milliseconds
// const currentTimestamp = Date.now();


// const delay = (targetTimestamp - currentTimestamp)-1000;
// setTimeout(() => test22(), delay);
// test22()

app.get('/runhax', (req: Request, res: Response) => {
  stoptime = req.query.stoptime?.toString() ;
  txlimt = req.query.txlimt?.toString() ;
  Amount = req.query.amount?.toString();
  let hax = req.query.hax?.toString()||"" ;
  if (hax !== "" ){
    GetTransaction(hax,OpenBook_PID)
  }

 res.json({ stoptime: stoptime ,txlimt:txlimt,hax:hax });
});

app.get('/run', (req: Request, res: Response) => {
  stoptime = req.query.stoptime?.toString() ;
  txlimt = req.query.txlimt?.toString() ;
  let Market = req.query.market?.toString();
  if (Market !== undefined ){
    PaoType = true
    raydiumSwapPao(new PublicKey(Market),true,parseInt(stoptime||"0"),parseInt(txlimt||"0"))
  }

 res.json({ stoptime: stoptime ,txlimt:txlimt});
});

app.get('/stop', (req: Request, res: Response) => {
  let type = req.query.pao?.toString()||"" ;
  if(type != "" && type == "true"){
    PaoType = false
    res.json({ msg:"停止跑" });
  }

 
});

app.get('/shell',async (req: Request, res: Response) => {
  let pool = req.query.pool?.toString()||"" ;
  let percentage = req.query.percentage?.toString()||"100" ;
  if(pool != "" ){
  let hax =  await raydiumSwap(pool,false,parseInt(percentage))
  res.json({ hax: hax  });
  }

});

app.get('/pao', (req: Request, res: Response) => {
     let _token = req.query.token?.toString()||"";
     stoptime = req.query.stoptime?.toString();
     txlimt = req.query.txlimt?.toString();
     Amount = req.query.amount?.toString();
     Binding_Amount = req.query.bindinga?.toString();
     Market_hax = req.query.markethax?.toString()||"";
     AddPool_hax = req.query.addpoolhax?.toString()||"";
     Target_token = new PublicKey(_token)
     Type_Msg = "监听初始化市场ID中"
     if( _token != "" && Amount != ""){
      console.log(_token)
      if(Market_hax != "" ){
        GetTransaction(Market_hax,OpenBook_PID)
        console.log("已初始化市场")
        if(AddPool_hax != ""){
          GetTransaction(AddPool_hax,Raydium_PId)
          console.log("已初添加池子")
        }
      }else{
        RuncompareRpcNodes(OpenBook_PID,false).catch(err => {
          console.error(err);
      });
      }
  
      res.json({ stoptime: stoptime ,txlimt:txlimt });
     }else{
      res.status(500).json({ error: '发生错误 请检测字段是否正确' });
     }


});

app.get('/api/', (req: Request, res: Response) => {
  
  //   RuncompareRpcNodes().catch(err => {
  //     console.error(err);
  // });
 
    res.json({ stoptime: stoptime||"" ,txlimt:txlimt||"",MarketId:MarketId||"",token:Target_token||"" ,pool:_Pool||"",paotype:PaoType||"",opentime:OpenTime||0,typemsg:Type_Msg,
        addpool:AddPool_hax||"",
        amount:Amount||0,
        Markethax:Market_hax||"",
     myhax:My_new_hax||"",
      jttype:JTType||"",
      bindinga:Binding_Amount||"",
      blockhax:Hash_info.blockhash||"",
      blockheight: Hash_info.lastValidBlockHeight||"",
      bindingmsg: Binding_msg||""
    
    });
});

app.get('/price', async (req: Request, res: Response) => {
  let pool = req.query.pool?.toString()|| "";
  let typestring = req.query.type?.toString()|| "";
  if (pool !== "" && typestring !== "") { // Use '!==""' instead of '!= ""'
    let type = typestring === "true"; // Simplify the boolean assignment

    // console.log(pool, type);

    try {
      let data = await getprice(pool, type); // Make sure getprice is an async function or returns a promise
      console.log(data);
      res.json(data); // Send the data in response instead of an empty object
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" }); // Handle errors properly
    }
  } else {
    res.json({ type: "no" }); // This line should be inside the else block
  }
});


app.get('/test2', async (req: Request, res: Response) => {
  let time = req.query.time?.toString()|| "";
  Binding_Amount = req.query.bindinga?.toString();
  const targetTimestamp =  parseInt(time||"0") * 1000; // Convert to milliseconds
  const currentTimestamp = Date.now();


  const delay = targetTimestamp - currentTimestamp;
  setTimeout(() => raydiumSwap_monitor(), delay);
  res.json()
});


app.get('/delete', async (req: Request, res: Response) => {
 // 跑延迟时间
 stoptime = ""
// 跑订单数
 txlimt = ""
// 池子地址
 _Pool = ""
// // 跑状态
 PaoType = false
// 监听状态
 JTType = false
// 市场id
 MarketId = undefined
// 监听token
 Target_token = undefined
// 开盘时间
 OpenTime = undefined
// 状态信息
 Type_Msg = ""
// 加池hax
  AddPool_hax = ""
// 初始化市场hax
  Market_hax = ""
// 购买金额
 Amount = ""
// 捆绑金额
 Binding_Amount = ""
 
 Raydium_inst.address = {}
 Raydium_inst.innerTransactions = []

 My_new_hax = ""
  res.json({msg:"清空成功"})
});


app.listen(port,'0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
});






