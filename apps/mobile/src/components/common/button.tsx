import { Pressable, Text } from 'react-native';

type MobileButtonProps = {
  label: string;
  onPress?: () => void;
};

export function MobileButton({ label, onPress }: MobileButtonProps) {
  return (
    <Pressable
      className="rounded-md bg-blue-600 px-4 py-3 active:bg-blue-700"
      onPress={onPress}
    >
      <Text className="text-center font-semibold text-white">{label}</Text>
    </Pressable>
  );
}
