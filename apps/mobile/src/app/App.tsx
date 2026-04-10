import '../../global.css';
import { SafeAreaView, StatusBar } from 'react-native';
import { HomeScreen } from '@/screens/home-screen';

export function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1">
        <HomeScreen />
      </SafeAreaView>
    </>
  );
}

export default App;
