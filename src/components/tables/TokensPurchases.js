import React, { useState, useEffect } from "react";
import { useQuery, gql } from '@apollo/client';
import { CircularProgress, Typography, Box, Table, TableRow, TableCell, TableBody, Link, Paper, TableContainer, TableHead } from "@mui/material";
import moment from "moment";
import { cutStringAfterChars, fromTokenToImage } from "../../utils/helpers";
import { formatUnits } from "ethers";
import { Link as InternalLink } from "react-router-dom";

const GET_PURCHASES = gql`
    query GetPurchases  {
        purchases(orderBy: blockTimestamp, orderDirection: desc, first:15){
            tokenId
            contractAddr
            price
            blockTimestamp
            transactionHash
            buyer
            seller
        }
    }
`;

const TokenPurchases = () => {

    const { loading, error, data } = useQuery(GET_PURCHASES, {
        pollInterval: 30000,
    });

    const [displayData, setDisplayData] = useState([]);

    const downloadPurchasesData = async () => {
        if (data?.purchases?.map) {
            const responses = await Promise.all(data.purchases.map(async (elem) => {
                try {
                    const tokenId = elem?.tokenId;
                    const contractAddr = elem?.contractAddr;
                    const image = (tokenId && contractAddr) ? await fromTokenToImage(elem.tokenId, elem.contractAddr) : null;
                    const response = { ...elem, image, tokenId, contractAddr };
                    return response;
                }
                catch (error) {
                    console.error('TokenUpdateList: ', error);
                    return null;
                }
            }));
            setDisplayData(responses.filter(response => response !== null));
        }
    }

    useEffect(() => {
        if (data?.purchases?.length > 0) {
            downloadPurchasesData();
        }

    }, [data])

    if (error) {
        return <Box textAlign="center" sx={{ marginTop: 2, marginBottom: 1 }}><Typography variant="h4">Error: {error.message}</Typography></Box>;
    }

    if (loading) {
        if (loading) {
            return <Box textAlign="center" sx={{ marginTop: 2, marginBottom: 1 }}><CircularProgress /></Box>;
        }
    }


    return (
        displayData?.length > 0 ? (
            <Paper elevation={3} sx={{ padding: 1 }}>
                <Box textAlign={'center'}><Typography variant="h5" sx={{ marginBottom: 2, marginTop: 1 }}> LAST NFT PURCHASES</Typography></Box>
                <TableContainer component={Paper}>
                    <Table style={{ width: '100%' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left" sx={{ width: '10%' }}><Typography variant="h6">NFT Image</Typography></TableCell>
                                <TableCell align="left" sx={{ width: '10%' }}><Typography variant="h6">Transaction</Typography></TableCell>
                                <TableCell align="left" sx={{ width: '30%' }}><Typography variant="h6">Price</Typography></TableCell>
                                <TableCell align="left" sx={{ width: '30%' }}><Typography variant="h6">Buyer</Typography></TableCell>
                                <TableCell align="left" sx={{ width: '20%' }}><Typography variant="h6">Transaction date</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayData.map((elem, index) => (
                                <TableRow key={index}>
                                    <TableCell > <Box sx={{
                                        width: '50px',
                                        height: '50px',
                                        overflow: 'hidden',
                                    }}>
                                        <InternalLink to={"/nft-detail/" + elem.contractAddr + "/" + elem.tokenId} style={{ textDecoration: 'none' }}>
                                            <img
                                                src={elem.image}
                                                style={{
                                                    objectFit: 'cover',
                                                    width: '100%',
                                                    height: '100%'
                                                }}
                                            />
                                        </InternalLink>
                                    </Box>
                                    </TableCell>
                                    <TableCell align="left"> <Link href={process.env.REACT_APP_BLOCKCHAIN_TX_EXPLORER + elem.transactionHash} target="_blank"> {cutStringAfterChars(elem?.transactionHash, 40)} </Link></TableCell>
                                    <TableCell align="justify"> {formatUnits(elem?.price, 18)} {process.env.REACT_APP_TX_COIN}</TableCell>
                                    <TableCell align="left">{elem.buyer}</TableCell>
                                    <TableCell align="left">{moment.unix(elem?.blockTimestamp).format('MMMM Do YYYY, h:mm:ss a')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        ) : null
    );
}

export default TokenPurchases;