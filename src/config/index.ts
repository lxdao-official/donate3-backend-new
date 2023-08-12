import abi from 'src/config/abi';

const CONTRACT_MAP = {
  5: '0xc12abd5F6084fC9Bdf3e99470559A80B06783c40', //goerli
  80001: '0xc12abd5F6084fC9Bdf3e99470559A80B06783c40', //mumbai
  137: '0x0049c7684a551e581D8de08fD2827dFF9808d162', //polygon
  59144: '0x3a42ddc676f6854730151750f3dbd0ebfe3c6cd3', //linea
  42161: '0x0049c7684a551e581D8de08fD2827dFF9808d162', //arbitrum
  10: '0x0049c7684a551e581D8de08fD2827dFF9808d162', //optimism
  1: '0x3a42DDc676F6854730151750f3dBD0ebFE3c6CD3', //eth mainnet
};

const RPC_MAP = {
  5: 'https://goerli.infura.io/v3/6959166847ff4ba499178f3d110c920f',
  80001: 'https://polygon-mumbai.infura.io/v3/6959166847ff4ba499178f3d110c920f',
  137: 'https://polygon-mainnet.infura.io/v3/6959166847ff4ba499178f3d110c920f',
  59144: 'https://linea-mainnet.infura.io/v3/6959166847ff4ba499178f3d110c920f', //linea
  42161:
    'https://arbitrum-mainnet.infura.io/v3/6959166847ff4ba499178f3d110c920f', //arbitrum
  10: 'https://optimism-mainnet.infura.io/v3/6959166847ff4ba499178f3d110c920f', //optimism
  1: 'https://mainnet.infura.io/v3/6959166847ff4ba499178f3d110c920f', //eth mainnet
};
export default { CONTRACT_MAP, abi, RPC_MAP };
