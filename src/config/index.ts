import abi from 'src/config/abi';
import abiUid from 'src/config/abi-uid';

const CONTRACT_MAP = {
  11155111: '0xf1f5219C777E44BCd2c2C43b6aCe2458169c0579',
  1: '0xDD935a5aAC5Ae89E4A4b3f729C58562246A5fB01', //eth mainnet
  10: '0xa753c59E7aF6d7331ddF57Db7954bB234e470023', //optimism
  59144: '0x58706AC79f4A3d63519A623eE1a03f37afe59620', //linea
  42161: '0x5e0A4a381590B955c53646b0483B86F4AD78e8FE', //arbitrum
  5: '0xBe0bB0e92426334C5F2Ef488D2dC741065200B79', //goerli
  420: '0x39fF8a675ffBAfc177a7C54556b815163521a8B7',
  // 80001: '0xc12abd5F6084fC9Bdf3e99470559A80B06783c40', //mumbai
  // 137: '0x0049c7684a551e581D8de08fD2827dFF9808d162', //polygon
};

const RPC_MAP = {
  11155111: `https://sepolia.infura.io/v3/`, //sepolia
  5: `https://goerli.infura.io/v3/`,
  80001: `https://polygon-mumbai.infura.io/v3/`,
  137: 'https://polygon-mainnet.infura.io/v3/',
  59144: `https://linea-mainnet.infura.io/v3/`, //linea
  42161: `https://arbitrum-mainnet.infura.io/v3/`, //arbitrum
  10: `https://optimism-mainnet.infura.io/v3/`, //optimism
  1: `https://mainnet.infura.io/v3/`, //eth mainnet
  420: `https://optimism-goerli.infura.io/v3/`,
};

const UID_CONTRACT_MAP = {
  11155111: '0xc2679fbd37d54388ce493f1db75320d236e1815e',
  420: '0x5e0A4a381590B955c53646b0483B86F4AD78e8FE',
  1: '0xa753c59E7aF6d7331ddF57Db7954bB234e470023',
  10: '0x9b06451B45C92791Aad1005f1AC5eeb4cad78ff4',
  59144: '0xD880809f80A62B6779D5015197FF6867175A471f',
  42161: '0x3a42DDc676F6854730151750f3dBD0ebFE3c6CD3',
  5: ' 0x79a2E9cA13dC238774F8a11550331d1A6659E3F',
};

const useUidChainId = [420, 11155111];

const TEST_CHAIN_ID = [11155111, 5, 80001, 420];

export default {
  CONTRACT_MAP,
  abi,
  RPC_MAP,
  abiUid,
  UID_CONTRACT_MAP,
  useUidChainId,
  TEST_CHAIN_ID,
};
