import {
  deployContract,
  executeDeployCalls,
  exportDeployments,
  deployer,
} from "./deploy-contract";
import {
  deployReferralContract,
  executeDeployCalls as executeReferralCalls,
  exportDeployments as exportReferralDeployments,
} from "./deploy-referral";
import { green } from "./helpers/colorize-log";

/**
 * Deploy a contract using the specified parameters.
 *
 * @example (deploy contract with contructorArgs)
 * const deployScript = async (): Promise<void> => {
 *   await deployContract(
 *     {
 *       contract: "YourContract",
 *       contractName: "YourContractExportName",
 *       constructorArgs: {
 *         owner: deployer.address,
 *       },
 *       options: {
 *         maxFee: BigInt(1000000000000)
 *       }
 *     }
 *   );
 * };
 *
 * @example (deploy contract without contructorArgs)
 * const deployScript = async (): Promise<void> => {
 *   await deployContract(
 *     {
 *       contract: "YourContract",
 *       contractName: "YourContractExportName",
 *       options: {
 *         maxFee: BigInt(1000000000000)
 *       }
 *     }
 *   );
 * };
 *
 *
 * @returns {Promise<void>}
 */
const deployScript = async (): Promise<void> => {
  await deployContract({
    contract: "YourContract",
    constructorArgs: {
      owner: deployer.address,
    },
  });

  // Deploy ReferralContract
  await deployReferralContract({
    contract: "ReferralContract",
  });
};

// deployScript()
//   .then(async () => {
//     executeDeployCalls()
//       .then(() => {
//         exportDeployments();
//         console.log(green("All Setup Done"));
//       })
//       .catch((e) => {
//         console.error(e);
//         process.exit(1); // exit with error so that non subsequent scripts are run
//       });
//   })
//   .catch(console.error);

deployScript()
  .then(async () => {
    // First deploy YourContract
    executeDeployCalls()
      .then(() => {
        exportDeployments();
        // Then deploy ReferralContract
        executeReferralCalls()
          .then(() => {
            exportReferralDeployments();
            console.log(green("All Contracts Setup Complete"));
          })
          .catch((e) => {
            console.error(e);
            process.exit(1);
          });
      })
      .catch((e) => {
        console.error(e);
        process.exit(1);
      });
  })
  .catch(console.error);

