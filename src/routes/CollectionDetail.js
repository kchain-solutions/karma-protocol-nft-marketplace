import React, { useEffect, useState, useContext } from 'react';
import { Typography, Grid, Box, Paper, Divider } from "@mui/material"
import { useParams } from "react-router-dom";
import GlobalStateContext from "../provider/GlobalState"
import { isKRC721AuthorizedMember, isKRC721AuthorizedContract, getMaxCollectionSupply, getCirculatingSupply, getKRC721Name, getKRC721Symbol, getCommissionPercentages } from '../utils/contractInterface';
import KRC721Info from '../components/nft/KRC721Info';
import KRC721MemberOperations from '../components/nft/KRC721MemberOperations';
import KRC721NftCards from '../components/nft/KRC721NftCards';
import CommissionPercentagesBox from '../components/nft/CommissionPercentagesBox';

const CollectionDetail = () => {

    const { collectionAddress } = useParams();
    const { globalState } = useContext(GlobalStateContext);
    const [maxCollectionSupply, setMaxCollectionSupply] = useState(0);
    const [circulatingSupply, setCirculatingSupply] = useState(0);
    const [contractName, setContractName] = useState('Loading...');
    const [contractSymbol, setContractSymbol] = useState('Loading');
    const [isAuthorizedMember, setIsAuthorizedMember] = useState(false);
    const [isAuthorizedContract, setIsAuthorizedContract] = useState('Loading...');
    const [commissionPercentages, setCommissionPercentages] = useState({});
    const [intervalId, setIntervalId] = useState(0);

    const loadData = async () => {
        const provider = globalState?.ethersProvider;
        if (provider) {
            console.log('CollectionDetail.js loading data...');
            try {
                setMaxCollectionSupply(await getMaxCollectionSupply(provider, collectionAddress));
            } catch (error) {
                console.error('Error in getMaxCollectionSupply: ', error);
            }

            try {
                setCirculatingSupply(await getCirculatingSupply(provider, collectionAddress));
            } catch (error) {
                console.error('Error in getCirculatingSupply: ', error);
            }

            try {
                setContractName(await getKRC721Name(provider, collectionAddress));
            } catch (error) {
                console.error('Error in getKRC721Name: ', error);
            }

            try {
                setContractSymbol(await getKRC721Symbol(provider, collectionAddress));
            } catch (error) {
                console.error('Error in getKRC721Symbol: ', error);
            }

            try {
                setIsAuthorizedMember(await isKRC721AuthorizedMember(provider, collectionAddress));
            } catch (error) {
                console.error('Error in isKRC721AuthorizedMember: ', error);
            }

            try {
                setIsAuthorizedContract(await isKRC721AuthorizedContract(provider, collectionAddress));
            } catch (error) {
                console.error('Error in isKRC721AuthorizedContract: ', error);
            }

            try {
                const CP = await getCommissionPercentages(globalState.ethersProvider, collectionAddress);
                setCommissionPercentages(CP);
            } catch (error) {
                console.error('getCommissionPercentages: ', error);
            }
        }
    }

    const loadDataWithInterval = () => {
        const id = setInterval(loadData, 30000);
        setIntervalId(id);
        console.log("CollectionDetail.js setInterval", id);
    }

    useEffect(() => {
        loadData();
        loadDataWithInterval();
        return () => {
            clearInterval(intervalId);
            console.log("CollectionDetail.js clearInterval", intervalId);
        }
    }, [collectionAddress]);

    return (<>

        <Grid container>

            <Grid item xs={12} sx={{ marginBottom: 2 }}> <Box textAlign={'center'}><Typography variant='h5'> KOLLECTION DETAILS </Typography></Box > </Grid>
            <Grid item xs={12}>
                <KRC721Info
                    maxCollectionSupply={maxCollectionSupply.toString()}
                    circulatingSupply={circulatingSupply.toString()}
                    contractName={contractName}
                    contractSymbol={contractSymbol}
                    isAuthorizedContract={isAuthorizedContract.toString()}
                    collectionAddress={collectionAddress}
                    commissionPercentages={commissionPercentages}
                />
            </Grid>
            <Grid container spacing={2} sx={{ marginTop: 2 }}>
                <Grid item xs={12} sm={8}>
                    <KRC721NftCards tokenSupply={Number(circulatingSupply)} collectionAddress={collectionAddress} />
                </Grid>
                <Grid item xs={12} sm={4}>

                    {isAuthorizedMember ? (
                        <>
                            <Grid item xs={12}>
                                <Box textAlign='center'>
                                    <KRC721MemberOperations collectionAddress={collectionAddress} />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sx={{ marginTop: 2, marginBottom: 2 }}> <Divider /> </Grid>
                            <Grid item xs={12}>
                                <CommissionPercentagesBox commissionPercentages={commissionPercentages} />
                            </Grid>
                        </>
                    ) : (<>
                        <Grid item xs={12}>
                            <CommissionPercentagesBox commissionPercentages={commissionPercentages} />
                        </Grid>
                    </>)}
                </Grid>
            </Grid >
        </Grid>
    </>)
}

export default CollectionDetail;