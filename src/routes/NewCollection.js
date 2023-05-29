import React, { useState, useContext, useEffect } from 'react';
import GlobalStateContext from '../provider/GlobalState';
import { TextField, Button, Box, Snackbar, Slider, Typography, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, IconButton, Paper, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ZeroAddress, isAddress } from "ethers";
import { createKrc721 } from '../utils/contractInterface';
import { formFieldStyle, formBoxStyle } from '../style/muiStyle';

const NewCollection = () => {
    const { globalState } = useContext(GlobalStateContext);

    const [openSnack, setOpenSnack] = useState(false);
    const [response, setResponse] = useState('');

    const [owner, setOwner] = useState('');
    const [ownerError, setOwnerError] = useState(false);
    const [ownerHelperText, setOwnerHelperText] = useState('');

    const [beneficiaryAddress, setBeneficiaryAddress] = useState('');
    const [beneficiaryAddressError, setBeneficiaryAddressError] = useState(false);
    const [beneficiaryAddressHelperText, setBeneficiaryAddressOwnerHelperText] = useState('');

    const [collectionName, setCollectionName] = useState('');
    const [collectionNameError, setCollectionNameError] = useState(false);
    const [collectionNameHelperText, setCollectionNameHelperText] = useState('');

    const [collectionSymbol, setCollectionSymbol] = useState('');
    const [collectionSymbolError, setCollectionSymbolError] = useState(false);
    const [collectionSymbolHelperText, setCollectionSymbolHelperText] = useState('');

    const [maxCollectionSupply, setMaxCollectionSupply] = useState(0);
    const [maxCollectionSupplyError, setMaxCollectionSupplyError] = useState(false);
    const [maxCollectionSupplyHelperText, setMaxCollectionSupplyHelperText] = useState('');

    const [ownerCommissionPercentage, setOwnerCommissionPercentage] = useState(15);

    const [krmCommissionPercentage, setKrmCommissionPercentage] = useState(3);

    const [beneficiaryCommissionPercentage, setBeneficiaryCommissionPercentage] = useState(0);

    const [isKrc20, setIsKrc20] = useState('yes');

    const validateOwner = (address) => {
        if (!isAddress(address)) {
            setOwnerError(true);
            setOwnerHelperText('Please enter a valid Ethereum address.');
        } else {
            setOwnerError(false);
            setOwnerHelperText('');
        }
    };

    const validateBeneficiaryAddress = (address) => {
        if (!isAddress(address) && address.trim()) {
            setBeneficiaryAddressError(true);
            setBeneficiaryAddressOwnerHelperText('Please enter a valid Ethereum address.');
        } else {
            setBeneficiaryAddressError(false);
            setBeneficiaryAddressOwnerHelperText('');
        }
    };

    const validateCollectionName = (name) => {
        if (!name.trim()) {
            setCollectionNameError(true);
            setCollectionNameHelperText('Please enter a collection name.');
        } else {
            setCollectionNameError(false);
            setCollectionNameHelperText('');
        }
    };

    const validateCollectionSymbol = (symbol) => {
        if (!symbol.trim()) {
            setCollectionSymbolError(true);
            setCollectionSymbolHelperText('Please enter a collection symbol.');
        } else {
            setCollectionSymbolError(false);
            setCollectionSymbolHelperText('');
        }
    };

    const validateMaxCollectionSupply = (supply) => {
        if (supply <= 0 || supply >= 1000) {
            setMaxCollectionSupplyError(true);
            setMaxCollectionSupplyHelperText('Max collection supply must be a positive greater than 0 and lower than 1000.');
        } else {
            setMaxCollectionSupplyError(false);
            setMaxCollectionSupplyHelperText('');
        }
    };

    const checkErrors = () => {
        if (!collectionName.trim() || !collectionSymbol.trim() || !isAddress(owner) || (!isAddress(beneficiaryAddress) && beneficiaryAddress.trim()) || ownerCommissionPercentage + krmCommissionPercentage + beneficiaryCommissionPercentage > 90) {
            setOpenSnack(true);
            setResponse("Error: Please check you correctly fill the form");
            return true;
        }
        return false;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log('NewCollection.js. Collection creation');
        validateOwner(owner);
        validateMaxCollectionSupply(maxCollectionSupply);
        validateCollectionName(collectionName);
        validateCollectionSymbol(collectionSymbol);
        validateBeneficiaryAddress(beneficiaryAddress);
        if (checkErrors()) return;
        setResponse("Transaction submitted please wait...");
        const isKRC20 = isKrc20 === "yes" ? true : false;
        const beneficiaryAddr = beneficiaryAddress.trim() ? beneficiaryAddress : ZeroAddress;
        try {
            const tx = await createKrc721(globalState.ethersProvider, owner, collectionName, collectionSymbol, maxCollectionSupply, ownerCommissionPercentage, krmCommissionPercentage, beneficiaryCommissionPercentage, beneficiaryAddr, isKRC20);
            setOpenSnack(true);
            setResponse("New collection created. Tx hash: " + tx.hash);
        } catch (error) {
            setOpenSnack(true);
            setResponse("Error NewCollection: " + error);
        }
        setBeneficiaryAddress(ZeroAddress);
        setCollectionName('');
        setCollectionSymbol('');
        setMaxCollectionSupply(0);
        setOwnerCommissionPercentage(40);
        setKrmCommissionPercentage(3);
        setBeneficiaryCommissionPercentage(0);
        setIsKrc20('yes');
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnack(false);
    };

    useEffect(() => {
        globalState.ethersProvider.getSigner().then((signer) => {
            setOwner(signer.address);
            setBeneficiaryAddress(ZeroAddress);
        });
    }, []);

    return (
        <>
            <Paper elevation={3} sx={{ padding: 2 }}>
                <Box
                    component="form"
                    sx={formBoxStyle}
                    noValidate
                    autoComplete="off"
                    textAlign="center"
                >
                    <Typography variant="h4" sx={{ marginBottom: 2 }}>CREATE KOLLECTION</Typography>
                    <TextField
                        label="Kollection owner (0x0...)"
                        value={owner}
                        onChange={(e) => { setOwner(e.target.value); validateOwner(e.target.value); }}
                        error={ownerError}
                        helperText={ownerHelperText}
                        margin="normal"
                        sx={formFieldStyle}
                    />
                    <Divider sx={{ width: '80%', marginTop: 1, marginBottom: 1 }} />
                    <TextField
                        label="Collection Name"
                        value={collectionName}
                        onChange={(e) => { setCollectionName(e.target.value); validateCollectionName((e.target.value)); }}
                        error={collectionNameError}
                        helperText={collectionNameHelperText}
                        margin="normal"
                        sx={formFieldStyle}
                    />
                    <TextField
                        label="Collection Symbol"
                        value={collectionSymbol}
                        onChange={(e) => { setCollectionSymbol(e.target.value); validateCollectionSymbol(e.target.value); }}
                        error={collectionSymbolError}
                        helperText={collectionSymbolHelperText}
                        margin="normal"
                        sx={formFieldStyle}
                    />
                    <TextField
                        label="Max Collection Supply"
                        type='number'
                        value={maxCollectionSupply}
                        onChange={(e) => { setMaxCollectionSupply(e.target.value); validateMaxCollectionSupply(e.target.value); }}
                        error={maxCollectionSupplyError}
                        helperText={maxCollectionSupplyHelperText}
                        margin="normal"
                        sx={formFieldStyle}
                    />
                    <Divider sx={{ width: '80%', marginTop: 1, marginBottom: 1 }} />
                    <Typography gutterBottom>Owner Commission Percentage</Typography>
                    <Slider
                        value={ownerCommissionPercentage}
                        onChange={(e, newValue) => { setOwnerCommissionPercentage(newValue) }}
                        valueLabelDisplay="auto"
                        step={1}
                        min={1}
                        max={90}
                        sx={formFieldStyle}
                    />
                    <Typography gutterBottom>KRM Commission Percentage</Typography>
                    <Slider
                        value={krmCommissionPercentage}
                        onChange={(e, newValue) => { setKrmCommissionPercentage(newValue) }}
                        valueLabelDisplay="auto"
                        step={1}
                        min={1}
                        max={90}
                        sx={formFieldStyle}
                    />
                    <TextField
                        label="Beneficiary address (0x0...)"
                        value={beneficiaryAddress}
                        onChange={(e) => { setBeneficiaryAddress(e.target.value); validateBeneficiaryAddress(e.target.value) }}
                        error={beneficiaryAddressError}
                        helperText={beneficiaryAddressHelperText}
                        margin="normal"
                        sx={formFieldStyle}
                    />
                    <Typography gutterBottom>Beneficiary Commission Percentage</Typography>
                    <Slider
                        value={beneficiaryCommissionPercentage}
                        onChange={(e, newValue) => { setBeneficiaryCommissionPercentage(newValue) }}
                        valueLabelDisplay="auto"
                        step={1}
                        min={0}
                        max={90}
                        sx={formFieldStyle}
                    />
                    <Divider sx={{ width: '80%', marginTop: 1, marginBottom: 1 }} />
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Want to be KRC20 Certified?</FormLabel>
                        <RadioGroup
                            row
                            aria-label="isKrc20"
                            name="isKrc20"
                            value={isKrc20}
                            onChange={(e) => setIsKrc20(e.target.value)}
                        >
                            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                            <FormControlLabel value="no" control={<Radio />} label="No" />
                        </RadioGroup>
                    </FormControl>
                    <Divider sx={{ width: '80%', marginTop: 1, marginBottom: 2 }} />
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Box>
            </Paper>
            <Snackbar
                open={openSnack}
                onClose={handleClose}
                autoHideDuration={30000}
                message={response}
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
        </>
    );
};

export default NewCollection;
