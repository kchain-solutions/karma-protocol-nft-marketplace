import { ethers, ZeroAddress } from "ethers";
import KRC721_FACTORY_ABI from "../abis/KRC721Factory.json"
import KRC721_ABI from "../abis/KRC721.json"
import KRC20_ABI from "../abis/KRC20.json"
import INVESTOR_VAULT_ABI from "../abis/InvestorVault.json"

const KRC20_ADDRESS = process.env.REACT_APP_KRC20_ADDRESS;
const KRC721_FACTORY_ADDRESS = process.env.REACT_APP_KRC721_FACTORY_ADDRESS;
const INVESTOR_VAULT_ADDRESS = process.env.REACT_APP_INVESTOR_VAULT_ADDRESS;
const GLDKRC20_ADDRESS = process.env.REACT_APP_GLDKRC20_ADDRESS;
const STABLECOIN_ADDRESS = process.env.REACT_APP_STABLECOIN_ADDRESS;


async function getKrc721Factory(signer) {
    return new ethers.Contract(KRC721_FACTORY_ADDRESS, KRC721_FACTORY_ABI, signer);
}

async function getKrc721(krc721Address, signer) {
    return new ethers.Contract(krc721Address, KRC721_ABI, signer);
}

async function getKrc20(signer) {
    return new ethers.Contract(KRC20_ADDRESS, KRC20_ABI, signer);
}

async function getInvestorVault(signer) {
    return new ethers.Contract(INVESTOR_VAULT_ADDRESS, INVESTOR_VAULT_ABI, signer);
}

async function getGldkrm(signer) {
    return new ethers.Contract(GLDKRC20_ADDRESS, KRC20_ABI, signer);
}

async function getStablecoin(signer) {
    return new ethers.Contract(STABLECOIN_ADDRESS, KRC20_ABI, signer);
}

export async function isAuthorizedMember(provider) {
    const signer = await provider.getSigner();
    const krc721Factory = await getKrc721Factory(signer);
    return krc721Factory.isAuthorizedMember(signer.address);
}

export async function isAuthorizedCreator(provider) {
    const signer = await provider.getSigner();
    const krc721Factory = await getKrc721Factory(signer);
    return await krc721Factory.isAuthorizedCreator(signer.address);
}

export async function addAuthorizedCreator(provider, memberAddr) {
    const signer = await provider.getSigner();
    const krc721Factory = await getKrc721Factory(signer);
    const tx = await krc721Factory.addAuthorizedCreator(memberAddr);
    const txW = await tx.wait();
    return txW;
}

export async function removeAuthorizedCreator(provider, memberAddr) {
    const signer = await provider.getSigner();
    const krc721Factory = await getKrc721Factory(signer);
    const tx = await krc721Factory.removeAuthorizedCreator(memberAddr);
    const txW = await tx.wait();
    return txW;
}

export async function createKrc721(provider, owner, name, symbol, maxCollectionSupply, saleCommissionPercentage, krmCommissionPercentage, beneficiaryCommissionPercentage, beneficiaryAddress, isKrc20) {
    const signer = await provider.getSigner();
    const krc721Factory = await getKrc721Factory(signer);
    const tx = await krc721Factory.createKRC721(owner, name, symbol, maxCollectionSupply, saleCommissionPercentage, krmCommissionPercentage, beneficiaryCommissionPercentage, beneficiaryAddress, isKrc20);
    const txW = await tx.wait();
    return txW;
}

export async function isKRC721AuthorizedMember(provider, krc721Address) {
    const signer = await provider.getSigner();
    const krc721 = await getKrc721(krc721Address, signer);
    const response = await krc721.isAuthorizedMember(signer.address);
    return response;
}

export async function isKRC721AuthorizedContract(provider, krc721Address) {
    let signer, krc721, _krc20Address, krc20, isAuthorized;

    try {
        signer = await provider.getSigner();
    } catch (error) {
        console.error('Error getting signer: ', error);
    }

    try {
        krc721 = await getKrc721(krc721Address, signer);
    } catch (error) {
        console.error('Error getting krc721: ', error);
    }

    try {
        _krc20Address = await krc721.getKRC20Address();
    } catch (error) {
        console.error('Error getting KRC20 address: ', error);
    }

    try {
        krc20 = await getKrc20(signer);
    } catch (error) {
        console.error('Error getting krc20: ', error);
    }

    try {
        isAuthorized = await krc20.isAuthorizedContract(krc721Address);
    } catch (error) {
        console.error('Error checking if contract is authorized: ', error);
    }

    if (isAuthorized) {
        return 0;
    }
    if (_krc20Address !== ZeroAddress && !isAuthorized) {
        return 1;
    }
    if (_krc20Address === ZeroAddress && !isAuthorized) {
        return 2;
    }
}

export async function getMaxCollectionSupply(provider, krc721Address) {
    const signer = await provider.getSigner();
    const krc721 = await getKrc721(krc721Address, signer);
    const response = await krc721.getMaxCollectionSupply();
    return response;
}

export async function getCirculatingSupply(provider, krc721Address) {
    const signer = await provider.getSigner();
    const krc721 = await getKrc721(krc721Address, signer);
    const response = await krc721.getCirculatingSupply();
    return response;
}

export async function mintKRC721(provider, krc721Address, uri) {
    const signer = await provider.getSigner();
    const krc721 = await getKrc721(krc721Address, signer);
    const tx = await krc721.mintWithTokenURI(signer.address, uri);
    const txW = await tx.wait();
    return txW;
}

export async function collectionGalleryUpdate(provider, krc721Address, tokenId, uri) {
    const signer = await provider.getSigner();
    const krc721 = await getKrc721(krc721Address, signer);
    const tx = await krc721.collectionGalleryUpdate(tokenId, uri);
    const txW = await tx.wait();
    return txW;
}

export async function getKRC721Name(provider, krc721Address) {
    const signer = await provider.getSigner();
    const krc721 = await getKrc721(krc721Address, signer);
    const response = await krc721.name();
    return response;
}

export async function getKRC721TokenURI(provider, krc721Address, tokenId) {
    const signer = await provider.getSigner();
    const krc721 = await getKrc721(krc721Address, signer);
    const response = await krc721.tokenURI(tokenId);
    return response;
}

export async function getKRC721Symbol(provider, krc721Address) {
    const signer = await provider.getSigner();
    const krc721 = await getKrc721(krc721Address, signer);
    const response = await krc721.symbol()
    return response;
}

export async function buyToken(provider, krc721Address, tokenId) {
    const signer = await provider.getSigner();
    const krc721 = await getKrc721(krc721Address, signer);
    const value = await getSalePrice(provider, krc721Address, tokenId);
    const tx = await krc721.buy(tokenId, { value: value });
    const txW = await tx.wait();
    return txW;
}

export async function setSalePrice(provider, krc721Address, salePrice, tokenId) {
    const signer = await provider.getSigner();
    const krc721 = await getKrc721(krc721Address, signer);
    const tx = await krc721.setSalePrice(tokenId, salePrice);
    const txW = await tx.wait();
    return txW;
}

export async function transferToken(provider, krc721Address, from, to, tokenId) {
    const signer = await provider.getSigner();
    const krc721 = await getKrc721(krc721Address, signer);
    const tx = await krc721.transferFrom(from, to, tokenId);
    const txW = await tx.wait();
    return txW;
}

export async function getSalePrice(provider, krc721Address, tokenId) {
    const signer = await provider.getSigner();
    const krc721 = await getKrc721(krc721Address, signer);
    const response = await krc721.tokenSalePrice(tokenId);
    return response;
}

export async function getTokenOwner(provider, krc721Address, tokenId) {
    const signer = await provider.getSigner();
    const krc721 = await getKrc721(krc721Address, signer);
    const response = await krc721.ownerOf(tokenId);
    return response;
}

export async function getBeneficiaryFromTokenId(provider, krc721Address) {
    const signer = await provider.getSigner();
    const krc721 = await getKrc721(krc721Address, signer);
    const response = await krc721.getBeneficiaryAddress();
    return response;
}

export async function getCommissionPercentages(provider, krc721Address) {
    const signer = await provider.getSigner();
    const krc721 = await getKrc721(krc721Address, signer);
    const [sc, ac, kc, sec] = await krc721.getCommissionPercentages();
    const saleCommissionPercentage = Number(sc);
    const beneficiaryCommissionPercentage = Number(ac);
    const krmCommissionPercentage = Number(kc);
    const sellerCommissionPecentage = Number(sec)
    return { saleCommissionPercentage, beneficiaryCommissionPercentage, krmCommissionPercentage, sellerCommissionPecentage }
}

export async function getInvestorVaultConversionRate(provider) {
    const signer = await provider.getSigner();
    const investorVault = await getInvestorVault(signer);
    const response = await investorVault.rate();
    return Number(response);
}

export async function buyGldkrm(provider, stablecoinAmount) {
    const signer = await provider.getSigner();
    const investorVault = await getInvestorVault(signer);
    const tx = await investorVault.buy(stablecoinAmount);
    const txW = await tx.wait();
    return txW;
}

export async function getGldkrmBalance(provider, address) {
    const signer = await provider.getSigner();
    const gldkrm = await getGldkrm(signer);
    const response = await gldkrm.balanceOf(address);
    return response;
}

export async function getStablecoinBalance(provider, address) {
    const signer = await provider.getSigner();
    const stablecoin = await getStablecoin(signer);
    const response = await stablecoin.balanceOf(address);
    return response;
}

export async function approveStablecoin(provider, stablecoinAmount) {
    const signer = await provider.getSigner();
    const stablecoin = await getStablecoin(signer);
    const tx = await stablecoin.connect(signer).approve(INVESTOR_VAULT_ADDRESS, stablecoinAmount);
    const txW = await tx.wait();
    return txW;
}



// Make offer optional