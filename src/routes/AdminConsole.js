import React, { useState, useContext } from 'react';
import { TextField, Button, Box, RadioGroup, FormControlLabel, Radio, FormControl, IconButton, Snackbar, Typography, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GlobalStateContext from '../provider/GlobalState';
import { isAddress } from "ethers";
import { formFieldStyle, formBoxStyle } from '../style/muiStyle';
import { addAuthorizedCreator, removeAuthorizedCreator } from '../utils/contractInterface';

const AdminConsole = () => {
    const [addressValue, setAddressValue] = useState('');
    const [addressValueError, setAddressValueError] = useState(false);
    const [addressValueHelperText, setAddressValueHelperText] = useState(false);
    const [open, setOpen] = useState(false);
    const [action, setAction] = useState('add');
    const [response, setResponse] = useState(null);
    const { globalState } = useContext(GlobalStateContext);

    const validateAddressValue = (address) => {
        if (!isAddress(address)) {
            setAddressValueError(true);
            setAddressValueHelperText('Please enter a valid Ethereum address.');
        } else {
            setAddressValueError(false);
            setAddressValueHelperText('');
        }
    };

    const handleActionChange = (event) => {
        setAction(event.target.value);
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log('AdminConsole.js address value:', addressValue);
        validateAddressValue(addressValue);
        if (!(isAddress(addressValue))) return;
        setOpen(true);
        setResponse("Transaction submitted please wait...");
        if (action === "add") {
            try {
                const tx = await addAuthorizedCreator(globalState.ethersProvider, addressValue);
                setResponse("Creator added. TxHash: " + tx.hash);
            } catch (error) {
                setResponse("Error adding member " + error);
                console.error("AdminConsole.js error ", error);
            }
            setOpen(true);
        }
        if (action === "remove") {
            try {
                const tx = await removeAuthorizedCreator(globalState.ethersProvider, addressValue);
                setResponse("Creator removed. TxHash: " + tx.hash);
            } catch (error) {
                setResponse("Error removing member " + error);
                console.error("AdminConsole.js error ", error);
            }
            setOpen(true);
        }
        setAddressValue('');
    };

    return (
        <>
            <Paper elevation={3} sx={{ padding: 2 }}>
                <Box component="form"
                    sx={formBoxStyle}
                    noValidate
                    autoComplete="off"
                    textAlign={'center'}>
                    <Typography variant='h5' sx={{ marginBottom: 2 }}> AUTHORIZE KOLLECTION CREATORS</Typography>
                    <TextField
                        label="Creator address 0x..."
                        variant="outlined"
                        value={addressValue}
                        onChange={(e) => { setAddressValue(e.target.value); validateAddressValue(e.target.value); }}
                        error={addressValueError}
                        helperText={addressValueHelperText}
                        sx={{ ...formFieldStyle }}
                    />

                    <FormControl component="fieldset" sx={{ ...formFieldStyle, alignItems: 'center' }}>
                        <RadioGroup row value={action} onChange={handleActionChange} sx={{ marginBottom: 2 }}>
                            <FormControlLabel value="add" control={<Radio />} label="Add NFT creator" />
                            <FormControlLabel value="remove" control={<Radio />} label="Remove NFT creator" />
                        </RadioGroup>
                    </FormControl>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Box>
            </Paper>

            <Snackbar
                open={open}
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

export default AdminConsole;
