import React, { useEffect, useState, useContext } from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Typography, Box, Grid, TextField, Pagination, Paper, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { linkStyle } from '../../style/muiStyle';
import { getKRC721TokenURI } from '../../utils/contractInterface';
import GlobalStateContext from '../../provider/GlobalState';
import { cutStringAfterWords } from '../../utils/helpers';
import ErrorIcon from '@mui/icons-material/Error';

const itemsPerPage = 50;

const KRC721NftCard = ({ metadata, key }) => {

    const [imageSrc, setImageSrc] = useState(null);

    const downloadImage = async (imageUrl) => {
        try {
            fetch(imageUrl)
                .then((response) => response.blob())
                .then((blob) => {
                    setImageSrc(URL.createObjectURL(blob));
                })
                .catch((error) => {
                    console.error("KRCNftCard Error downloading image:", error);
                });
        }
        catch (error) {
            console.warn("KRC721NftCard downloading image error: ", error);
        }
    };
    useEffect(() => {
        console.log("KRCNftCard metadata: ", metadata);
        const imageUrl = metadata.image.replace("ipfs://", process.env.REACT_APP_IPFS_ENDPOINT);
        downloadImage(imageUrl);
    }, [metadata]);

    if (!metadata) return (<><ErrorIcon /> <Typography variant='h5'> Metadata not defined</Typography></>)

    return (<>
        <Grid item xs={6} sm={4} key={key}>
            <Card sx={{
                maxWidth: 345, minWidth: 200, height: 550, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: 2
            }}>
                <CardActionArea sx={{ maxWidth: '100%', height: "150px" }}>
                    {imageSrc ? (<CardMedia
                        component="img"
                        height="auto"
                        image={imageSrc}
                        alt="Nft Image"
                        sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />) : <ErrorIcon />}
                </CardActionArea>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box>
                        <Typography variant='h6'> Name </Typography>
                        <Typography variant="body" >{cutStringAfterWords(metadata.name, 7)} </Typography>
                    </Box>

                </CardContent>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box>
                        <Typography variant='h6'> Description </Typography>
                        <Typography variant="body" >{cutStringAfterWords(metadata.description, 35)} </Typography>
                    </Box>
                </CardContent>
                <CardContent>
                    <Link to={'/nft-detail/' + metadata.collectionAddress + '/' + metadata.tokenId} style={linkStyle}>
                        <Typography variant="body" sx={{ color: 'primary.main', textDecoration: 'underline' }}> #{metadata.tokenId} token detail</Typography>
                    </Link>
                </CardContent>
            </Card>
        </Grid >
    </>)
}

const KRC721NftCards = ({ tokenSupply, collectionAddress }) => {

    const [metadataArray, setMetadataArray] = useState([]);
    const [metadataFilteredArray, setMetadataFilteredArray] = useState([]);
    const [searchKey, setSearchKey] = useState('');
    const [page, setPage] = useState(1);
    const { globalState } = useContext(GlobalStateContext);

    const downloadMetadata = async (tokenArray) => {
        const downloadedMetadataArray = await Promise.all(tokenArray.map(async (tokenId) => {
            try {
                const ipfsUri = await getKRC721TokenURI(globalState.ethersProvider, collectionAddress, tokenId);
                const httpUrl = ipfsUri.replace("ipfs://", process.env.REACT_APP_IPFS_ENDPOINT);
                const response = await fetch(httpUrl);
                const metadata = await response.json();
                if (metadata) {
                    return { ...metadata, tokenId, collectionAddress };
                }
                return null;
            } catch (error) {
                console.error('KRC721NftCards: ', error);
                return null;
            }
        }));
        setMetadataArray(downloadedMetadataArray.filter(item => item));
    }

    useEffect(() => {
        const tokenArray = Array.from({ length: tokenSupply }, (_, index) => index + 1);
        downloadMetadata(tokenArray);
    }, [tokenSupply])

    useEffect(() => {
        setMetadataFilteredArray(metadataArray.filter((item) => {
            if (item.name.toLowerCase().includes(searchKey) || item.description.toLowerCase().includes(searchKey)) return item;
        }));
    }, [metadataArray, searchKey]);

    const handleSearchChange = (event) => {
        setSearchKey(event.target.value.toLowerCase());
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const displayItems = metadataFilteredArray.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    return (
        <Box textAlign={'center'}>
            <Paper elevation={3} sx={{ padding: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}> <Typography variant='h6'>TOKEN LIST</Typography></Grid>
                    <Grid item xs={12}> <TextField label="Search (name, description)"
                        value={searchKey}
                        onChange={handleSearchChange}
                        sx={{ width: '100%' }} /> </Grid>
                    {displayItems.map((metadata, index) => (
                        <KRC721NftCard metadata={metadata} key={index} />
                    ))}
                </Grid>
                <Grid item xs={12}>
                    <Box Box display="flex" justifyContent="center" my={2}>
                        <Pagination
                            count={Math.ceil(metadataFilteredArray.length / itemsPerPage)}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                        />
                    </Box>
                </Grid>
            </Paper>
        </Box >
    );
}

export default KRC721NftCards;