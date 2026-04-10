import { Alert, Text, View } from 'react-native';
import { MobileButton } from '@/components/common/button';
import { useAppTitle } from '@/hooks/use-app-title';

export function HomeScreen() {
  const title = useAppTitle();

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-6">
      <View className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm">
        <Text className="text-sm text-slate-500">Component-based Expo App</Text>
        <Text className="mt-2 text-2xl font-semibold text-slate-900">
          {title}
        </Text>
        <Text className="mt-2 text-base text-slate-600">
          NativeWind is configured and ready for reusable UI components.
        </Text>
        <View className="mt-6">
          <MobileButton
            label="Open Starter Flow"
            onPress={() => Alert.alert('Wrectifai', 'Mobile app is ready')}
          />
        </View>
      </View>
    </View>
  );
}
