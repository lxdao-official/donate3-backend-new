import abi from 'src/config/abi';
import abiUid from 'src/config/abi-uid';

const CONTRACT_MAP = {
  11155111: '0xf1f5219C777E44BCd2c2C43b6aCe2458169c0579',
  // 5: '0xc12abd5F6084fC9Bdf3e99470559A80B06783c40', //goerli
  // 80001: '0xc12abd5F6084fC9Bdf3e99470559A80B06783c40', //mumbai
  // 137: '0x0049c7684a551e581D8de08fD2827dFF9808d162', //polygon
  // 59144: '0x3a42ddc676f6854730151750f3dbd0ebfe3c6cd3', //linea
  // 42161: '0x0049c7684a551e581D8de08fD2827dFF9808d162', //arbitrum
  // 10: '0x0049c7684a551e581D8de08fD2827dFF9808d162', //optimism
  // 1: '0x3a42DDc676F6854730151750f3dBD0ebFE3c6CD3', //eth mainnet
  // 420: '0x39fF8a675ffBAfc177a7C54556b815163521a8B7',
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
  420: '0x4200000000000000000000000000000000000021',
};

const useUidChainId = [420];

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
