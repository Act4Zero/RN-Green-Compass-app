import React from 'react';

interface LocateButtonProps {
  onPress: () => void;
  isLoading?: boolean;
}

declare const LocateButton: React.FC<LocateButtonProps>;
export default LocateButton;
