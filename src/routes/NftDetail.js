import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import GlobalStateContext from "../provider/GlobalState"
import { Grid, Box, Paper } from "@mui/material"
import { getTokenOwner, getBeneficiaryFromTokenId, getSalePrice, isKRC721AuthorizedContract, getKRC721TokenURI, getCommissionPercentages } from "../utils/contractInterface";
import { useQuery, gql } from '@apollo/client';
import { formatUnits } from 'ethers';
import TokenCard from "../components/nft/tokenCard";
import TokenOperations from "../components/nft/tokenOperations";
import TokenTransactionHistory from "../components/nft/tokenTransactionHistory";
import TokenUpdateList from "../components/nft/TokenUpdatesList";

const GET_TOKEN_DETAIL = gql`
query GetTokenDetail($tokenId: Int!, $contractAddr: Bytes!)  {
        mints (where:{ 
            and: [
                    { tokenId: $tokenId}, 
                    {contractAddr: $contractAddr}]
                })
            {
            tokenURI
        }
    }
`;

const NftDetail = () => {

    const { collectionAddress, tokenId } = useParams();

    const { globalState } = useContext(GlobalStateContext);
    const [account, setAccount] = useState('');
    const [tokenOwner, setTokenOwner] = useState('');
    const [beneficiaryAddress, setBeneficiaryAddress] = useState('');
    const [salePrice, setSalePrice] = useState(0);
    const [isAuthorizedContract, setIsAuthorizedContract] = useState(1);
    const [metadata, setMetadata] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [intervalId, setIntervalId] = useState(0);
    const [commissionPercentages, setCommissionPercentages] = useState(null);

    const downloadData = async () => {
        if (globalState.isConnected) {
            console.log('NFTDetails.js downloading data...');
            try {
                const TO = await getTokenOwner(globalState.ethersProvider, collectionAddress, tokenId);
                setTokenOwner(TO);
            } catch (error) {
                console.error('getTokenOwner: ', error);
            }

            try {
                const TA = await getBeneficiaryFromTokenId(globalState.ethersProvider, collectionAddress);
                setBeneficiaryAddress(TA);
            } catch (error) {
                console.error('getBeneficiaryFromTokenId: ', error);
            }

            try {
                const AC = await isKRC721AuthorizedContract(globalState.ethersProvider, collectionAddress);
                setIsAuthorizedContract(Number(AC));
            } catch (error) {
                console.error('isKRC721AuthorizedContract: ', error);
            }

            try {
                const wei = await getSalePrice(globalState.ethersProvider, collectionAddress, tokenId);
                const eth = Number(formatUnits(wei, 'ether'));
                setSalePrice(eth);
            } catch (error) {
                console.error('getSalePrice: ', error);
            }

            try {
                const CP = await getCommissionPercentages(globalState.ethersProvider, collectionAddress);
                setCommissionPercentages(CP);
            } catch (error) {
                console.error('getCommissionPercentages: ', error);
            }
        }

    }

    const loadIpfsData = async (tokenUri) => {
        try {
            if (tokenUri) {
                const httpUrl = tokenUri.replace("ipfs://", process.env.REACT_APP_IPFS_ENDPOINT);
                const response = await fetch(httpUrl);
                const metadata = await response.json();
                setMetadata(metadata);
                const imageUrl = metadata.image.replace("ipfs://", process.env.REACT_APP_IPFS_ENDPOINT);
                fetch(imageUrl)
                    .then((response) => response.blob())
                    .then((blob) => {
                        setImageSrc(URL.createObjectURL(blob));
                    })
            }
        } catch (error) {
            console.log('Download json or image: ', error);
        }
    }

    const { loading, error, data } = useQuery(GET_TOKEN_DETAIL, {
        variables: {
            tokenId: Number(tokenId),
            contractAddr: collectionAddress,
        }
    });

    useEffect(() => {
        if (error) console.error("Nft details error: ", error);
        if (!loading && !error) {
            const tokensMinted = data?.mints;
            loadIpfsData(tokensMinted[0]?.tokenURI)
        }
    }, [loading]);

    useEffect(() => {
        globalState.ethersProvider.getSigner().then((signer) => {
            setAccount(signer.address);
        });
        downloadData();
        const id = setInterval(downloadData, 30000);
        setIntervalId(id);
        return (() => {
            clearInterval(intervalId);
        });
    }, [tokenId, collectionAddress, globalState]);

    return (<>
        <Grid container spacing={2}>
            {tokenOwner === account || salePrice > 0 ? (
                <>
                    <Grid item xs={12} sm={7}>
                        <TokenCard metadata={metadata} imageSrc={imageSrc} tokenId={tokenId} beneficiaryAddress={beneficiaryAddress} tokenOwner={tokenOwner} salePrice={salePrice} collectionAddress={collectionAddress} commissionPercentages={commissionPercentages} />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                        <TokenOperations tokenOwner={tokenOwner} tokenId={tokenId} collectionAddress={collectionAddress} salePrice={salePrice} isAuthorizedContract={isAuthorizedContract} />
                    </Grid>
                    <Grid item xs={12}>
                        <TokenUpdateList tokenId={tokenId} collectionAddress={collectionAddress} />
                    </Grid>
                    <Grid item xs={12}>
                        <Paper elevation={6}>
                            <Box textAlign={'center'}><TokenTransactionHistory tokenId={tokenId} /></Box>
                        </Paper>

                    </Grid>
                </>) : (<>
                    <Grid item xs={12}>
                        <TokenCard metadata={metadata} imageSrc={imageSrc} tokenId={tokenId} beneficiaryAddress={beneficiaryAddress} tokenOwner={tokenOwner} salePrice={salePrice} collectionAddress={collectionAddress} commissionPercentages={commissionPercentages} />
                    </Grid>
                    <Grid item xs={12}>
                        <TokenUpdateList tokenId={tokenId} collectionAddress={collectionAddress} />
                    </Grid>
                    <Grid item xs={12}>
                        <TokenTransactionHistory tokenId={tokenId} />
                    </Grid>
                </>)}
        </Grid>
    </>)
}

export default NftDetail;