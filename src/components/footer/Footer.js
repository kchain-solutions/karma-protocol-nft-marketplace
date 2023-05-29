import React from 'react';
import { Container, Box, Typography, Link, Paper } from '@mui/material';

const Footer = () => {
    return (<>
        <Paper elevation={3}>
            <Box component="footer" sx={{ backgroundColor: 'primary.main', color: 'white', mt: 8, py: 3, minHeight: 150 }}>
                <Container maxWidth="sm">
                    <Typography variant="body1" align="center">
                        Copyright © 2023 - Powered by KChain solutions
                    </Typography>
                    <Box textAlign="center" pt={1}>
                        <Link href="https://github.com/kchain-solutions/krc-dapp" color="inherit" target="_blank" rel="noopener noreferrer">
                            Github </Link>
                    </Box>
                </Container>
            </Box>
        </Paper >
    </>);
}

export default Footer;