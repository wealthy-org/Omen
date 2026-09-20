export const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
export const TX_HASH_REGEX = /^0x[a-fA-F0-9]{10,}$/;

export const isValidEvmAddress = (address?: string | null): boolean => {
  if (!address || typeof address !== "string") {
    return false;
  }
  return EVM_ADDRESS_REGEX.test(address.trim());
};

export const isValidTxHash = (hash?: string | null): boolean => {
  if (!hash || typeof hash !== "string") {
    return false;
  }
  return TX_HASH_REGEX.test(hash.trim());
};
