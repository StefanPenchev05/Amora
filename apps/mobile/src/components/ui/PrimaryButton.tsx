import React from 'react';
import { ViewStyle } from 'react-native';
import GradientButton from './GradientButton';
import { lightTheme } from '../../styles/theme';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

const PrimaryButton: React.FC<Props> = ({ title, onPress, disabled, style }) => {
  return (
    <GradientButton
      title={title}
      onPress={onPress}
      disabled={disabled}
      loading={!!disabled}
      style={style}
      theme={lightTheme}
    />
  );
};

export default PrimaryButton;
