import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { getEIP1559Params } from '../utils/gas';

const deployStorage: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy, execute } = deployments
  const {
    admin,
  } = await getNamedAccounts()
  const params = await getEIP1559Params(hre.ethers.provider)
  await deploy("LilypadStorage", {
    from: admin,
    args: [],
    log: true,
    ...params,
  })
  await execute(
    'LilypadStorage',
    {
      from: admin,
      log: true,
      ...params,
    },
    'initialize',
  )
  return true
}

deployStorage.id = 'deployStorage'

export default deployStorage
