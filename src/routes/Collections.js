import React, { useContext, useState, useCallback } from "react";
import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, Typography, Grid, Box, TextField, Pagination, CircularProgress } from "@mui/material";
import { Link } from 'react-router-dom';
import { linkStyle, wrapTextStyle } from "../style/muiStyle";
import GlobalStateContext from "../provider/GlobalState";
import LastTokensUpdates from "../components/tables/LastTokensUpdates";
import LastMintedTokens from "../components/tables/LastMintedTokens";
import TokenPurchases from "../components/tables/TokensPurchases";
import { debounce } from 'lodash';

import banner from "../img/banner.png";

const GET_NEW_KRC721S = gql`
  query GetNewKRC721S($searchKey: String!) {
    newKRC721S( orderBy: blockTimestamp, orderDirection: desc , where: {
        or: [
          { name_contains_nocase: $searchKey },
          { symbol_contains_nocase: $searchKey }
        ]}
    ) {
      id
      owner
      krc721addr
      contractAddr
      name
      symbol
    }
  }
`;

const CollectionCard = ({ collection }) => {
    const { globalState } = useContext(GlobalStateContext);
    return (
        <Card>
            <CardContent>
                <Box>
                    <Typography variant="h5" sx={wrapTextStyle}>{collection.name.toUpperCase()}</Typography>
                    <Typography variant="subtitle1">{collection.symbol}</Typography>
                </Box>
                <Box sx={{ marginTop: 2 }}>
                    <Typography variant="body" sx={{ marginTop: 2 }}>Kollection creator address: </Typography>
                    <Typography variant="body2">{collection.owner}</Typography>
                </Box>
                <Box sx={{ marginTop: 2 }}>
                    <Typography variant="body" >Kollection contract address: </Typography>
                    <Typography variant="body2">{collection.krc721addr}</Typography>
                </Box>
                {globalState.isConnected ? (
                    <>
                        <Link to={"/collection-detail/" + collection.krc721addr} style={linkStyle}> <Box textAlign={'left'}><Typography variant="body2" sx={{ color: 'primary.main', textDecoration: 'underline', marginTop: 2 }}>Kollection detail</Typography></Box></Link>
                    </>) : (<></>)
                }
            </CardContent>
        </Card>
    );
};

const itemsPerPage = 50;

const Collections = () => {

    const [searchKey, setSearchKey] = useState('');
    const [page, setPage] = useState(1);

    const { loading, error, data, refetch } = useQuery(GET_NEW_KRC721S, {
        pollInterval: 10000,
        variables: {
            searchKey
        }
    });

    const debouncedRefetch = useCallback(
        debounce((searchKey) => refetch({ searchKey }), 2000),
        []
    );

    const handleSearchChange = (event) => {
        setSearchKey(event.target.value);
        debouncedRefetch(event.target.value);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const displayItems = () => {
        if (!loading || !error) {
            return data.newKRC721S.slice(
                (page - 1) * itemsPerPage,
                page * itemsPerPage
            )
        }
        return [];
    }

    if (error) {
        return <Box textAlign="center" sx={{ marginTop: 3, marginBottom: 1 }}><Typography variant="h4">Error: {error.message}</Typography></Box>;
    }

    return (
        <>
            <Grid container spacing={2} alignItems="center" justifyContent="center" sx={{ marginTop: 2 }} >
                <Grid item xs={12}>
                    <Box textAlign="center" sx={{ marginBottom: 1 }} >
                        <img
                            src={banner}
                            alt=""
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%%',
                            }} />
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box textAlign="center" sx={{ marginTop: 3, marginBottom: 1 }} >
                        <TextField
                            label="Kollection Search Bar (Name, Symbol)"
                            value={searchKey}
                            onChange={handleSearchChange}
                            sx={{ width: '100%' }}
                        />
                    </Box>
                </Grid>
                {loading ? (<>
                    <CircularProgress />
                </>) : (
                    <>
                        {displayItems().map((collection) => (
                            <Grid item xs={12} sm={6} md={4} key={collection.id} >
                                <CollectionCard collection={collection} />
                            </Grid>
                        ))}
                    </>)}
                {!loading ? (
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="center" my={2}>
                            <Pagination
                                count={Math.ceil(data.newKRC721S.length / itemsPerPage)}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                            />
                        </Box>
                    </Grid>) : null}
                <Grid item xs={12}>
                    <LastMintedTokens />
                </Grid>
                <Grid item xs={12}>
                    <LastTokensUpdates />
                </Grid>
                <Grid item xs={12}>
                    <TokenPurchases />
                </Grid>
            </Grid>
        </>
    );
};

export default Collections;
