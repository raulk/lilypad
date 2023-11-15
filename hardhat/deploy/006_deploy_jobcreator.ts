import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { getEIP1559Params } from '../utils/gas';

const deployJobCreator: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy, execute } = deployments
  const {
    admin,
    solver,
  } = await getNamedAccounts()
  const params = await getEIP1559Params(hre.ethers.provider)
  await deploy("LilypadOnChainJobCreator", {
    from: admin,
    args: [],
    log: true,
    ...params,
  })

  await deploy("ExampleClient", {
    from: admin,
    args: [],
    log: true,
    ...params,
  })

  const tokenContract = await deployments.get('LilypadToken')
  const jobCreator = await deployments.get('LilypadOnChainJobCreator')

  await execute(
    'LilypadOnChainJobCreator',
    {
      from: admin,
      log: true,
      ...params,
    },
    'initialize',
    tokenContract.address,
  )

  await execute(
    'ExampleClient',
    {
      from: admin,
      log: true,
      ...params,
    },
    'initialize',
    jobCreator.address,
  )

  // we set the controller of the job creator to be the solver
  // because it will be the one pulling jobs from it
  await execute(
    'LilypadOnChainJobCreator',
    {
      from: admin,
      log: true,
      ...params,
    },
    'setControllerAddress',
    solver,
  )
  return true
}

deployJobCreator.id = 'deployJobCreator'

export default deployJobCreator
