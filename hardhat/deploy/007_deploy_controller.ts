import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { getEIP1559Params } from '../utils/gas';

const deployController: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy, execute } = deployments
  const {
    admin,
  } = await getNamedAccounts()
  const params = await getEIP1559Params(hre.ethers.provider)
  await deploy("LilypadController", {
    from: admin,
    args: [],
    log: true,
    ...params,
  })
  
  const controllerContract = await deployments.get('LilypadController')
  const storageContract = await deployments.get('LilypadStorage')
  const usersContract = await deployments.get('LilypadUsers')
  const mediationContract = await deployments.get('LilypadMediationRandom')
  const paymentsContract = await deployments.get('LilypadPayments')
  const jobCreatorContract = await deployments.get('LilypadOnChainJobCreator')

  await execute(
    'LilypadController',
    {
      from: admin,
      log: true,
      ...params,
    },
    'initialize',
    storageContract.address,
    usersContract.address,
    paymentsContract.address,
    mediationContract.address,
    jobCreatorContract.address,
  )

  await execute(
    'LilypadStorage',
    {
      from: admin,
      log: true,
      ...params,
    },
    'setControllerAddress',
    controllerContract.address, 
  )

  await execute(
    'LilypadPayments',
    {
      from: admin,
      log: true,
      ...params,
    },
    'setControllerAddress',
    controllerContract.address, 
  )

  await execute(
    'LilypadMediationRandom',
    {
      from: admin,
      log: true,
      ...params,
    },
    'setControllerAddress',
    controllerContract.address, 
  )

  return true
}

deployController.id = 'deployController'

export default deployController
