import { ethers } from "ethers";

export async function getEIP1559Params(provider: ethers.Provider) {
    const type = 2;
    const feeData = await provider.getFeeData();
    const maxFeePerGas = feeData.maxFeePerGas;
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
    return {
        maxFeePerGas,
        maxPriorityFeePerGas,
        type,
    };
}
