import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import {
  DEFAULT_TOKEN_SUPPLY,
} from '../utils/web3'
import { getEIP1559Params } from '../utils/gas';

const deployToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const {
    admin,
  } = await getNamedAccounts()
  // log the admin address
  console.log(`admin: ${admin}`)
  const params = await getEIP1559Params(hre.ethers.provider)
  await deploy("LilypadToken", {
    from: admin,
    args: [
      "Lilypad Token",
      "LP",
      DEFAULT_TOKEN_SUPPLY,
    ],  
    log: true,
    ...params,
  })
  return true
}

deployToken.id = 'deployToken'

export default deployToken
