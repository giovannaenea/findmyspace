export const formatBeds = (bedOptions) => {
  if (!bedOptions || bedOptions.length === 0) return 'N/A';
  const numberedOptions = bedOptions.sort((a, b) => a - b).map(option => option == 'Studio' ? 0 : parseInt(option[0]));
  let result = bedOptions[0];
  let consecutive = 1;
  for (let i = 1; i < bedOptions.length; i++) {
    if (numberedOptions[i] === numberedOptions[i - 1] + 1) {
      consecutive++;
    } else {
      if (consecutive > 1) result += ` - ${bedOptions[i - 1]}`;
      result += `, ${bedOptions[i]}`;
      consecutive = 1;
    }
  }
  if (consecutive > 1) result += ` - ${bedOptions[bedOptions.length - 1]}`;
  return result;
};