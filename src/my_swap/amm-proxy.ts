import BigNumber from 'bignumber.js'
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction ,Connection} from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getMultipleAccountsInfo, Spl, SPL_ACCOUNT_LAYOUT, SPL_MINT_LAYOUT, WSOL,Liquidity ,Market} from "@raydium-io/raydium-sdk";


const marketInfo = {
    serumDexProgram: new PublicKey("EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj"),
    ammProgram: new PublicKey("HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8"),
    // serumMarket: new Keypair(),
    
}

async function main() {
    const serumMarketId = new PublicKey("7SFAwidDA6qEDTC3acMTJwLzKvKiZrEGwmMeVe2JA5Z2")
    const pool = new PublicKey("HKEqcB32yDNQV2T9zEWHZZDxcximg5nWfDXhKHjtXVDB")
    const myProgram = new PublicKey("Ee6yU6Dk1SQmtcSsXkrf4X6BEykwEbrGgW1JtqpK1SF2")
    const provider = anchor.AnchorProvider.env();
    let conn = provider.connection
    provider.opts.skipPreflight = true;
    anchor.setProvider(provider);

    const program = new Program({
        "version": "0.1.0",
        "name": "amm_proxy",
        "instructions": [
          {
            "name": "proxyPreInitialize",
            "docs": [
              "Pre initiazlize a swap pool"
            ],
            "accounts": [
              {
                "name": "ammProgram",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "ammTargetOrders",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolWithdrawQueue",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "ammAuthority",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "lpMint",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "coinMint",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "pcMint",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "poolCoinTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolPcTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolTempLpTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumMarket",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "userWallet",
                "isMut": false,
                "isSigner": true
              },
              {
                "name": "splTokenProgram",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "systemProgram",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "rent",
                "isMut": false,
                "isSigner": false
              }
            ],
            "args": [
              {
                "name": "nonce",
                "type": "u8"
              }
            ]
          },
          {
            "name": "proxyInitialize",
            "docs": [
              "Initiazlize a swap pool"
            ],
            "accounts": [
              {
                "name": "ammProgram",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "amm",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "ammAuthority",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "ammOpenOrders",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "lpMint",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "coinMint",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "pcMint",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "poolCoinTokenAccount",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "poolPcTokenAccount",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "poolWithdrawQueue",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolTargetOrdersAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolLpTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolTempLpTokenAccount",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "serumProgram",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "serumMarket",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "userWallet",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "splTokenProgram",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "systemProgram",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "rent",
                "isMut": false,
                "isSigner": false
              }
            ],
            "args": [
              {
                "name": "nonce",
                "type": "u8"
              },
              {
                "name": "openTime",
                "type": "u64"
              }
            ]
          },
          {
            "name": "proxyDeposit",
            "docs": [
              "deposit instruction"
            ],
            "accounts": [
              {
                "name": "ammProgram",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "amm",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "ammAuthority",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "ammOpenOrders",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "ammTargetOrders",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "lpMint",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolCoinTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolPcTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumMarket",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "serumEventQueue",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "userCoinTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "userPcTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "userLpTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "userOwner",
                "isMut": false,
                "isSigner": true
              },
              {
                "name": "splTokenProgram",
                "isMut": false,
                "isSigner": false
              }
            ],
            "args": [
              {
                "name": "maxCoinAmount",
                "type": "u64"
              },
              {
                "name": "maxPcAmount",
                "type": "u64"
              },
              {
                "name": "baseSide",
                "type": "u64"
              }
            ]
          },
          {
            "name": "proxyWithdraw",
            "docs": [
              "withdraw instruction"
            ],
            "accounts": [
              {
                "name": "ammProgram",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "amm",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "ammAuthority",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "ammOpenOrders",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "ammTargetOrders",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "lpMint",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolCoinTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolPcTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolWithdrawQueue",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolTempLpTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumProgram",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "serumMarket",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumCoinVaultAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumPcVaultAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumVaultSigner",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "userLpTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "userCoinTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "userPcTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "userOwner",
                "isMut": false,
                "isSigner": true
              },
              {
                "name": "serumEventQ",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumBids",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumAsks",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "splTokenProgram",
                "isMut": false,
                "isSigner": false
              }
            ],
            "args": [
              {
                "name": "amount",
                "type": "u64"
              }
            ]
          },
          {
            "name": "proxySwapBaseIn",
            "docs": [
              "swap_base_in instruction"
            ],
            "accounts": [
              {
                "name": "ammProgram",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "amm",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "ammAuthority",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "ammOpenOrders",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "ammTargetOrders",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolCoinTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolPcTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumProgram",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "serumMarket",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumBids",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumAsks",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumEventQueue",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumCoinVaultAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumPcVaultAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumVaultSigner",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "userSourceTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "userDestinationTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "userSourceOwner",
                "isMut": false,
                "isSigner": true
              },
              {
                "name": "splTokenProgram",
                "isMut": false,
                "isSigner": false
              }
            ],
            "args": [
              {
                "name": "amountIn",
                "type": "u64"
              },
              {
                "name": "minimumAmountOut",
                "type": "u64"
              }
            ]
          },
          {
            "name": "proxySwapBaseOut",
            "docs": [
              "swap_base_out instruction"
            ],
            "accounts": [
              {
                "name": "ammProgram",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "amm",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "ammAuthority",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "ammOpenOrders",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "ammTargetOrders",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolCoinTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "poolPcTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumProgram",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "serumMarket",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumBids",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumAsks",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumEventQueue",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumCoinVaultAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumPcVaultAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "serumVaultSigner",
                "isMut": false,
                "isSigner": false
              },
              {
                "name": "userSourceTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "userDestinationTokenAccount",
                "isMut": true,
                "isSigner": false
              },
              {
                "name": "userSourceOwner",
                "isMut": false,
                "isSigner": true
              },
              {
                "name": "splTokenProgram",
                "isMut": false,
                "isSigner": false
              }
            ],
            "args": [
              {
                "name": "maxAmountIn",
                "type": "u64"
              },
              {
                "name": "amountOut",
                "type": "u64"
              }
            ]
          }
        ]
      }, myProgram, provider);
      const poolKeys = await fetchPoolKeys(conn,new PublicKey(pool),4);
    //   program.rpc.proxySwapBaseIn()  

    
    const {
      vaultOwner,
      vaultNonce
    } = await getVaultOwnerAndNonce(new PublicKey(serumMarketId), marketInfo.serumDexProgram)
    const userCoinTokenAccount = await Spl.getAssociatedTokenAccount({mint:poolKeys.baseMint, owner:provider.wallet.publicKey,programId:TOKEN_PROGRAM_ID})
    const userPcTokenAccount = await Spl.getAssociatedTokenAccount({mint:poolKeys.quoteMint, owner:provider.wallet.publicKey,programId:TOKEN_PROGRAM_ID})

  let  tx = await program.rpc.proxySwapBaseIn(
        new anchor.BN(10000000), // amountIn
        new anchor.BN(1), // amountOut
        {
            accounts: {
                ammProgram: marketInfo.ammProgram,
                amm: poolKeys.id,
                ammAuthority: poolKeys.authority,
                ammOpenOrders: poolKeys.openOrders,
                ammTargetOrders: poolKeys.targetOrders,
                poolCoinTokenAccount: poolKeys.baseVault,
                poolPcTokenAccount: poolKeys.quoteVault,
                serumProgram: marketInfo.serumDexProgram,
                serumMarket: serumMarketId,
                serumBids: poolKeys.marketBids,
                serumAsks: poolKeys.marketAsks,
                serumEventQueue: poolKeys.marketEventQueue,
                serumCoinVaultAccount: poolKeys.baseVault,
                serumPcVaultAccount: poolKeys.quoteVault,
                serumVaultSigner: vaultOwner,
                userSourceTokenAccount: userCoinTokenAccount,
                userDestinationTokenAccount: userPcTokenAccount,
                userSourceOwner: provider.wallet.publicKey,
                splTokenProgram: TOKEN_PROGRAM_ID,
            },
        })

        console.log(tx)
}


// 读取池子信息 
async function fetchPoolKeys(
    connection: Connection,
    poolId: PublicKey,
    version :  4 | 5 = 4
  ) {
  
    const serumVersion = 10
    const marketVersion:3 = 3
  
    const programId = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');
    const serumProgramId = new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX')
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


  
 async function getVaultOwnerAndNonce(marketId: PublicKey, dexProgramId: PublicKey) {
  const vaultNonce = new anchor.BN(0);
  while (true) {
      try {
          const vaultOwner = await PublicKey.createProgramAddress(
              [marketId.toBuffer(), vaultNonce.toArrayLike(Buffer, 'le', 8)],
              dexProgramId,
          );
          return {vaultOwner, vaultNonce};
      } catch (e) {
          vaultNonce.iaddn(1);
      }
  }
}

main()