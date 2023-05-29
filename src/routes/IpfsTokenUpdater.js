import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { isAddress } from "ethers"
import { Grid, Typography, Box, Button, IconButton, Paper, TextField, Snackbar, Divider, Link } from "@mui/material";
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudIcon from '@mui/icons-material/Cloud';
import { formFieldStyle, formBoxStyle } from "../style/muiStyle";
import PublishIcon from '@mui/icons-material/Publish';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { cutStringAfterChars } from "../utils/helpers";

const IpfsTokenUpdater = () => {

    const { collectionAddr } = useParams();

    const [isConnected, setIsConnected] = useState(false);

    const [snackbarText, setSnackbarText] = useState('');
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

    const [jwt, setJwt] = useState('');
    const [jwtError, setJwtError] = useState(false);
    const [jwtHelperText, setJwtHelperText] = useState('');

    const [updateName, setUpdateName] = useState('');
    const [updateNameError, setUpdateNameError] = useState(false);
    const [updateNameHelperText, setUpdateNameHelperText] = useState('');

    const [updateDescription, setUpdateDescription] = useState('');
    const [updateDescriptionError, setUpdateDescriptionError] = useState(false);
    const [updateDescriptionHelperText, setUpdateDescriptionHelperText] = useState('');

    const [externalLink, setExternalLink] = useState('');

    const [collectionAddress, setCollectionAddress] = useState('');
    const [collectionAddressError, setCollectionAddressError] = useState(false);
    const [collectionAddressHelperText, setCollectionAddressHelperText] = useState('');


    const [cid, setCid] = useState(null);

    useEffect(() => { setCollectionAddress(collectionAddr) }, [collectionAddr]);

    const validateJwt = (api) => {
        if (!api.trim()) {
            setJwtError(true);
            setJwtHelperText("Api-key is a mandatory field");
            setIsConnected(false);
        }
        else {
            setJwtError(false);
            setJwtHelperText('');
        }
    }

    const validateUpdateName = (name) => {
        if (!name.trim()) {
            setUpdateNameError(true);
            setUpdateNameHelperText("Update name is a mandatory field");
        } else {
            setUpdateNameError(false);
            setUpdateNameHelperText('');
        }
    }

    const validateUpdateDescription = (description) => {
        if (!description.trim()) {
            setUpdateDescriptionError(true);
            setUpdateDescriptionHelperText("Update description is a mandatory field");
        } else {
            setUpdateDescriptionError(false);
            setUpdateDescriptionHelperText('');
        }
    }

    const validateCollectionAddress = (address) => {
        if (!isAddress(address)) {
            setCollectionAddressError(true);
            setCollectionAddressHelperText("CollectionAddress is a mandatory field");
        } else {
            setCollectionAddressError(false);
            setCollectionAddressHelperText('');
        }
    }

    const testConnection = () => {
        if (jwtError) setIsConnected(false);
        else {
            axios
                .get(process.env.REACT_APP_PINATA_TEST_AUTH, { headers: { Authorization: "Bearer " + jwt } })
                .then((response) => {
                    if (response.status === 200) {
                        setIsConnected(true);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    setIsConnected(false);
                });
        }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setIsSnackbarOpen(false);
    };


    const handleUpdateSubmission = async (event) => {
        event.preventDefault();
        validateCollectionAddress(collectionAddress);
        validateJwt(jwt);
        validateUpdateDescription(updateDescription);
        validateUpdateName(updateName);

        if (!isAddress(collectionAddress) || !isConnected || !updateDescription.trim() || !updateName.trim()) {
            setIsSnackbarOpen(true);
            setSnackbarText("Please check mandatory fields!")
            return;
        }
        setIsSnackbarOpen(true);
        setSnackbarText("Submitting to IPFS...")

        const formData = new FormData();

        const data = {
            name: updateName,
            description: updateDescription,
            external_link: externalLink,
            collection_address: collectionAddress,
            timestamp: Math.floor(Date.now() / 1000)
        }
        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: "application/json" });
        formData.append('file', blob, 'metadata.json');
        const metadata = JSON.stringify({
            name: cutStringAfterChars(updateName, 30).replace('.', ' ').trim().replace(' ', '_'),
        });
        formData.append('pinataMetadata', metadata);
        const options = JSON.stringify({
            cidVersion: 0,
        })
        formData.append('pinataOptions', options);

        axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                Authorization: "Bearer " + jwt,
            }
        }).then((response) => {
            if (response.status === 200) {
                setIsSnackbarOpen(true)
                setSnackbarText("Successful update");
                setCid(response.data.IpfsHash);
                setExternalLink('');
                setUpdateDescription('');
                setUpdateName('');
            }
        }).catch((error) => {
            setIsSnackbarOpen(true)
            setSnackbarText("Error calling pinata api for update: " + error);
        });
    }

    return (
        <>
            <Paper elevation={3} sx={{ padding: 2 }}>
                <Box component="form"
                    sx={formBoxStyle}
                    noValidate
                    autoComplete="off"
                    textAlign="center">
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box textAlign={'center'}> <Typography variant="h5"> IPFS UPDATE HELPER </Typography> </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box textAlign={'center'}> <Typography variant="h6"> PINATA CONNECTOR </Typography> </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex"
                                textAlign="justify"
                                justifyContent="center">
                                <Typography variant="body2" sx={formFieldStyle}> In this field, you will need to copy the JWT generated from the appropriate <Link href="https://app.pinata.cloud/developers/api-keys" target="_blank">PAGE</Link> to connect to Pinata. </Typography> </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Insert Pinata JWT"
                                type="password"
                                error={jwtError}
                                helperText={jwtHelperText}
                                onChange={(e) => { setJwt(e.target.value); validateJwt(e.target.value); }}
                                onBlur={(e) => { testConnection(); }}
                                margin="normal"
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            {isConnected ? (
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <CloudIcon />
                                    <Typography variant="body2" sx={{ marginLeft: 2 }}>
                                        Pinata ONLINE
                                    </Typography>
                                </Box>
                            ) : (
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <CloudOffIcon />
                                    <Typography variant="body2" sx={{ marginLeft: 2 }}>
                                        Pinata OFFLINE
                                    </Typography>
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={12}> <Divider sx={{ marginTop: 2, marginBottom: 2 }} /> </Grid>
                        <Grid item xs={12} sx={{ marginBottom: 2 }}>
                            <Box textAlign={'center'}> <Typography variant="h6"> UPDATE UPLOADER </Typography> </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex"
                                textAlign="justify"
                                justifyContent="center">
                                <Typography variant="body2" sx={formFieldStyle}> In this form, you will upload the update data to IPFS to associate with an NFT. Enter the Name, Description, and any External Links and associate the CID. </Typography> </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Name"
                                value={updateName}
                                error={updateNameError}
                                helperText={updateNameHelperText}
                                onChange={(e) => {
                                    setUpdateName(e.target.value);
                                    validateUpdateName(e.target.value);
                                }}
                                margin="normal"
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                multiline
                                value={updateDescription}
                                rows={4}
                                label="Description"
                                error={updateDescriptionError}
                                helperText={updateDescriptionHelperText}
                                onChange={(e) => {
                                    setUpdateDescription(e.target.value);
                                    validateUpdateDescription(e.target.value);
                                }}
                                margin="normal"
                                sx={{ ...formFieldStyle }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                value={externalLink}
                                label="Link"
                                onChange={(e) => {
                                    setExternalLink(e.target.value);
                                }}
                                margin="normal"
                                sx={{ ...formFieldStyle }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Collection Address"
                                value={collectionAddress}
                                error={collectionAddressError}
                                helperText={collectionAddressHelperText}
                                onChange={(e) => {
                                    setCollectionAddress(e.target.value);
                                    validateCollectionAddress(e.target.value);
                                }}
                                margin="normal"
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" color="primary" component="span" onClick={handleUpdateSubmission} sx={{ marginTop: 2, marginBottom: 2 }}>
                                upload update <PublishIcon sx={{ marginLeft: 2 }} />
                            </Button>
                        </Grid>
                        {cid ? (
                            <Grid item xs={12}>
                                <Typography variant="body2">UPDATE IPFS LINK: <Link href={process.env.REACT_APP_IPFS_ENDPOINT + cid} target="_blank">{cid}</Link></Typography>
                            </Grid>) : (null)}
                    </Grid>
                </Box>
            </Paper >

            <Snackbar
                open={isSnackbarOpen}
                onClose={handleClose}
                autoHideDuration={30000}
                message={snackbarText}
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
}

export default IpfsTokenUpdater;