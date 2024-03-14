"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var bs58_1 = require("bs58");
var raydium_sdk_1 = require("@raydium-io/raydium-sdk");
var config_1 = require("../config");
var web3_js_1 = require("@solana/web3.js");
var anchor_1 = require("@coral-xyz/anchor");
var common_sdk_1 = require("@orca-so/common-sdk");
var whirlpools_sdk_1 = require("@orca-so/whirlpools-sdk");
var decimal_js_1 = require("decimal.js");
var TOKEN_PROGRAM_ID = new web3_js_1.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
var connection = new web3_js_1.Connection("https://rpc.ankr.com/solana/8eeea1727223c7cfa93a7ec0f4bdeac5e009b47a365e89b759c852fec72d4180", 'confirmed');
var TokenMap = new Map();
TokenMap.set("So11111111111111111111111111111111111111112", true);
TokenMap.set("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", true);
function Swap(pool) {
    return __awaiter(this, void 0, void 0, function () {
        var provider, ORCA_WHIRLPOOL_PROGRAM_ID, ctx, client, fromToken, toToken, whirlpool_pubkey, whirlpool, amount_in, quote, tx, signature;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    provider = anchor_1.AnchorProvider.env();
                    ORCA_WHIRLPOOL_PROGRAM_ID = new web3_js_1.PublicKey("whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc");
                    ctx = whirlpools_sdk_1.WhirlpoolContext.withProvider(provider, ORCA_WHIRLPOOL_PROGRAM_ID);
                    client = (0, whirlpools_sdk_1.buildWhirlpoolClient)(ctx);
                    console.log("endpoint:", ctx.connection.rpcEndpoint);
                    console.log("wallet pubkey:", ctx.wallet.publicKey.toBase58());
                    fromToken = { mint: new web3_js_1.PublicKey("BgNSCjWzeruX7wcDxedh5Q8Z9dw8CRLJJvyZwtD2XHji"), decimals: 9 };
                    toToken = { mint: new web3_js_1.PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), decimals: 6 };
                    whirlpool_pubkey = new web3_js_1.PublicKey(pool);
                    return [4 /*yield*/, client.getPool(whirlpool_pubkey)];
                case 1:
                    whirlpool = _a.sent();
                    amount_in = new decimal_js_1.default("50" /* devUSDC */);
                    return [4 /*yield*/, (0, whirlpools_sdk_1.swapQuoteByInputToken)(whirlpool, 
                        // Input token and amount
                        fromToken.mint, common_sdk_1.DecimalUtil.toBN(amount_in, fromToken.decimals), 
                        // Acceptable slippage (10/1000 = 1%)
                        common_sdk_1.Percentage.fromFraction(10, 1000), ctx.program.programId, ctx.fetcher, whirlpools_sdk_1.IGNORE_CACHE)];
                case 2:
                    quote = _a.sent();
                    // // Output the estimation
                    console.log("estimatedAmountIn:", common_sdk_1.DecimalUtil.fromBN(quote.estimatedAmountIn, fromToken.decimals).toString(), "fromToken");
                    console.log("estimatedAmountOut:", common_sdk_1.DecimalUtil.fromBN(quote.estimatedAmountOut, toToken.decimals).toString(), "toToken");
                    console.log("otherAmountThreshold:", common_sdk_1.DecimalUtil.fromBN(quote.otherAmountThreshold, toToken.decimals).toString(), "toToken");
                    return [4 /*yield*/, whirlpool.swap(quote)];
                case 3:
                    tx = _a.sent();
                    return [4 /*yield*/, tx.buildAndExecute()];
                case 4:
                    signature = _a.sent();
                    console.log("signature:", signature);
                    return [2 /*return*/];
            }
        });
    });
}
function Block_Logs() {
    return __awaiter(this, void 0, void 0, function () {
        var Logsconnection, programIds, subscriptionIds;
        var _this = this;
        return __generator(this, function (_a) {
            Logsconnection = new web3_js_1.Connection("https://rpc.ankr.com/solana/ws/8eeea1727223c7cfa93a7ec0f4bdeac5e009b47a365e89b759c852fec72d4180", 'confirmed');
            programIds = [
                new web3_js_1.PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'), // orca
                new web3_js_1.PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'), // Raydium
                // 添加更多程序ID...
            ];
            subscriptionIds = programIds.map(function (programId) {
                return Logsconnection.onLogs(programId, function (logs, context) { return __awaiter(_this, void 0, void 0, function () {
                    var index, element, data, data;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                index = 0;
                                _a.label = 1;
                            case 1:
                                if (!(index < logs.logs.length)) return [3 /*break*/, 6];
                                element = logs.logs[index];
                                if (!(programId.toBase58() == "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8")) return [3 /*break*/, 3];
                                if (!element.includes("initialize2: InitializeInstruction2")) return [3 /*break*/, 3];
                                // console.log(`New logs for program ${programId.toBase58()}:`);
                                // console.log('Block:', context.slot);
                                // console.log('Logs:', logs.logs);
                                console.log('Raydium  signature:', logs.signature);
                                return [4 /*yield*/, GetTransaction(logs.signature)];
                            case 2:
                                data = _a.sent();
                                _a.label = 3;
                            case 3:
                                if (!(programId.toBase58() == "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc")) return [3 /*break*/, 5];
                                if (!(element == "Program log: Instruction: InitializePool")) return [3 /*break*/, 5];
                                // console.log(`New logs for program ${programId.toBase58()}:`);
                                // console.log('Block:', context.slot);
                                // console.log('Logs:', logs.logs);
                                console.log('orca signature:', logs.signature);
                                return [4 /*yield*/, GetTransaction(logs.signature)];
                            case 4:
                                data = _a.sent();
                                _a.label = 5;
                            case 5:
                                index++;
                                return [3 /*break*/, 1];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); });
            });
            return [2 /*return*/];
        });
    });
}
function GetTransaction(tx) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log(tx);
            // InitializePool
            connection.getTransaction(tx, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 })
                .then(function (transactionInfo) {
                var _a, _b, _c;
                // console.log(transactionInfo.transaction.message);
                if (transactionInfo != null) {
                    if ('instructions' in transactionInfo.transaction.message) {
                        var getAccountKeys = transactionInfo.transaction.message.getAccountKeys();
                        var accounts = transactionInfo.transaction.message.instructions;
                        for (var index = 0; index < accounts.length; index++) {
                            var element = accounts[index];
                            if (element.accounts.length == 11) {
                                console.log((_a = getAccountKeys.get(element.accounts[1])) === null || _a === void 0 ? void 0 : _a.toBase58());
                                console.log((_b = getAccountKeys.get(element.accounts[2])) === null || _b === void 0 ? void 0 : _b.toBase58());
                                console.log((_c = getAccountKeys.get(element.accounts[4])) === null || _c === void 0 ? void 0 : _c.toBase58());
                            }
                        }
                        // Swap(getAccountKeys.get(accounts[0]).toBase58())
                    }
                    else {
                        var staticAccountKeys = transactionInfo.transaction.message.staticAccountKeys;
                        var Instructions = transactionInfo.transaction.message.compiledInstructions;
                        for (var index = 0; index < Instructions.length; index++) {
                            var element = Instructions[index];
                            if (element.accountKeyIndexes.length == 21) {
                                var pool = staticAccountKeys[element.accountKeyIndexes[4]].toBase58();
                                var tokenA = staticAccountKeys[element.accountKeyIndexes[8]].toBase58();
                                var tokenB = staticAccountKeys[element.accountKeyIndexes[9]].toBase58();
                                raydiumSwap(pool);
                                // if(TokenMap.get(tokenA)){
                                // }else if(TokenMap.get(tokenB)){
                                // }
                            }
                        }
                    }
                }
                // console.log(transactionInfo.transaction.message.compiledInstructions)
                // console.log(transactionInfo.transaction.message.addressTableLookups)
            })
                .catch(function (err) {
                console.error(err);
            });
            return [2 /*return*/];
        });
    });
}
// Raydium_Swap
function getTokenAccountsByOwner(connection, owner) {
    return __awaiter(this, void 0, void 0, function () {
        var tokenResp, accounts, _i, _a, _b, pubkey, account;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, connection.getTokenAccountsByOwner(owner, {
                        programId: TOKEN_PROGRAM_ID
                    })];
                case 1:
                    tokenResp = _c.sent();
                    accounts = [];
                    for (_i = 0, _a = tokenResp.value; _i < _a.length; _i++) {
                        _b = _a[_i], pubkey = _b.pubkey, account = _b.account;
                        accounts.push({
                            programId: TOKEN_PROGRAM_ID,
                            pubkey: pubkey,
                            accountInfo: raydium_sdk_1.SPL_ACCOUNT_LAYOUT.decode(account.data)
                        });
                    }
                    return [2 /*return*/, accounts];
            }
        });
    });
}
function get_token_amount(poolId, buying) {
    return __awaiter(this, void 0, void 0, function () {
        var rpc_url, version, connection_1, account, LiquidityStateLayout, fields, status_1, baseMint, quoteMint, lpMint, openOrders, targetOrders, baseVault, quoteVault, marketId, baseDecimal, quoteDecimal, is_valid, secretkey, ownerKeypair, owner_address, tokenAddress, bal, tokenAccounts, cand, tokenAccount, tokenBalance, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    rpc_url = "https://api.mainnet-beta.solana.com";
                    version = 4;
                    connection_1 = new web3_js_1.Connection(rpc_url);
                    return [4 /*yield*/, connection_1.getAccountInfo(new web3_js_1.PublicKey(poolId))];
                case 1:
                    account = _a.sent();
                    LiquidityStateLayout = raydium_sdk_1.Liquidity.getLayouts(version).state;
                    fields = LiquidityStateLayout.decode(account === null || account === void 0 ? void 0 : account.data);
                    status_1 = fields.status, baseMint = fields.baseMint, quoteMint = fields.quoteMint, lpMint = fields.lpMint, openOrders = fields.openOrders, targetOrders = fields.targetOrders, baseVault = fields.baseVault, quoteVault = fields.quoteVault, marketId = fields.marketId, baseDecimal = fields.baseDecimal, quoteDecimal = fields.quoteDecimal;
                    is_valid = false;
                    [quoteMint, baseMint, lpMint].forEach(function (e) {
                        if (e.toBase58() != '11111111111111111111111111111111') {
                            is_valid = true;
                        }
                    });
                    if (!is_valid) {
                        return [2 /*return*/, -1];
                    }
                    secretkey = bs58_1.default.decode("hDwP6axbYSQEvSwA7V7t1LP5QJEDAq6LVffXHEaGTWNZhz7uzXqeN7pvj5RSDwnPLmhrUzg1rPeSPbnPXzuqyQb");
                    ownerKeypair = web3_js_1.Keypair.fromSecretKey(secretkey);
                    owner_address = ownerKeypair.publicKey;
                    tokenAddress = buying ? quoteMint : baseMint;
                    return [4 /*yield*/, connection_1.getBalance(new web3_js_1.PublicKey(owner_address.toBase58()))];
                case 2:
                    bal = _a.sent();
                    if (bal < 0.01) {
                        return [2 /*return*/, -2];
                    }
                    if (!(tokenAddress.toBase58() == 'So11111111111111111111111111111111111111112')) return [3 /*break*/, 3];
                    return [2 /*return*/, (bal / 1000000000) - 0.0099];
                case 3: return [4 /*yield*/, connection_1.getParsedTokenAccountsByOwner(owner_address, { programId: new web3_js_1.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') })];
                case 4:
                    tokenAccounts = _a.sent();
                    for (cand in tokenAccounts.value) {
                        if (tokenAccounts.value[cand].account.data.parsed.info.mint === tokenAddress.toBase58()) {
                            tokenAccount = tokenAccounts.value[cand];
                            tokenBalance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
                            return [2 /*return*/, tokenBalance];
                        }
                    }
                    return [2 /*return*/, 0];
                case 5: return [3 /*break*/, 7];
                case 6:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [2 /*return*/, -1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function fetchPoolKeys(connection, poolId, version) {
    if (version === void 0) { version = 4; }
    return __awaiter(this, void 0, void 0, function () {
        var serumVersion, marketVersion, programId, serumProgramId, account, LiquidityStateLayout, fields, status, baseMint, quoteMint, lpMint, openOrders, targetOrders, baseVault, quoteVault, marketId, baseDecimal, quoteDecimal, withdrawQueue, lpVault, associatedPoolKeys, poolKeys, marketInfo, MARKET_STATE_LAYOUT, market, marketBaseVault, marketQuoteVault, marketBids, marketAsks, marketEventQueue;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    serumVersion = 10;
                    marketVersion = 3;
                    programId = new web3_js_1.PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');
                    serumProgramId = new web3_js_1.PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX');
                    return [4 /*yield*/, connection.getAccountInfo(poolId)];
                case 1:
                    account = _a.sent();
                    LiquidityStateLayout = raydium_sdk_1.Liquidity.getLayouts(version).state;
                    fields = LiquidityStateLayout.decode(account === null || account === void 0 ? void 0 : account.data);
                    status = fields.status, baseMint = fields.baseMint, quoteMint = fields.quoteMint, lpMint = fields.lpMint, openOrders = fields.openOrders, targetOrders = fields.targetOrders, baseVault = fields.baseVault, quoteVault = fields.quoteVault, marketId = fields.marketId, baseDecimal = fields.baseDecimal, quoteDecimal = fields.quoteDecimal;
                    if (raydium_sdk_1.Liquidity.isV4(fields)) {
                        withdrawQueue = fields.withdrawQueue;
                        lpVault = fields.lpVault;
                    }
                    else {
                        withdrawQueue = web3_js_1.PublicKey.default;
                        lpVault = web3_js_1.PublicKey.default;
                    }
                    associatedPoolKeys = raydium_sdk_1.Liquidity.getAssociatedPoolKeys({
                        version: version,
                        marketVersion: marketVersion,
                        marketId: marketId,
                        baseMint: baseMint,
                        quoteMint: quoteMint,
                        baseDecimals: baseDecimal.toNumber(),
                        quoteDecimals: quoteDecimal.toNumber(),
                        programId: programId,
                        marketProgramId: serumProgramId,
                    });
                    poolKeys = {
                        id: poolId,
                        baseMint: baseMint,
                        quoteMint: quoteMint,
                        lpMint: lpMint,
                        version: version,
                        programId: programId,
                        authority: associatedPoolKeys.authority,
                        openOrders: openOrders,
                        targetOrders: targetOrders,
                        baseVault: baseVault,
                        quoteVault: quoteVault,
                        withdrawQueue: withdrawQueue,
                        lpVault: lpVault,
                        marketVersion: serumVersion,
                        marketProgramId: serumProgramId,
                        marketId: marketId,
                        marketAuthority: associatedPoolKeys.marketAuthority,
                    };
                    return [4 /*yield*/, connection.getAccountInfo(marketId)];
                case 2:
                    marketInfo = _a.sent();
                    MARKET_STATE_LAYOUT = raydium_sdk_1.Market.getLayouts(marketVersion).state;
                    market = MARKET_STATE_LAYOUT.decode(marketInfo.data);
                    marketBaseVault = market.baseVault, marketQuoteVault = market.quoteVault, marketBids = market.bids, marketAsks = market.asks, marketEventQueue = market.eventQueue;
                    // const poolKeys: LiquidityPoolKeys;
                    return [2 /*return*/, __assign(__assign({}, poolKeys), {
                            marketBaseVault: marketBaseVault,
                            marketQuoteVault: marketQuoteVault,
                            marketBids: marketBids,
                            marketAsks: marketAsks,
                            marketEventQueue: marketEventQueue,
                        })];
            }
        });
    });
}
function compute(connection, poolKeys, curr_in, curr_out, amount_in, slip) {
    return __awaiter(this, void 0, void 0, function () {
        var poolInfo, in_decimal, out_decimal, amountIn, currencyOut, slippage, _a, amountOut, minAmountOut, currentPrice, executionPrice, priceImpact, fee, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, raydium_sdk_1.Liquidity.fetchInfo({ connection: connection, poolKeys: poolKeys })];
                case 1:
                    poolInfo = _b.sent();
                    console.log("开放时间:", poolInfo.startTime.toString());
                    if (curr_in.toBase58() === poolKeys.baseMint.toBase58()) {
                        in_decimal = poolInfo.baseDecimals;
                        out_decimal = poolInfo.quoteDecimals;
                    }
                    else {
                        out_decimal = poolInfo.baseDecimals;
                        in_decimal = poolInfo.quoteDecimals;
                    }
                    amountIn = new raydium_sdk_1.TokenAmount(new raydium_sdk_1.Token(TOKEN_PROGRAM_ID, curr_in, in_decimal), amount_in, false);
                    currencyOut = new raydium_sdk_1.Token(TOKEN_PROGRAM_ID, curr_out, out_decimal);
                    slippage = new raydium_sdk_1.Percent(slip, 100);
                    _a = raydium_sdk_1.Liquidity.computeAmountOut({ poolKeys: poolKeys, poolInfo: poolInfo, amountIn: amountIn, currencyOut: currencyOut, slippage: slippage }), amountOut = _a.amountOut, minAmountOut = _a.minAmountOut, currentPrice = _a.currentPrice, executionPrice = _a.executionPrice, priceImpact = _a.priceImpact, fee = _a.fee;
                    return [2 /*return*/, [
                            amountOut,
                            minAmountOut,
                            currentPrice,
                            executionPrice,
                            priceImpact,
                            fee,
                            amountIn,
                        ]];
                case 2:
                    e_2 = _b.sent();
                    console.log(e_2);
                    return [2 /*return*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function raydiumSwap(pool) {
    return __awaiter(this, void 0, void 0, function () {
        var secretkey, ownerKeypair, version, pool_keys, poolKeys, token_in_key, token_out_key, computation, amountOut, minAmountOut, currentPrice, executionPrice, priceImpact, fee, amountIn, token_accounts, inst, tx, signers, timestampInMilliseconds, timestampInSeconds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    secretkey = bs58_1.default.decode("hDwP6axbYSQEvSwA7V7t1LP5QJEDAq6LVffXHEaGTWNZhz7uzXqeN7pvj5RSDwnPLmhrUzg1rPeSPbnPXzuqyQb");
                    ownerKeypair = web3_js_1.Keypair.fromSecretKey(secretkey);
                    version = 4;
                    return [4 /*yield*/, fetchPoolKeys(connection, new web3_js_1.PublicKey(pool), 4)];
                case 1:
                    pool_keys = _a.sent();
                    poolKeys = pool_keys;
                    if (TokenMap.get(pool_keys.quoteMint.toBase58())) {
                        token_in_key = pool_keys.quoteMint;
                        token_out_key = pool_keys.baseMint;
                    }
                    else {
                        token_in_key = pool_keys.baseMint;
                        token_out_key = pool_keys.quoteMint;
                    }
                    return [4 /*yield*/, compute(connection, pool_keys, token_in_key, token_out_key, 0.00001, 100)];
                case 2:
                    computation = _a.sent();
                    amountOut = computation[0];
                    minAmountOut = computation[1];
                    currentPrice = computation[2];
                    executionPrice = computation[3];
                    priceImpact = computation[4];
                    fee = computation[5];
                    amountIn = computation[6];
                    console.log("\n\tAmount out: ".concat(amountOut.toFixed(), ",\n\tMin Amount out: ").concat(minAmountOut.toFixed()));
                    return [4 /*yield*/, getTokenAccountsByOwner(connection, ownerKeypair.publicKey)];
                case 3:
                    token_accounts = _a.sent();
                    return [4 /*yield*/, raydium_sdk_1.Liquidity.makeSwapInstructionSimple({
                            connection: connection,
                            poolKeys: poolKeys,
                            userKeys: {
                                tokenAccounts: token_accounts,
                                owner: ownerKeypair.publicKey,
                            },
                            amountIn: amountIn,
                            amountOut: minAmountOut,
                            fixedSide: 'in',
                            makeTxVersion: config_1.makeTxVersion,
                        })];
                case 4:
                    inst = _a.sent();
                    tx = new web3_js_1.Transaction();
                    signers = [ownerKeypair];
                    inst.innerTransactions[0].instructions.forEach(function (e) {
                        tx.add(e);
                    });
                    inst.innerTransactions[0].signers.forEach(function (e) {
                        signers.push(e);
                    });
                    timestampInMilliseconds = Date.now();
                    timestampInSeconds = Math.floor(timestampInMilliseconds / 1000);
                    // 打印时间戳
                    console.log(timestampInSeconds);
                    // const txids =  await buildAndSendTx(inst.innerTransactions) 
                    sendTx(connection, tx, signers);
                    return [2 /*return*/];
            }
        });
    });
}
function sendTx(connection, transaction, signers) {
    return __awaiter(this, void 0, void 0, function () {
        var hash_info, rawTransaction, txid, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connection.getLatestBlockhashAndContext()];
                case 1:
                    hash_info = (_a.sent()).value;
                    transaction.recentBlockhash = hash_info.blockhash;
                    transaction.lastValidBlockHeight = hash_info.lastValidBlockHeight;
                    transaction.feePayer = signers[0].publicKey;
                    transaction.sign.apply(transaction, signers);
                    rawTransaction = transaction.serialize();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, connection.sendRawTransaction(rawTransaction, { skipPreflight: true, })];
                case 3:
                    txid = _a.sent();
                    console.log(txid);
                    return [3 /*break*/, 5];
                case 4:
                    e_3 = _a.sent();
                    console.log(e_3);
                    return [2 /*return*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
Block_Logs().catch(function (err) {
    console.error(err);
});
// raydiumSwap("DNdf5pgTVewhHfmqwkp8cT3aGmZdgXSyNu6EwG7cac8g")
