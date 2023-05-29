import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { isAddress } from "ethers"
import { Grid, Typography, Box, Button, IconButton, Paper, TextField, Snackbar, Divider, Link } from "@mui/material";
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudIcon from '@mui/icons-material/Cloud';
import { formFieldStyle, formBoxStyle } from "../style/muiStyle";
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import PublishIcon from '@mui/icons-material/Publish';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const IpfsTokenUploader = () => {

    const { collectionAddr } = useParams();

    const [isConnected, setIsConnected] = useState(false);

    const [snackbarText, setSnackbarText] = useState('');
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

    const [jwt, setJwt] = useState('');
    const [jwtError, setJwtError] = useState(false);
    const [jwtHelperText, setJwtHelperText] = useState('');

    const [imageFolderName, setImageFolderName] = useState('');
    const [imageFolderNameError, setImageFolderNameError] = useState(false);
    const [imageFolderNameHelperText, setImageFolderNameHelperText] = useState('');

    const [nftName, setNftName] = useState('');
    const [nftNameError, setNftNameError] = useState(false);
    const [nftNameHelperText, setNftNameHelperText] = useState('');

    const [nftDescription, setNftDescription] = useState('');
    const [nftDescriptionError, setNftDescriptionError] = useState(false);
    const [nftDescriptionHelperText, setNftDescriptionHelperText] = useState('');

    const [collectionAddress, setCollectionAddress] = useState('');
    const [collectionAddressError, setCollectionAddressError] = useState(false);
    const [collectionAddressHelperText, setCollectionAddressHelperText] = useState('');

    const [selectedImageFiles, setSelectedImageFiles] = useState([]);
    const [selectedMetadataFiles, setSelectedMetadataFiles] = useState([]);
    const [imageCid, setImageCid] = useState(null);
    const [metadataCid, setMetadataCid] = useState(null);

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

    const validateImageFolderName = (folderName) => {
        if (!folderName.trim()) {
            setImageFolderNameError(true);
            setImageFolderNameHelperText('Image folder name is a mandatory field');
        }
        else {
            setImageFolderNameError(false);
            setImageFolderNameHelperText('');
        }
    }

    const validateNftName = (name) => {
        if (!name.trim()) {
            setNftNameError(true);
            setNftNameHelperText("NftName is a mandatory field");
        } else {
            setNftNameError(false);
            setNftNameHelperText('');
        }
    }

    const validateNftDescription = (description) => {
        if (!description.trim()) {
            setNftDescriptionError(true);
            setNftDescriptionHelperText("NftDescription is a mandatory field");
        } else {
            setNftDescriptionError(false);
            setNftDescriptionHelperText('');
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

    const handleImageChange = (e) => {
        e.persist();
        e.preventDefault();
        let flag = false;
        if (e.target.files.length > 1) {
            Array.from(e.target.files).forEach((file) => {
                if (file.name === "image.png") {
                    flag = true;
                }
            });
        }
        if (flag) {
            setSelectedImageFiles(e.target.files)
        }
        else {
            setSelectedImageFiles([]);
            setIsSnackbarOpen(true);
            setSnackbarText("Error: Two files are required in the folder, one of which must be named image.png.")
        }
    }

    const handleMetadataChange = (e) => {
        e.persist();
        e.preventDefault();
        let flag = false;
        if (e.target.files.length > 1) {
            Array.from(e.target.files).forEach((file) => {
                if (file.name === "metadata.json") {
                    flag = true;
                }
            });
        }
        if (flag) {
            setSelectedMetadataFiles(e.target.files)
        }
        else {
            setSelectedMetadataFiles([]);
            setIsSnackbarOpen(true);
            setSnackbarText("Error: Two files are required in the folder, one of which must be named image.png.")
        }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setIsSnackbarOpen(false);
    };

    const handleImageSubmission = async (event) => {
        event.preventDefault();
        validateCollectionAddress(collectionAddress);
        validateJwt(jwt);
        validateNftDescription(nftDescription);
        validateNftName(nftName);
        validateImageFolderName(imageFolderName);
        if (!isAddress(collectionAddress) || !isConnected || !nftDescription.trim() || !nftName.trim() || selectedImageFiles.length < 2 || !imageFolderName.trim()) {
            setIsSnackbarOpen(true);
            setSnackbarText("Please check mandatory fields!")
            return;
        }
        setIsSnackbarOpen(true);
        setSnackbarText("Submitting to IPFS...")

        const formData = new FormData();
        Array.from(selectedImageFiles).forEach((file) => {
            formData.append("file", file)
        });
        const metadata = JSON.stringify({
            name: imageFolderName + "_image",
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
                const jsonMetadata = {
                    name: nftName,
                    description: nftDescription,
                    collection_address: collectionAddress,
                    image: "ipfs://" + response.data.IpfsHash + "/image.png",
                    timestamp: Math.floor(Date.now() / 1000),
                }
                const element = document.createElement("a");
                const file = new Blob([JSON.stringify(jsonMetadata)], { type: 'application/json' });
                element.href = URL.createObjectURL(file);
                element.download = "metadata.json";
                document.body.appendChild(element);
                element.click();
                setImageCid(response.data.IpfsHash);
                setIsSnackbarOpen(true)
                setSnackbarText("Successful image upload");
            }
        }).catch((error) => {
            setIsSnackbarOpen(true)
            setSnackbarText("Error calling pinata api for image: " + error);
        });
    }

    const handleMetadataSubmission = (event) => {
        event.preventDefault();
        validateImageFolderName(imageFolderName);
        if (selectedMetadataFiles.length < 2 || !isConnected) {
            setIsSnackbarOpen(true);
            setSnackbarText("Please check mandatory fields!")
            return;
        }
        setIsSnackbarOpen(true);
        setSnackbarText("Submitting to IPFS...")

        const formData = new FormData();
        Array.from(selectedMetadataFiles).forEach((file) => {
            formData.append("file", file)
        });
        const metadata = JSON.stringify({
            name: imageFolderName + "_metadata",
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
                setMetadataCid(response.data.IpfsHash);
                setIsSnackbarOpen(true)
                setSnackbarText("Successful metadata upload");
            }
        }).catch((error) => {
            setIsSnackbarOpen(true)
            setSnackbarText("Error calling Pinata api for metadata: " + error);
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
                            <Box textAlign={'center'}> <Typography variant="h5"> IPFS UPLOAD HELPER </Typography> </Box>
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
                        <Grid item xs={12}>
                            <TextField
                                label="Ipfs folder name"
                                value={imageFolderName}
                                error={imageFolderNameError}
                                helperText={imageFolderNameHelperText}
                                onChange={(e) => {
                                    setImageFolderName(e.target.value);
                                    validateImageFolderName(e.target.value);
                                }}
                                margin="normal"
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12}> <Divider sx={{ marginTop: 2, marginBottom: 2 }} /> </Grid>
                        <Grid item xs={12} sx={{ marginBottom: 2 }}>
                            <Box textAlign={'center'}> <Typography variant="h6"> PHASE 1 - METADATA PREPARATION </Typography> </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex"
                                textAlign="justify"
                                justifyContent="center">
                                <Typography variant="body2" sx={formFieldStyle}> In this session, the file associated with the NFT description will be generated. Fill in the following fields and insert the image. For the tool to function correctly, there must be at least two files in the same folder: our file of interest, which must be named 'image.png', and another (which can be empty) named 'placeholder.txt'. </Typography> </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <input
                                    directory=""
                                    webkitdirectory=""
                                    type="file"
                                    id="contained-button-image-file"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="contained-button-image-file">
                                    <Button variant="contained" color="primary" component="span" sx={{ marginRight: 2 }}>
                                        <DriveFolderUploadIcon sx={{ marginRight: 2 }} /> Select image.png folder
                                    </Button>
                                </label>
                                {selectedImageFiles?.length > 1 ? (<Typography variant="body2"> image.png correctly selected </Typography>) : (<Typography variant="body2"> Please select the correct folder</Typography>)}
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="NFT Name"
                                value={nftName}
                                error={nftNameError}
                                helperText={nftNameHelperText}
                                onChange={(e) => {
                                    setNftName(e.target.value);
                                    validateNftName(e.target.value);
                                }}
                                margin="normal"
                                sx={formFieldStyle}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                multiline
                                value={nftDescription}
                                rows={4}
                                label="NFT Description"
                                error={nftDescriptionError}
                                helperText={nftDescriptionHelperText}
                                onChange={(e) => {
                                    setNftDescription(e.target.value);
                                    validateNftDescription(e.target.value);
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
                            <Button variant="contained" color="primary" component="span" onClick={handleImageSubmission} sx={{ marginTop: 2, marginBottom: 2 }}>
                                upload image <PublishIcon sx={{ marginLeft: 2 }} />
                            </Button>
                        </Grid>
                        {imageCid ? (
                            <Grid item xs={12}>
                                <Typography variant="body2">IMAGE IPFS LINK: <Link href={process.env.REACT_APP_IPFS_ENDPOINT + imageCid + "/image.png"} target="_blank">{imageCid}</Link></Typography>
                            </Grid>) : (null)}

                        <Grid item xs={12}> <Divider sx={{ marginTop: 2, marginBottom: 2 }} /> </Grid>
                        <Grid item xs={12} sx={{ marginBottom: 2 }}>
                            <Box textAlign={'center'}> <Typography variant="h6"> PHASE 2 - METADATA UPLOAD </Typography> </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex"
                                textAlign="justify"
                                justifyContent="center">
                                <Typography variant="body2" sx={formFieldStyle}> In this session, we need to place the file (metadata.json) generated in the previous step into a folder. Then, upload the folder. As before, it's important that the folder contains not only the metadata.json file but also another file (which can be empty), for example, placeholder.txt. </Typography> </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <input
                                    directory=""
                                    webkitdirectory=""
                                    type="file"
                                    id="contained-button-metadata-file"
                                    onChange={handleMetadataChange}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="contained-button-metadata-file">
                                    <Button variant="contained" color="primary" component="span" sx={{ marginRight: 2 }}>
                                        <DriveFolderUploadIcon sx={{ marginRight: 2 }} /> Select metadata.json folder
                                    </Button>
                                </label>
                                {selectedMetadataFiles?.length > 1 ? (<Typography variant="body2">metadata.json selected correctly </Typography>) : (<Typography variant="body2"> Please select the correct folder</Typography>)}
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" color="primary" component="span" onClick={handleMetadataSubmission} sx={{ marginTop: 2, marginBottom: 2 }}>
                                upload metadata <PublishIcon sx={{ marginLeft: 2 }} />
                            </Button>
                        </Grid>
                        {metadataCid ? (
                            <Grid item xs={12}>
                                <Typography variant="body2">METADATA IPFS LINK: <Link href={process.env.REACT_APP_IPFS_ENDPOINT + metadataCid + "/metadata.json"} target="_blank">{metadataCid}</Link></Typography>
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

export default IpfsTokenUploader;