import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { getEIP1559Params } from '../utils/gas';

const deployPayments: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy, execute } = deployments
  const {
    admin,
  } = await getNamedAccounts()
  const params = await getEIP1559Params(hre.ethers.provider)
  await deploy("LilypadPayments", {
    from: admin,
    args: [],
    log: true,
    ...params,
  })

  const tokenContract = await deployments.get('LilypadToken')
  const paymentsContract = await deployments.get('LilypadPayments')

  await execute(
    'LilypadPayments',
    {
      from: admin,
      log: true,
      ...params,
    },
    'initialize',
    tokenContract.address,
  )

  await execute(
    'LilypadToken',
    {
      from: admin,
      log: true,
      ...params,
    },
    'setControllerAddress',
    paymentsContract.address,
  )

  return true
}

deployPayments.id = 'deployPayments'

export default deployPayments
