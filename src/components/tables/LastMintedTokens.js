import React, { useState, useEffect } from "react";
import { useQuery, gql } from '@apollo/client';
import { CircularProgress, Typography, Box, Table, TableRow, TableCell, TableBody, Paper, TableContainer, TableHead } from "@mui/material";
import moment from "moment";
import { Link as InternalLink } from "react-router-dom";
import { cutStringAfterWords, fromTokenToImage } from "../../utils/helpers";
import { linkStyle } from "../../style/muiStyle";

const GET_TOKENS = gql`
    query GetTokens {
            mints(orderBy: blockTimestamp, orderDirection: desc, first:15){
                tokenId
                contractAddr
                tokenURI
            }
        }
`;

const LastMintedTokens = () => {

    const { loading, error, data } = useQuery(GET_TOKENS, {
        pollInterval: 30000,
    });

    const [displayData, setDisplayData] = useState([]);

    const downloadData = async () => {
        if (data?.mints?.map) {
            const responses = await Promise.all(data.mints.map(async (elem) => {
                try {
                    const tokenId = elem?.tokenId;
                    const contractAddr = elem?.contractAddr;
                    const image = (tokenId && contractAddr) ? await fromTokenToImage(elem.tokenId, elem.contractAddr) : null;
                    const httpUrl = elem?.tokenURI?.replace("ipfs://", process.env.REACT_APP_IPFS_ENDPOINT);
                    let response = await fetch(httpUrl);
                    response = await response.json();
                    response = { ...response, image, tokenId, contractAddr };
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
        if (data?.mints?.length > 0) {
            downloadData();
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
                <Box textAlign={'center'}><Typography variant="h5" sx={{ marginBottom: 2, marginTop: 1 }}> LAST NFT MINTED</Typography></Box>
                <TableContainer component={Paper}>
                    <Table style={{ width: '100%' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left" sx={{ width: '10%' }}><Typography variant="h6">NFT Image</Typography></TableCell>
                                <TableCell align="left" sx={{ width: '10%' }}><Typography variant="h6">NFT Name</Typography></TableCell>
                                <TableCell align="left" sx={{ width: '30%' }}><Typography variant="h6">NFT Description</Typography></TableCell>
                                <TableCell align="left" sx={{ width: '20%' }}><Typography variant="h6">Minting Date</Typography></TableCell>
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
                                        <img
                                            src={elem.image}
                                            style={{
                                                objectFit: 'cover',
                                                width: '100%',
                                                height: '100%'
                                            }}
                                        />
                                    </Box>
                                    </TableCell>
                                    <TableCell align="left"> <InternalLink to={"/nft-detail/" + elem?.contractAddr + "/" + elem?.tokenId} style={linkStyle}> <Typography variant="body2" sx={{ color: 'primary.main' }}>{cutStringAfterWords(elem?.name, 5)}</Typography> </InternalLink></TableCell>
                                    <TableCell align="justify"> {cutStringAfterWords(elem?.description, 40)}</TableCell>
                                    <TableCell align="left">{moment.unix(elem?.timestamp).format('MMMM Do YYYY, h:mm:ss a')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        ) : null
    );
}

export default LastMintedTokens;