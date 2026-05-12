
const triggerHaptic = async (style = 'Light') => {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle[style] });
  } catch {
    // Package not installed or running on web — ignore
  }
};

export const hapticLight = () => triggerHaptic('Light');
export const hapticMedium = () => triggerHaptic('Medium');