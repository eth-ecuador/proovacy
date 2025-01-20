import fs from "fs";
import path from "path";
import { networks } from "./helpers/networks";
import yargs from "yargs";
import {
  CallData,
  stark,
  RawArgs,
  transaction,
  extractContractHashes,
  DeclareContractPayload,
  UniversalDetails,
  isSierra,
} from "starknet";
import { DeployContractParams, Network } from "./types";
import { green, red, yellow } from "./helpers/colorize-log";
import { getTxVersion } from "./helpers/fees";

const argv = yargs(process.argv.slice(2))
  .option("network", {
    type: "string",
    description: "Specify the network",
    demandOption: true,
  })
  .option("reset", {
    alias: "nr",
    type: "boolean",
    description: "Do not reset deployments (keep existing deployments)",
    default: true,
  })
  .option("fee", {
    type: "string",
    description: "Specify the fee token",
    demandOption: false,
    choices: ["eth", "strk"],
    default: "eth",
  })
  .parseSync();

const networkName: string = argv.network;
const resetDeployments: boolean = argv.reset;
const feeToken: string = argv.fee;

let deployments = {};
let deployCalls = [];

const { provider, deployer }: Network = networks[networkName];

const declareIfNot_NotWait = async (payload: DeclareContractPayload, options?: UniversalDetails) => {
  const declareContractPayload = extractContractHashes(payload);
  try {
    await provider.getClassByHash(declareContractPayload.classHash);
  } catch (error) {
    try {
      const isSierraContract = isSierra(payload.contract);
      const txVersion = await getTxVersion(networks[networkName], feeToken, isSierraContract);
      const { transaction_hash } = await deployer.declare(payload, {
        ...options,
        version: txVersion,
      });
      if (networkName === "sepolia" || networkName === "mainnet") {
        await provider.waitForTransaction(transaction_hash);
      }
    } catch (e) {
      console.error(red("Error declaring contract:"), e);
      throw e;
    }
  }
  return {
    classHash: declareContractPayload.classHash,
  };
};

const deployContract_NotWait = async (payload: {
  salt: string;
  classHash: string;
  constructorCalldata: RawArgs;
}) => {
  try {
    const { calls, addresses } = transaction.buildUDCCall(
      payload,
      deployer.address
    );
    deployCalls.push(...calls);
    return {
      contractAddress: addresses[0],
    };
  } catch (error) {
    console.error(red("Error building UDC call:"), error);
    throw error;
  }
};

const findContractFile = (
  contract: string,
  fileType: "compiled_contract_class" | "contract_class"
): string => {
  const targetDir = path.resolve(__dirname, "../contracts/target/dev");
  const files = fs.readdirSync(targetDir);
  const pattern = new RegExp(`.*${contract}\\.${fileType}\\.json`);
  const matchingFile = files.find((file) => pattern.test(file));

  if (!matchingFile) {
    throw new Error(
      `Could not find ${fileType} file for contract "${contract}". Try removing snfoundry/contracts/target, then run 'yarn compile'`
    );
  }

  return path.join(targetDir, matchingFile);
};

const deployReferralContract = async (params: DeployContractParams): Promise<{ classHash: string; address: string }> => {
  const { contract, options } = params;

  try {
    await deployer.getContractVersion(deployer.address);
  } catch (e) {
    if (e.toString().includes("Contract not found")) {
      const errorMessage = `The wallet you're using to deploy the contract is not deployed in the ${networkName} network.`;
      console.error(red(errorMessage));
      throw new Error(errorMessage);
    } else {
      console.error(red("Error getting contract version: "), e);
      throw e;
    }
  }

  let compiledContractCasm;
  let compiledContractSierra;

  try {
    compiledContractCasm = JSON.parse(
      fs.readFileSync(findContractFile(contract, "compiled_contract_class")).toString("ascii")
    );
    compiledContractSierra = JSON.parse(
      fs.readFileSync(findContractFile(contract, "contract_class")).toString("ascii")
    );
  } catch (error) {
    console.error(red("Error reading contract files: "), error);
    return {
      classHash: "",
      address: "",
    };
  }

  console.log(yellow("Deploying ReferralContract"));

  let { classHash } = await declareIfNot_NotWait(
    {
      contract: compiledContractSierra,
      casm: compiledContractCasm,
    },
    options
  );

  let randomSalt = stark.randomAddress();
  let { contractAddress } = await deployContract_NotWait({
    salt: randomSalt,
    classHash,
    constructorCalldata: [],
  });

  console.log(green("ReferralContract Deployed at "), contractAddress);

  deployments["ReferralContract"] = {
    classHash,
    address: contractAddress,
    contract,
  };

  return { classHash, address: contractAddress };
};

const executeDeployCalls = async (options?: UniversalDetails) => {
    if (deployCalls.length < 1) {
      throw new Error(red("No contract to deploy. Please prepare the contracts with `deployReferralContract`"));
    }
  
    try {
      const txVersion = await getTxVersion(networks[networkName], feeToken);
      let { transaction_hash } = await deployer.execute(deployCalls, {
        ...options,
        version: txVersion,
      });
      if (networkName === "sepolia" || networkName === "mainnet") {
        const receipt = await provider.waitForTransaction(transaction_hash);
        if ((receipt as any).status === "REJECTED") {
          throw new Error(red(`Deploy Failed: ${(receipt as any).revert_error || 'Unknown error'}`));
        }
      }
      console.log(green("Deploy Calls Executed at "), transaction_hash);
    } catch (error) {
      if (deployCalls.length > 100) {
        let half = Math.ceil(deployCalls.length / 2);
        let firstHalf = deployCalls.slice(0, half);
        let secondHalf = deployCalls.slice(half);
        deployCalls = firstHalf;
        await executeDeployCalls(options);
        deployCalls = secondHalf;
        await executeDeployCalls(options);
      } else {
        throw error;
      }
    }
  };
  

const exportDeployments = () => {
  const networkPath = path.resolve(__dirname, `../deployments/${networkName}_latest.json`);
  if (!resetDeployments && fs.existsSync(networkPath)) {
    const currentTimestamp = new Date().getTime();
    fs.renameSync(networkPath, networkPath.replace("_latest.json", `_${currentTimestamp}.json`));
  }
  fs.writeFileSync(networkPath, JSON.stringify(deployments, null, 2));
};

export {
  deployReferralContract,
  provider,
  deployer,
  exportDeployments,
  executeDeployCalls,
  resetDeployments,
};
