"use strict";
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
exports.sleepTime = exports.getATAAddress = exports.buildAndSendTx = exports.getWalletTokenAccount = exports.sendTx = void 0;
var raydium_sdk_1 = require("@raydium-io/raydium-sdk");
var web3_js_1 = require("@solana/web3.js");
var config_1 = require("../config");
function sendTx(connection, payer, txs, options) {
    return __awaiter(this, void 0, void 0, function () {
        var txids, _i, txs_1, iTx, _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    txids = [];
                    _i = 0, txs_1 = txs;
                    _e.label = 1;
                case 1:
                    if (!(_i < txs_1.length)) return [3 /*break*/, 6];
                    iTx = txs_1[_i];
                    if (!(iTx instanceof web3_js_1.VersionedTransaction)) return [3 /*break*/, 3];
                    iTx.sign([payer]);
                    _b = (_a = txids).push;
                    return [4 /*yield*/, connection.sendTransaction(iTx, options)];
                case 2:
                    _b.apply(_a, [_e.sent()]);
                    return [3 /*break*/, 5];
                case 3:
                    _d = (_c = txids).push;
                    return [4 /*yield*/, connection.sendTransaction(iTx, [payer], options)];
                case 4:
                    _d.apply(_c, [_e.sent()]);
                    _e.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, txids];
            }
        });
    });
}
exports.sendTx = sendTx;
function getWalletTokenAccount(connection, wallet) {
    return __awaiter(this, void 0, void 0, function () {
        var walletTokenAccount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connection.getTokenAccountsByOwner(wallet, {
                        programId: raydium_sdk_1.TOKEN_PROGRAM_ID,
                    })];
                case 1:
                    walletTokenAccount = _a.sent();
                    return [2 /*return*/, walletTokenAccount.value.map(function (i) { return ({
                            pubkey: i.pubkey,
                            programId: i.account.owner,
                            accountInfo: raydium_sdk_1.SPL_ACCOUNT_LAYOUT.decode(i.account.data),
                        }); })];
            }
        });
    });
}
exports.getWalletTokenAccount = getWalletTokenAccount;
function buildAndSendTx(innerSimpleV0Transaction, options) {
    return __awaiter(this, void 0, void 0, function () {
        var willSendTx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, raydium_sdk_1.buildSimpleTransaction)({
                        connection: config_1.connection,
                        makeTxVersion: config_1.makeTxVersion,
                        payer: config_1.wallet.publicKey,
                        innerTransactions: innerSimpleV0Transaction,
                        addLookupTableInfo: config_1.addLookupTableInfo,
                    })];
                case 1:
                    willSendTx = _a.sent();
                    return [4 /*yield*/, sendTx(config_1.connection, config_1.wallet, willSendTx, options)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.buildAndSendTx = buildAndSendTx;
function getATAAddress(programId, owner, mint) {
    var _a = (0, raydium_sdk_1.findProgramAddress)([owner.toBuffer(), programId.toBuffer(), mint.toBuffer()], new web3_js_1.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")), publicKey = _a.publicKey, nonce = _a.nonce;
    return { publicKey: publicKey, nonce: nonce };
}
exports.getATAAddress = getATAAddress;
function sleepTime(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log((new Date()).toLocaleString(), 'sleepTime', ms);
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        });
    });
}
exports.sleepTime = sleepTime;
