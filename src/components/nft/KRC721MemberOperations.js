import React, { useState, useContext } from 'react';
import { Grid, Typography, Button, Box, TextField, Snackbar, IconButton, Divider, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GlobalStateContext from '../../provider/GlobalState';
import { mintKRC721, collectionGalleryUpdate } from '../../utils/contractInterface';
import { Link } from 'react-router-dom';
import { linkStyle, typographyBodyLink } from '../../style/muiStyle';
import PublishIcon from '@mui/icons-material/Publish';

const IPFS_URL = 'ipfs://'

const KRC721MemberOperations = ({ collectionAddress }) => {

    const [openSnack, setOpenSnack] = useState(false);
    const [response, setResponse] = useState('');

    const [uri, setUri] = useState('');
    const [uriError, setUriError] = useState(false);
    const [uriHelperText, setUriHelperText] = useState('');

    const [galleryURI, setGalleryURI] = useState('');
    const [galleryURIError, setGalleryURIError] = useState(false);
    const [galleryURIHelperText, setGalleryURIHelperText] = useState('');

    const [tokenId, setTokenId] = useState(1);
    const [tokenIdError, setTokenIdError] = useState(false);
    const [tokenIdHelperText, setTokenIdHelperText] = useState('');

    const { globalState } = useContext(GlobalStateContext);

    const validateUri = (uri) => {
        if (!uri.trim()) {
            setUriError(true);
            setUriHelperText('Please enter IPFS resource CID.');
        } else {
            setUriError(false);
            setUriHelperText('');
        }
    }

    const validateGalleryUri = (galleryURI) => {
        if (!galleryURI.trim()) {
            setGalleryURIError(true);
            setGalleryURIHelperText('Please enter IPFS resource CID.');
        } else {
            setGalleryURIError(false);
            setGalleryURIHelperText('');
        }
    }

    const validateTokenId = (tokenId) => {
        if (tokenId <= 0) {
            setTokenIdError(true);
            setTokenIdHelperText("Please enter a valid Token ID.");
        }
        else {
            setTokenIdError(false);
            setTokenIdHelperText("");
        }
    }

    const handleMint = async (event) => {
        event.preventDefault();
        console.log("KRC721MemberOperations - Minting...");
        validateUri(uri);
        if (!uri.trim()) {
            setOpenSnack(true);
            setResponse("Please check mandatory field to mint a token");
            return;
        }
        setOpenSnack(true);
        setResponse("Transaction submitted please wait...");
        try {
            const tx = await mintKRC721(globalState.ethersProvider, collectionAddress, IPFS_URL + uri + '/metadata.json');
            setOpenSnack(true);
            setResponse("New token created. Tx hash: " + tx.hash);
        } catch (error) {
            setResponse("Mint nft error: " + error);
        }
        setUri('');
    }

    const handleGalleryUpdate = async (event) => {
        event.preventDefault();
        console.log("KRC721MemberOperations - Updating gallery...");
        validateGalleryUri(galleryURI);
        validateTokenId(tokenId);
        if (!galleryURI.trim() || tokenId <= 0) {
            return;
        }
        setOpenSnack(true);
        setResponse("Transaction submitted please wait...");
        try {
            const tx = await collectionGalleryUpdate(globalState.ethersProvider, collectionAddress, tokenId, IPFS_URL + galleryURI);
            setOpenSnack(true);
            setResponse("Gallery updated. Tx hash: " + tx.hash);
        } catch (error) {
            setResponse("Gallery update error: " + error);
        }
        setGalleryURI('');
        setTokenId(0);
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnack(false);
    };

    return (<>
        <Paper elevation={3} sx={{ padding: 1 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}><Typography variant='h6'>MINT NEW TOKEN</Typography></Grid>
                <Grid item xs={12}>
                    <Box textAlign={'right'}>
                        <TextField
                            label="IPFS metadata (cid)"
                            value={uri}
                            onChange={(e) => { setUri(e.target.value); validateUri(e.target.value); }}
                            error={uriError}
                            helperText={uriHelperText}
                            margin="normal"
                            sx={{ width: '100%' }}
                        />
                        <Link to={"/ipfs-token-uploader/" + collectionAddress} target="_blank" style={linkStyle}><Typography variant='body2' sx={typographyBodyLink}>NFT CID GENERATOR HELPER</Typography></Link>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={handleMint}>
                        <PublishIcon sx={{ marginRight: 2 }} /> Mint token
                    </Button>
                </Grid>
                <Grid item xs={12}> <Divider orientation="horizontal" variant="middle" sx={{ marginBottom: 2, marginTop: 2 }} /></Grid>
                <Grid item xs={12}><Typography variant='h6'>UPDATE TOKEN GALLERY</Typography></Grid>
                <Grid item xs={12}>
                    <Box textAlign={'right'}>
                        <TextField
                            label="IPFS metadata (cid)"
                            value={galleryURI}
                            onChange={(e) => { setGalleryURI(e.target.value); validateUri(e.target.value); }}
                            error={galleryURIError}
                            helperText={galleryURIHelperText}
                            margin="normal"
                            sx={{ width: '100%' }}
                        />
                        <Link to={"/ipfs-token-updater/" + collectionAddress} target="_blank" style={linkStyle}><Typography variant='body2' sx={typographyBodyLink}>UPDATE CID GENERATOR HELPER</Typography></Link>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Token ID"
                        type='number'
                        value={tokenId}
                        onChange={(e) => { setTokenId(e.target.value); validateTokenId(e.target.value); }}
                        error={tokenIdError}
                        helperText={tokenIdHelperText}
                        margin="normal"
                        sx={{ width: '100%' }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={handleGalleryUpdate} sx={{ marginBottom: 2 }}>
                        <PublishIcon sx={{ marginRight: 2 }} /> Publish update
                    </Button>
                </Grid>
            </Grid>
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
    </>);
}

export default KRC721MemberOperations;