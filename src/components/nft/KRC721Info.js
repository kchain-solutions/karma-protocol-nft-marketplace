import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Link, Paper } from '@mui/material';
import { linkStyle, wrapTextStyle } from '../../style/muiStyle';

const KRC721InfoCard = ({
    maxCollectionSupply,
    circulatingSupply,
    contractName,
    contractSymbol,
    isAuthorizedContract,
    collectionAddress,
}) => {

    const [certifiedStatus, setCertifiedStatus] = useState('Loading...');
    useEffect(() => {
        switch (isAuthorizedContract) {
            case "0":
                setCertifiedStatus('Certified');
                break;
            case "1":
                setCertifiedStatus('Verification pending');
                break;
            default:
                setCertifiedStatus('Karma network indipendent');
        }
    }, [isAuthorizedContract]);

    return (
        <>
            <Card>
                <Paper elevation={3}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={3}>
                                <Typography variant="h5">NAME - SYMBOL</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="h5"> KOLLECTION ADDRESS</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="h5">SUPPLY</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography variant="h5">KRM CERTIFICATION</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography variant="body1">{contractName} - {contractSymbol}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Link href={process.env.REACT_APP_BLOCKCHAIN_EXPLORER + collectionAddress} target="_blank" style={linkStyle}><Typography variant="body1" sx={wrapTextStyle}>{collectionAddress}</Typography></Link>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="body1">{circulatingSupply} / {maxCollectionSupply}</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography variant="body1"> {certifiedStatus}</Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Paper>
            </Card>
        </>
    );
};

export default KRC721InfoCard