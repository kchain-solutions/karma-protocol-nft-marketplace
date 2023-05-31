import { useApolloClient, InMemoryCache, gql, ApolloClient } from '@apollo/client';

export function cutStringAfterWords(str, wordLimit) {
    const words = str.split(' ');
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(' ') + '...';
    } else {
        return str;
    }
}

export function cutStringAfterChars(str, charLimit) {
    if (str.length > charLimit) {
        return str.substring(0, charLimit) + '...';
    } else {
        return str;
    }
}

const GET_TOKEN = gql`
    query GetToken($tokenId: Int!, $contractAddr: Bytes!) {
            mints(where: {and: [
                {tokenId: $tokenId},
                {contractAddr: $contractAddr}
            ]}){
                tokenId
                contractAddr
                tokenURI
            }
        }
`;

export async function fromTokenToImage(tokenId, contractAddr) {
    const client = new ApolloClient({
        uri: process.env.REACT_APP_GRAPH_ENDPOINT,
        cache: new InMemoryCache(),
    });
    try {
        const { data } = await client.query({
            query: GET_TOKEN,
            variables: {
                tokenId: Number(tokenId),
                contractAddr,
            },
        });
        const metadataURI = data.mints[0].tokenURI;
        const fetchedMetadata = await fetch(metadataURI.replace("ipfs://", process.env.REACT_APP_IPFS_ENDPOINT));
        const metadata = await fetchedMetadata.json();
        const imageUrl = metadata.image.replace("ipfs://", process.env.REACT_APP_IPFS_ENDPOINT);
        const fetchedImage = await fetch(imageUrl);
        const blobImage = await fetchedImage.blob();
        const image = URL.createObjectURL(blobImage);
        return image;

    }
    catch (error) {
        console.error("fromTokenToImage error: ", error);
    }
}
