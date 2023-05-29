import React, { useContext, useState, useCallback } from "react";
import { useQuery, gql } from '@apollo/client';
import { Paper, TableContainer, TableHead, Table, TableBody, TableCell, TableRow, Typography, Box, Link, CircularProgress, TableFooter, Button } from "@mui/material";
import { formatUnits } from 'ethers';
import moment from 'moment';

const GET_PURCHASES = gql`
  query GetPurchases ($items2Fetch: Int!, $tokenId: Int!) {
      purchases(first: $items2Fetch, orderBy: blockTimestamp, orderDirection: desc, where:{tokenId: $tokenId} ){
          transactionHash
          price
          blockTimestamp
      }
  }
`;

const TokenTransactionHistory = ({ tokenId }) => {

    const [items2Fetch, setItems2Fetch] = useState(10);

    const { loading, error, data, refetch } = useQuery(GET_PURCHASES, {
        pollInterval: 30000,
        variables: {
            tokenId: Number(tokenId),
            items2Fetch
        }
    });

    if (error) {
        return <Box textAlign="center" sx={{ marginTop: 2, marginBottom: 1 }}><Typography variant="h4">Error: {error.message}</Typography></Box>;
    }

    if (loading) {
        return <Box textAlign="center" sx={{ marginTop: 2, marginBottom: 1 }}><CircularProgress /></Box>;
    }

    if (data.purchases.length === 0) return null;

    const loadMore = () => {
        setItems2Fetch(items2Fetch + 10);
        refetch();
    }

    return (
        <>
            <Paper elevation={3} sx={{ marginTop: 2, padding: 1 }}>
                <Box textAlign={'center'} sx={{ marginBottom: 1 }}> <Typography variant='h5'> TRANSACTION HISTORY</Typography></Box>
                <TableContainer component={Paper}>
                    <Table style={{ width: '100%' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left"><Typography variant="h6">Explorer link</Typography></TableCell>
                                <TableCell align="right"><Typography variant="h6">Price</Typography></TableCell>
                                <TableCell align="right"><Typography variant="h6">Date</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.purchases.map((data, index) => (
                                <TableRow key={index} >
                                    <TableCell align="left"> <Link href={process.env.REACT_APP_BLOCKCHAIN_TX_EXPLORER + data.transactionHash} target="_blank"> View transaction details</Link></TableCell>
                                    <TableCell align="right">{formatUnits(data.price, 'ether')} ETH</TableCell>
                                    <TableCell align="right">{moment.unix(data.blockTimestamp).format('MMMM Do YYYY, h:mm:ss a')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {items2Fetch <= data.purchases.length ? (
                    <Box display={'flex'} alignItems={'center'} justifyContent={'center'} sx={{ marginTop: 3, marginBottom: 2 }}>
                        <Button variant="contained" color="primary" onClick={loadMore}>
                            Load more ...
                        </Button>
                    </Box>
                ) : null}
            </Paper>
        </>
    );
}

export default TokenTransactionHistory;