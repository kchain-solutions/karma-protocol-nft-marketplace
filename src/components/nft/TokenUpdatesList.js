import React, { useState, useEffect } from "react";
import { useQuery, gql } from '@apollo/client';
import { CircularProgress, Typography, Box, Table, TableRow, TableCell, TableBody, Link, Paper, TableContainer, TableHead, Button } from "@mui/material";
import moment from "moment";
import { cutStringAfterChars } from "../../utils/helpers";

const GET_COLLECTION_GALLERY_UPDATES = gql`
    query GetCollectionGalleryUpdate($items2Fetch: Int!, $tokenId: Int!, $contractAddr: Bytes!)  {
        collectionGalleryUpdates(orderBy: blockTimestamp, orderDirection: desc, first:$items2Fetch, where: 
            {and: [
                {tokenId: $tokenId}, 
                {contractAddr: $contractAddr}]}){
            contractAddr
            tokenId
            tokenURI
            blockTimestamp
        }
    }
`;

const TokenUpdateList = ({ tokenId, collectionAddress }) => {

    const [items2Fetch, setItems2Fetch] = useState(10);

    const { loading, error, data, refetch } = useQuery(GET_COLLECTION_GALLERY_UPDATES, {
        pollInterval: 30000,
        variables: {
            tokenId: Number(tokenId),
            contractAddr: collectionAddress,
            items2Fetch: items2Fetch
        }
    });

    const [displayData, setDisplayData] = useState([]);

    const downloadData = async () => {
        const responses = await Promise.all(data.collectionGalleryUpdates.map(async (elem) => {
            try {
                const httpUrl = elem?.tokenURI?.replace("ipfs://", process.env.REACT_APP_IPFS_ENDPOINT);
                const response = await fetch(httpUrl);
                return await response.json();
            }
            catch (error) {
                console.error('TokenUpdateList: ', error);
                return null;
            }
        }));
        setDisplayData(responses.filter(response => response !== null));
    }

    useEffect(() => {
        downloadData();
    }, [data])

    if (error) {
        return <Box textAlign="center" sx={{ marginTop: 2, marginBottom: 1 }}><Typography variant="h4">Error: {error.message}</Typography></Box>;
    }

    if (loading) {
        if (loading) {
            return <Box textAlign="center" sx={{ marginTop: 2, marginBottom: 1 }}><CircularProgress /></Box>;
        }
    }

    const loadMore = () => {
        setItems2Fetch(items2Fetch + 10);
        refetch();
    }

    return (
        displayData?.length > 0 ? (
            <Paper elevation={3} sx={{ padding: 1 }}>
                <Box textAlign={'center'}><Typography variant="h5" sx={{ marginBottom: 2, marginTop: 1 }}> TOKEN UPDATES</Typography></Box>
                <TableContainer component={Paper}>
                    <Table style={{ width: '100%' }}>
                        <TableHead>
                            <TableCell align="right" sx={{ width: '10%' }}><Typography variant="h6">Name</Typography></TableCell>
                            <TableCell align="right" sx={{ width: '40%' }}><Typography variant="h6">Description</Typography></TableCell>
                            <TableCell align="right" sx={{ width: '30%' }}><Typography variant="h6">External link</Typography></TableCell>
                            <TableCell align="right" sx={{ width: '20%' }}><Typography variant="h6">Date</Typography></TableCell>
                        </TableHead>
                        <TableBody>
                            {displayData.map((elem, index) => (
                                <TableRow key={index}>
                                    <TableCell align="justify"> {elem?.name}</TableCell>
                                    <TableCell align="justify"> {elem?.description}</TableCell>
                                    {elem?.external_link ?
                                        (<TableCell align="right"> <Link href={elem?.external_link} target="_blank">{cutStringAfterChars(elem?.external_link, 40)}</Link></TableCell>) :
                                        <TableCell align="right"> N/A </TableCell>}
                                    <TableCell align="justify">{moment.unix(elem?.timestamp).format('MMMM Do YYYY, h:mm:ss a')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {items2Fetch <= displayData.length ? (
                    <Box display={'flex'} alignItems={'center'} justifyContent={'center'} sx={{ marginTop: 3, marginBottom: 2 }}>
                        <Button variant="contained" color="primary" onClick={loadMore}>
                            Load more ...
                        </Button>
                    </Box>
                ) : null}
            </Paper>
        ) : null
    );

}

export default TokenUpdateList;