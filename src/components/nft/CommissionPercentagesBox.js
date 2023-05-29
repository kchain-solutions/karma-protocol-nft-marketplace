import React from "react";
import { Grid, Box, Typography, Divider, Paper } from "@mui/material";

const CommissionPercentagesBox = ({ commissionPercentages }) => {

    return (<>
        <Paper elevation={3} sx={{ padding: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h5"> COMMISSIONS ON SALES </Typography>
                </Grid>
                <Grid item xs={8}>
                    <Typography variant="body2"> Token owner profit: </Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography variant="body2" sx={{ color: 'main.primary' }}> {commissionPercentages?.sellerCommissionPecentage}% </Typography>
                </Grid>
                <Grid item xs={12}><Divider /></Grid>
                <Grid item xs={8}>
                    <Typography variant="body2"> Kollection creator commission: </Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography variant="body2" sx={{ color: 'main.primary' }}> {commissionPercentages?.saleCommissionPercentage}% </Typography>
                </Grid>
                <Grid item xs={12}><Divider /></Grid>
                <Grid item xs={8}>
                    <Typography variant="body2"> Karma DAO donation: </Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography variant="body2" sx={{ color: 'main.primary' }}> {commissionPercentages?.krmCommissionPercentage}% </Typography>
                </Grid>
                <Grid item xs={12}><Divider /></Grid>
                <Grid item xs={8}>
                    <Typography variant="body2"> Beneficiary commission: </Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography variant="body2" sx={{ color: 'main.primary' }}> {commissionPercentages?.beneficiaryCommissionPercentage}% </Typography>
                </Grid>
            </Grid>
        </Paper>

    </>);
}

export default CommissionPercentagesBox;