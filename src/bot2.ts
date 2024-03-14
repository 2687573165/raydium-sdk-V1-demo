import bs58 from "bs58";
import  {searcher} from 'jito-ts';
import {TransactionMessage,VersionedTransaction, Connection, clusterApiUrl, Logs, Context ,PublicKey,Keypair,Transaction,Signer,PublicKeyInitData,SystemProgram,TransactionInstruction,ComputeBudgetProgram} from '@solana/web3.js';
import { publicKey } from "@raydium-io/raydium-sdk";
const connection: Connection =new Connection("http://45.77.183.15:8899", 'confirmed');


async function test(node:string){
  const Mysecretkey = bs58.decode("hDwP6axbYSQEvSwA7V7t1LP5QJEDAq6LVffXHEaGTWNZhz7uzXqeN7pvj5RSDwnPLmhrUzg1rPeSPbnPXzuqyQb");
  const MyownerKeypair = Keypair.fromSecretKey(Mysecretkey);
  
  try{
    const auxiliaryInstruction = SystemProgram.transfer({
      fromPubkey: MyownerKeypair.publicKey,
      toPubkey: MyownerKeypair.publicKey,
      lamports: 1000 // 使用最小金额（1 lamport）作为辅助操作
    });
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({ 
      microLamports: 200000
    });        
    const instructions = [addPriorityFee,auxiliaryInstruction];
;

    const connection3: Connection =new Connection(node, 'confirmed');
    let data =  await connection3.getLatestBlockhash()

    const messageV0 = new TransactionMessage({
      payerKey: MyownerKeypair.publicKey,
      recentBlockhash: data.blockhash,
      instructions,
      }).compileToV0Message();
      const tx = new VersionedTransaction(messageV0);
      tx.sign([MyownerKeypair])

      try{
      connection3.sendRawTransaction(tx.serialize(), {
        skipPreflight: true,
      })
      console.log(data,node)
    }catch(e){

    }
    
  }catch(e){
    // console.log(e)
  }
  
}
// {
//   blockhash: '9Dcd68CrZRBRFhQzT3ZDWFWn4Z7eqMnyf7Vbb3P7AFD',
//   lastValidBlockHeight: 223017531
// } http://46.4.169.205:8899
// {
//   blockhash: 'Gs4VxdK1pHD4V5GJPvJvsxdfCM5jndR9N13jvMM9DkFs',
//   lastValidBlockHeight: 223046632
// } http://91.134.22.60:8899
// {
//   blockhash: '5phriDQwVAzznZkL9WGzyfDsyKRXBJW1KXjqbkq6NFM4',
//   lastValidBlockHeight: 222986800
// } http://178.63.126.77:8899
// {
//   blockhash: 'C7FdUHKWwwr9yG6wk2VzFzPLPoJPYW8c1gx4qGq9iFWF',
//   lastValidBlockHeight: 221832130
// } http://5.199.170.134:8899
// {
//   blockhash: 'BSX7aCmDmibN4bvmjoAjjmkjbjwH9npHY86BvaxzfEAr',
//   lastValidBlockHeight: 223053524
// } http://70.36.107.46:7899
// {
//   blockhash: 'CQGWriw2iFqm7p6eLfymFv9wVaJ99TUmjVTkNszQL3t1',
//   lastValidBlockHeight: 223051068
// } http://45.77.183.15:8899
async function main() {

  

   let data = await connection.getClusterNodes()
  let rps = []
   for (let index = 0; index < data.length; index++) {
    const element = data[index];
    if(element.rpc != null)
      // console.log(element.rpc)

      rps.push("http://"+element.rpc||"")
   }


   const promises = rps.map(node => test( node));
   await Promise.all(promises)
   console.log("2222222")
    // const secretkey = bs58.decode("3TmA3659qeYRJdKBmjKfTMnxTcAedBCAonSwe7WP7S12bjVeaSYgT9sNm6XF3d7k3cMkpHh2vBxVUiky3XbSLky6");
    // const ownerKeypair = Keypair.fromSecretKey(secretkey);


    // const secretkey2 = bs58.decode("hDwP6axbYSQEvSwA7V7t1LP5QJEDAq6LVffXHEaGTWNZhz7uzXqeN7pvj5RSDwnPLmhrUzg1rPeSPbnPXzuqyQb");
    // const ownerKeypair2 = Keypair.fromSecretKey(secretkey);

    // let cli =  searcher.searcherClient("ny.mainnet.block-engine.jito.wtf",ownerKeypair)
    // // let accounts :PublicKey[] = []
    // let regions :string[]=[];
    // // accounts.push(new PublicKey("5XRMqyBbF9k6wXSpRa7k8HmPozqwizv3Du9nXqUYyMb5"))


    // let Programs :PublicKey[] = []
    // Programs.push(new PublicKey("routeUGWgWzqBWFcrCfv8tritsqukccJPu3q5GPP3xS"))
    // cli.onProgramUpdate(  Programs,
    //   regions,
    //   async (transactions: VersionedTransaction[]) => {
    //     console.log(`received ${transactions.length} transactions`,);
    //     for (let index = 0; index < transactions.length; index++) {
    //       console.log("version",transactions[index].version)
    //       let Signer:PublicKey| undefined
    //       if(transactions[index].version == 0){
            
    //         Signer = transactions[index].message.staticAccountKeys[0]
    //       }else{
    //         Signer = transactions[index].message.getAccountKeys().get(0)
     
    //       }
    //       if(Signer?.toBase58() == new PublicKey("5XRMqyBbF9k6wXSpRa7k8HmPozqwizv3Du9nXqUYyMb5").toBase58()){
    //        const tx = new Transaction()
          
    //       const signers:Signer[] = [ownerKeypair2]  
    //          const auxiliaryInstruction = SystemProgram.transfer({
    //           fromPubkey: signers[0].publicKey,
    //           toPubkey: signers[0].publicKey,
    //           lamports: 1 // 使用最小金额（1 lamport）作为辅助操作
    //         });
    //         // Hash_info = (await connection.getLatestBlockhashAndContext()).value;

    //                   // 获取交易哈希（第一个签名）
    //       let transactionHash = transactions[0].signatures[0];

    //       // 将 Uint8Array 转换为 Base58 字符串
    //       let transactionHashBase58 = bs58.encode(transactionHash);

    //       console.log("Transaction Hash:", transactionHashBase58);
    //       }
          
         
          
    //     }

    //     let transactionHash = transactions[0].signatures[0];

    //     // 将 Uint8Array 转换为 Base58 字符串
    //     let transactionHashBase58 = bs58.encode(transactionHash);

    //     console.log("Transaction Hash:", transactionHashBase58);
      
    //   },
    //   (e: Error) => {
    //     throw e;
    //   }
    //   );

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
main()