import {
  ENDPOINT as _ENDPOINT,
  Currency,
  LOOKUP_TABLE_CACHE,
  MAINNET_PROGRAM_ID,
  RAYDIUM_MAINNET,
  Token,
  TOKEN_PROGRAM_ID,
  TxVersion,
} from '@raydium-io/raydium-sdk';
import {
  Connection,
  Keypair,
  PublicKey,
} from '@solana/web3.js';

export const wallet = Keypair.fromSecretKey(Buffer.from([34,175,212,223,187,127,232,88,240,99,2,33,177,47,20,158,141,52,42,198,50,221,70,82,2,184,137,0,13,237,13,173,67,57,183,24,189,135,139,77,62,58,148,109,202,199,103,72,135,46,29,165,121,188,159,249,117,164,37,105,184,120,216,24]))

export const connection = new Connection('https://solana-mainnet-archive.allthatnode.com/NsTVN0SB8i8SX4kwS4bVtnDOv5PnYmpj');

export const PROGRAMIDS = MAINNET_PROGRAM_ID;

export const ENDPOINT = _ENDPOINT;

export const RAYDIUM_MAINNET_API = RAYDIUM_MAINNET;

export const makeTxVersion = TxVersion.V0; // LEGACY

export const addLookupTableInfo = LOOKUP_TABLE_CACHE // only mainnet. other = undefined

export const DEFAULT_TOKEN = {
  'SOL': new Currency(9, 'USDC', 'USDC'),
  'WSOL': new Token(TOKEN_PROGRAM_ID, new PublicKey('So11111111111111111111111111111111111111112'), 9, 'WSOL', 'WSOL'),
  'USDC': new Token(TOKEN_PROGRAM_ID, new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), 6, 'USDC', 'USDC'),
  'ANALOS': new Token(TOKEN_PROGRAM_ID, new PublicKey('CX81qiRpNemviWbwqEYRvUZetcJvfCQgD8cyTCNz93Uj'), 9, 'ANALOS', 'ANALOS'),
  'gptx': new Token(TOKEN_PROGRAM_ID, new PublicKey('BgNSCjWzeruX7wcDxedh5Q8Z9dw8CRLJJvyZwtD2XHji'), 9, 'gptx', 'gptx'),
  'RAY': new Token(TOKEN_PROGRAM_ID, new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'), 6, 'RAY', 'RAY'),
  'RAY_USDC-LP': new Token(TOKEN_PROGRAM_ID, new PublicKey('FGYXP4vBkMEtKhxrmEBcWN8VNmXX8qNgEJpENKDETZ4Y'), 6, 'RAY-USDC', 'RAY-USDC'),
}