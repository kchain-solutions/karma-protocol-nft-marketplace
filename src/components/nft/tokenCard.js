import React from "react";
import { Card, CardContent, CardMedia, CardActionArea, Typography, Box, Paper, CircularProgress, Divider } from "@mui/material";
import { ZeroAddress } from "ethers";
import { Link } from "react-router-dom";
import { linkStyle, typographyBodyLink } from "../../style/muiStyle";

const TokenCard = ({ metadata, imageSrc, beneficiaryAddress, collectionOwnerAddress, collectionAddress, commissionPercentages, tokenOwner, salePrice, tokenId }) => {

    return (
        <>
            {metadata ? (
                <>
                    <Card sx={{ width: '100%', marginTop: 2 }}>
                        <Paper elevation={3} sx={{ padding: 1, paddingRight: 10, paddingLeft: 10 }}>
                            <CardContent alignItems={'center'}>
                                <Box textAlign="center" sx={{ marginBottom: 2 }}>
                                    <Typography variant='h5'> TOKEN DETAILS #{tokenId}</Typography>
                                </Box>
                            </CardContent>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                            }}>
                                <CardActionArea>
                                    <CardMedia
                                        component="img"
                                        image={imageSrc}
                                        alt="Nft Image"
                                        sx={{ boxShadow: 1, maxWidth: '500px', margin: 'auto' }} />
                                </CardActionArea>
                            </Box>
                            <CardContent><Divider /></CardContent>
                            <CardContent>
                                <Typography variant='h6'> Token name </Typography>
                                <Box textAlign={'justify'}><Typography variant="body2">{metadata.name} </Typography></Box>
                            </CardContent>
                            <CardContent>
                                <Typography variant='h6'> Token description </Typography>
                                <Box textAlign={'justify'}><Typography variant="body2">{metadata.description} </Typography></Box>
                            </CardContent>
                            <CardContent><Divider /></CardContent>
                            <CardContent>
                                <Typography variant='h6'> Token owner address</Typography>
                                <Typography variant="body2">{tokenOwner} </Typography>
                            </CardContent>
                            {(beneficiaryAddress != ZeroAddress) ? (
                                <CardContent>
                                    <Typography variant='h6'> Beneficiary address</Typography>
                                    <Typography variant="body2">{beneficiaryAddress} </Typography>
                                </CardContent>) : null}
                            {salePrice > 0 ? (<CardContent>
                                <Typography variant='h6'>Token sale price</Typography>
                                <Typography variant='body2'> {salePrice + " " + process.env.REACT_APP_TX_COIN} </Typography>
                            </CardContent>) : null}
                            <CardContent>
                                <Typography variant='h6'> Kollection address</Typography>
                                <Link to={'/collection-detail/' + collectionAddress} style={linkStyle}> <Typography variant="body2" sx={typographyBodyLink}> Go back to {collectionAddress}</Typography>  </Link>
                            </CardContent>
                            <CardContent><Divider /></CardContent>
                            {commissionPercentages ? (
                                <CardContent>
                                    <Typography variant='h6'> Commissions on token sale</Typography>
                                    <Typography variant='body2'>Token owner profit: {commissionPercentages?.sellerCommissionPecentage}% </Typography>
                                    <Typography variant='body2'>Kollection creator commission: {commissionPercentages?.saleCommissionPercentage}% </Typography>
                                    <Typography variant='body2'>Karma DAO donation: {commissionPercentages?.krmCommissionPercentage}% </Typography>
                                    <Typography variant='body2'>Beneficiary commission: {commissionPercentages?.beneficiaryCommissionPercentage}% </Typography>
                                </CardContent>) : null}
                        </Paper>
                    </Card>
                </>

            ) : (
                <Paper elevation={3} sx={{ marginTop: 2 }}>
                    <CircularProgress />
                </Paper>
            )
            }
        </>);
}

export default TokenCard;