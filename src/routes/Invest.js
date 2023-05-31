import React, { useEffect, useState, useContext } from "react";
import { formatUnits, parseUnits } from "ethers";
import GlobalStateContext from '../provider/GlobalState';
import { Paper, Box, TextField, Grid, InputAdornment, IconButton, Typography, Button, Snackbar, Link, Divider } from "@mui/material";
import { getInvestorVaultConversionRate, buyGldkrm, getGldkrmBalance, getStablecoinBalance, approveStablecoin } from "../utils/contractInterface";
import { formFieldStyle, formBoxStyle } from "../style/muiStyle";
import PaymentIcon from '@mui/icons-material/Payment';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

const Invest = () => {

    const { globalState } = useContext(GlobalStateContext);

    const [usdc, setUsdc] = useState(0);
    const [usdcError, setUsdcError] = useState(false);
    const [usdcHelperText, setUsdcHelperText] = useState('');
    const [usdcSignerBalance, setUsdcSignerBalance] = useState("0");
    const [gldkrm, setGldkrm] = useState(0);
    const [gldkrmContractBalance, setGldkrmContractBalance] = useState("0");
    const [gldkrmSignerBalance, setGldkrmSignerBalance] = useState("0");
    const [rate, setRate] = useState(0);
    const [isOpenSnackbar, setIsOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [signerAddress, setSignerAddress] = useState(null);

    const [isApproved, setIsApproved] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isToBeProcessed, setIsToBeProcessed] = useState(true);

    const loadBalances = (provider, signerAddress) => {
        if (signerAddress) {
            getGldkrmBalance(provider, signerAddress).then((balance) => {
                balance = formatUnits(balance, 'ether');
                setGldkrmSignerBalance(balance);
            });
            getGldkrmBalance(provider, process.env.REACT_APP_INVESTOR_VAULT_ADDRESS).then((balance) => {
                balance = formatUnits(balance, 'ether');
                setGldkrmContractBalance(balance);
            });
            getStablecoinBalance(provider, signerAddress).then((balance) => {
                balance = formatUnits(balance, 'ether');
                setUsdcSignerBalance(balance);
            });
        }
    }

    useEffect(() => {
        if (globalState?.ethersProvider) {
            globalState.ethersProvider.getSigner().then((account) => {
                setSignerAddress(account?.address);
                loadBalances(globalState.ethersProvider, account?.address);
            });
            getInvestorVaultConversionRate(globalState.ethersProvider).then((response) => {
                setRate(response);
            }).catch((error) => {
                console.error("Invest error " + error);
            });
        }
    }, [globalState]);

    useEffect(() => {
        if (rate > 0)
            setGldkrm(usdc * rate);
        loadBalances(globalState.ethersProvider, signerAddress);
    }, [usdc]);

    const handleDollarChange = (e) => {
        setUsdc(e.target.value);
    }

    const validateUsdc = (value) => {
        const errors = [];
        const insufficientBalance = "Insufficient USDC Balance";
        const insufficientGLDKRM = "Not enough GLDKRM available";
        const invalidUsdcAmount = "USDC amount can't be zero";
        if (Number(value) > Number(usdcSignerBalance)) {
            if (!errors.includes(insufficientBalance))
                errors.push(insufficientBalance);
        }
        if (Number(value) === 0) {
            if (!errors.includes(invalidUsdcAmount))
                errors.push(invalidUsdcAmount)
        }
        if (value * rate > gldkrmContractBalance) {
            if (!errors.includes(insufficientGLDKRM))
                errors.push(insufficientGLDKRM);
        }

        if (errors.length > 0) {
            setUsdcError(true);
            setUsdcHelperText(errors.join(' and '));
        } else {
            setUsdcError(false);
            setUsdcHelperText('');
        }
    }

    const checkErrors = () => {
        return (Number(usdc) > Number(usdcSignerBalance)) || (usdc * rate > gldkrmContractBalance) || Number(usdc) === 0;
    }

    const handleApprove = () => {
        validateUsdc(usdc);
        const isError = checkErrors();
        if (!isError) {
            setIsOpenSnackbar(true);
            setSnackbarMessage("Transaction processing. Wait please...");
            setIsPending(true);
            setIsToBeProcessed(false);
            approveStablecoin(globalState.ethersProvider, parseUnits(usdc.toString(), 18)).then((tx) => {
                setIsOpenSnackbar(true);
                setSnackbarMessage("Transaction succeed. TX Hash: " + tx.hash);
                setIsApproved(true);
                setIsPending(false);
                setIsToBeProcessed(false);
                setUsdc(0);
            }).catch((error) => {
                setIsPending(false);
                setIsToBeProcessed(true);
                setIsOpenSnackbar(true);
                setSnackbarMessage("Transaction error: " + error);
                setUsdc(0);
            });
        }
    }

    const handleBuy = () => {
        validateUsdc(usdc);
        const isError = checkErrors();
        if (!isError) {
            setIsOpenSnackbar(true);
            setSnackbarMessage("Transaction processing. Wait please...");
            buyGldkrm(globalState.ethersProvider, parseUnits(usdc.toString(), 18)).then((tx) => {
                setIsOpenSnackbar(true);
                setSnackbarMessage("Transaction succeed. TX Hash: " + tx.hash);
                setIsToBeProcessed(true);
                setIsApproved(false);
                loadBalances(globalState.ethersProvider, signerAddress);
                setUsdc(0);
            }).catch((error) => {
                setIsToBeProcessed(true);
                setIsApproved(false);
                setIsOpenSnackbar(true);
                setSnackbarMessage("Transaction error: " + error);
                setUsdc(0);
            });
        }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setIsOpenSnackbar(false);
    };

    return (<>

        <Paper elevation={3} sx={{ padding: 2 }}>
            <Box component="form"
                sx={formBoxStyle}
                noValidate
                autoComplete="off"
                textAlign={'center'}>
                <Typography variant='h5' sx={{ marginBottom: 2 }}> COLLECT GOLD KARMA TOKENS</Typography>
                {process.env.REACT_APP_IS_TEST ? (<Typography variant='body' sx={{ marginBottom: 2 }}> ONLY FOR TEST</Typography>) : null}
                <TextField
                    label={"Invest"}
                    value={usdc}
                    type="number"
                    onChange={(e) => { validateUsdc(e.target.value); handleDollarChange(e); }}
                    error={usdcError}
                    helperText={usdcHelperText}
                    margin="normal"
                    sx={formFieldStyle}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                USDC
                            </InputAdornment>
                        ),
                    }}
                />
                <Box display="flex" justifyContent="flex-end" sx={{ ...formFieldStyle, marginTop: 0, marginBottom: 0 }}>
                    <Link href={process.env.REACT_APP_BLOCKCHAIN_EXPLORER + process.env.REACT_APP_STABLECOIN_ADDRESS} target="_blank"> Authorized USDC contract </Link>
                </Box>
                <Divider sx={{ ...formFieldStyle, marginTop: 2, marginBottom: 2 }} />
                <TextField
                    disabled
                    label={"USDC personal balance"}
                    value={usdcSignerBalance}
                    margin="normal"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                USDC
                            </InputAdornment>
                        ),
                    }}
                    sx={formFieldStyle}
                />
                <TextField
                    disabled
                    label={"GLDKRM personal balance"}
                    value={gldkrmSignerBalance}
                    margin="normal"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                GLDKRM
                            </InputAdornment>
                        ),
                    }}
                    sx={formFieldStyle}
                />
                <Divider sx={{ ...formFieldStyle, marginTop: 2, marginBottom: 2 }} />
                <TextField
                    disabled
                    label={"GLDKRM available to buy: " + gldkrmContractBalance}
                    value={gldkrm}
                    margin="normal"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                GLDKRM conversion
                            </InputAdornment>
                        ),
                    }}
                    sx={formFieldStyle}
                />
                <Box display="flex" justifyContent="flex-end" sx={{ ...formFieldStyle, marginTop: 0, marginBottom: 0 }}>
                    <Link href={process.env.REACT_APP_BLOCKCHAIN_EXPLORER + process.env.REACT_APP_GLDKRC20_ADDRESS} target="_blank"> Authorized GLDKRC contract </Link>
                </Box>
                <Divider sx={{ ...formFieldStyle, marginTop: 2, marginBottom: 4 }} />
                {isPending ? (
                    <Button variant="contained" color="primary" onClick={handleApprove}>
                        <HourglassBottomIcon sx={{ marginRight: 2 }} /> Dont' close the window. Wait Please ...
                    </Button>
                ) : null}
                {isToBeProcessed ? (
                    <Button variant="contained" color="primary" onClick={handleApprove}>
                        <CheckCircleOutlineIcon sx={{ marginRight: 2 }} /> Authorize contract to manage {usdc} USDC
                    </Button>) : null}
                {isApproved ? (
                    <Button variant="contained" color="primary" onClick={handleBuy}>
                        <PaymentIcon sx={{ marginRight: 2 }} /> Buy {gldkrm} GLDKRC
                    </Button>
                ) : null}
            </Box>
        </Paper>

        <Snackbar
            open={isOpenSnackbar}
            onClose={handleClose}
            autoHideDuration={30000}
            message={snackbarMessage}
            action={
                <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={handleClose}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            }
        />

    </>);
}

export default Invest;