import { create } from 'ipfs-http-client';

export function createConnection(infura_id, infura_secret_key) {
    const auth = 'Basic ' + Buffer.from(infura_id + ':' + infura_secret_key).toString('base64');
    const client = ipfsClient.create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
            authorization: auth,
        },
    });
}
export async function uploadContent(content, infura_id, infura_secret_key) {
    const path = await client.add();
    console.log(path);
}