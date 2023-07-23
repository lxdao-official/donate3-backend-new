import abi from 'src/config/abi';

const CONTRACT_MAP = {
  5: '0x888702fa547Ba124f8d8440a4DB95A6ddA81A737',
  80001: '0xac511F51C3a89639072144aB539192eca267F823',
  137: '0x0049c7684a551e581D8de08fD2827dFF9808d162',
};

const RPC_MAP = {
  5: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  80001: '',
  137: '',
};
export default { CONTRACT_MAP, abi, RPC_MAP };
