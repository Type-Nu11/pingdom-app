import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ApiCheckScreen from '../../screens/ApiCheckScreen';
import TemporaryAccountSessionApiCheckList from './TemporaryAccountSessionApiCheckList';
import TemporaryAccountSessionApiCheckPage from './TemporaryAccountSessionApiCheckPage';
import type { TemporaryAccountSessionEndpoint } from './model';

type Props = {
  onExit: () => void;
};

type TemporaryApiCheckStackParamList = {
  Endpoint: { endpoint: TemporaryAccountSessionEndpoint };
  List: undefined;
};

const Stack = createNativeStackNavigator<TemporaryApiCheckStackParamList>();

/**
 * TEMPORARY #165: This nested navigator owns all temporary routes and parameters.
 * Removal requires only restoring ApiCheckScreen in MainNavigator and deleting this directory.
 */
export default function TemporaryAccountSessionApiCheckFlow({ onExit }: Props) {
  return (
    <Stack.Navigator initialRouteName="List" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="List">
        {({ navigation }) => (
          <ApiCheckScreen
            footer={(
              <TemporaryAccountSessionApiCheckList
                onSelect={(endpoint) => navigation.navigate('Endpoint', { endpoint })}
              />
            )}
            onBack={onExit}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Endpoint">
        {({ navigation, route }) => (
          <TemporaryAccountSessionApiCheckPage
            endpoint={route.params.endpoint}
            onBack={navigation.goBack}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
