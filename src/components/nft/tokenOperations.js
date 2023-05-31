import React, { useState, useContext, useEffect } from "react";
import { Card, Grid, Button, TextField, Snackbar, IconButton, Paper, Divider, Typography, Box } from "@mui/material";
import GlobalStateContext from '../../provider/GlobalState';
import { isAddress, parseEther } from "ethers";
import { buyToken, transferToken, setSalePrice } from "../../utils/contractInterface";
import CloseIcon from '@mui/icons-material/Close';

const TokenOperations = ({ collectionAddress, tokenId, salePrice, tokenOwner, isAuthorizedContract }) => {

    const { globalState } = useContext(GlobalStateContext);

    const [price, setPrice] = useState(salePrice);
    const [priceError, setPriceError] = useState(false);
    const [priceHelperText, setPriceHelperText] = useState('');

    const [account, setAccount] = useState(null);

    const [toAddress, setToAddress] = useState(null);
    const [toAddressError, setToAddressError] = useState(false);
    const [toAddressHelperText, setToAddressHelperText] = useState('');

    const [openSnack, setOpenSnack] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const toAddressValidate = (toAddress) => {
        if (!isAddress(toAddress)) {
            setToAddressError(true);
            setToAddressHelperText('Please enter a valid address');
        }
        else {
            setToAddressError(false);
            setToAddressHelperText('');
        }
    }

    const priceValidate = (price) => {
        if (price <= 0) {
            setPriceError(true);
            setPriceHelperText('Please enter a valid price value');
        }
        else {
            setPriceError(false);
            setPriceHelperText('')
        }
    }

    const handlePurchase = async (event) => {
        event.preventDefault();
        setOpenSnack(true);
        setSnackbarMessage("Transaction submitted please wait...");
        try {
            const tx = await buyToken(globalState.ethersProvider, collectionAddress, tokenId);
            setOpenSnack(true);
            setSnackbarMessage("Token #" + tokenId + " purchased. Tx hash: " + tx.hash);
        } catch (error) {
            setOpenSnack(true);
            console.error('tokenOperation.js purchase error: ', error);
            setSnackbarMessage('tokenOperation.js purchase error: ' + error);
        }
    }

    const handleTransfer = async (event) => {
        event.preventDefault();
        toAddressValidate(toAddress);
        if (!isAddress(toAddress)) {
            return;
        }
        setOpenSnack(true);
        setSnackbarMessage("Transaction submitted please wait...");
        try {
            const tx = await transferToken(globalState.ethersProvider, collectionAddress, tokenOwner, toAddress, tokenId);
            setOpenSnack(true);
            setSnackbarMessage("Token #" + tokenId + " transfered. Tx hash: " + tx.hash);
        } catch (error) {
            setOpenSnack(true);
            console.error('tokenOperation.js transfer error: ', error);
            setSnackbarMessage('tokenOperation.js transfer error: ' + error);
        }
        setToAddress('');
    }

    const handleSetPrice = async (event) => {
        event.preventDefault();
        priceValidate(price);
        if (price <= 0) {
            return;
        }
        setOpenSnack(true);
        setSnackbarMessage("Transaction submitted please wait...");
        try {
            const weiPrice = parseEther(price);
            const tx = await setSalePrice(globalState.ethersProvider, collectionAddress, weiPrice, tokenId);
            setOpenSnack(true);
            setSnackbarMessage("Token #" + tokenId + " sell price setted to " + price + ".Tx hash: " + tx.hash);
        } catch (error) {
            console.error('tokenOperation.js set price error: ', error)
        }
        setPrice(0);
    }

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnack(false);
    }

    useEffect(() => {
        if (globalState?.ethersProvider?.getSigner) {
            globalState.ethersProvider.getSigner().then((signer => {
                setAccount(signer.address);
            }));
        }
    });

    const title = <><Grid item xs={12}> <Box textAlign={'center'}><Typography variant="h5" sx={{ marginTop: 2 }}> TOKEN OPERATIONS </Typography></Box></Grid></>
    const notAuthorized = <><Grid item xs={12}> <Typography variant="h6"> Contract is pending for certification </Typography></Grid></>

    return (<>
        <Card sx={{ marginTop: 2 }}>
            <Paper elevation={3} sx={{ padding: 1 }}>
                <Grid container spacing={2}>
                    {isAuthorizedContract === 1 ? notAuthorized : null}
                    {(account === tokenOwner && (isAuthorizedContract === 0 || isAuthorizedContract === 2)) ? (
                        <>
                            {title}
                            <Grid item xs={12}>
                                <TextField
                                    label={"Set sale price (" + process.env.REACT_APP_TX_COIN + ")"}
                                    type="number"
                                    value={price}
                                    onChange={(e) => { priceValidate(e.target.value); setPrice(e.target.value); }}
                                    error={priceError}
                                    helperText={priceHelperText}
                                    margin="normal"
                                    sx={{ width: '100%' }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" color="primary" onClick={handleSetPrice}>
                                    Set token price
                                </Button>
                            </Grid>
                            {salePrice === 0 ? (<>
                                <Grid item xs={12}><Divider /></Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Transfer address (0x0...)"
                                        value={toAddress}
                                        onChange={(e) => { toAddressValidate(e.target.value); setToAddress(e.target.value); }}
                                        error={toAddressError}
                                        helperText={toAddressHelperText}
                                        margin="normal"
                                        sx={{ width: '100%' }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button variant="contained" color="primary" onClick={handleTransfer}>
                                        Transfer token
                                    </Button>
                                </Grid>
                            </>) : null}
                        </>
                    ) : null}
                    {(salePrice > 0 && account !== tokenOwner && (isAuthorizedContract === 0 || isAuthorizedContract === 2)) ? (
                        <> {title}
                            < Grid item xs={12}>
                                <Box display="flex" alignItems={'center'} justifyContent={'center'}>
                                    <Button variant="contained" color="primary" onClick={handlePurchase} sx={{ marginTop: 2, marginBottom: 2 }}>
                                        Buy the token for {salePrice + " " + process.env.REACT_APP_TX_COIN}
                                    </Button>
                                </Box>
                            </Grid>
                        </>
                    ) : null}

                </Grid>
            </Paper>
        </Card >
        <Snackbar
            open={openSnack}
            onClose={handleCloseSnackbar}
            autoHideDuration={30000}
            message={snackbarMessage}
            action={
                <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={handleCloseSnackbar}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            }
        />
    </>);
}

export default TokenOperations;