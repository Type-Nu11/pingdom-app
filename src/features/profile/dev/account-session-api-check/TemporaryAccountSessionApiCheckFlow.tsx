import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ApiCheckScreen from '../../screens/ApiCheckScreen';
import {
  TemporaryMapRankingApiCheckList,
  TemporaryMapRankingApiCheckPage,
  type TemporaryMapRankingEndpoint,
} from '../map-ranking-api-check';
import {
  TemporaryPlaceExplorationApiCheckList,
  TemporaryPlaceExplorationApiCheckPage,
  type TemporaryPlaceExplorationEndpoint,
} from '../place-exploration-api-check';
import TemporaryAccountSessionApiCheckList from './TemporaryAccountSessionApiCheckList';
import TemporaryAccountSessionApiCheckPage from './TemporaryAccountSessionApiCheckPage';
import type { TemporaryAccountSessionEndpoint } from './model';

type Props = {
  onExit: () => void;
};

type TemporaryApiCheckStackParamList = {
  Endpoint: { endpoint: TemporaryAccountSessionEndpoint };
  List: undefined;
  MapRankingEndpoint: { endpoint: TemporaryMapRankingEndpoint };
  PlaceEndpoint: { endpoint: TemporaryPlaceExplorationEndpoint };
};

const Stack = createNativeStackNavigator<TemporaryApiCheckStackParamList>();

/**
 * Temporary device-QA navigator for the #161, #165, #166, #168, and #190 endpoints.
 * Keep the place routes when removing the account, notification, and travel-schedule checks.
 */
export default function TemporaryAccountSessionApiCheckFlow({ onExit }: Props) {
  return (
    <Stack.Navigator initialRouteName="List" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="List">
        {({ navigation }) => (
          <ApiCheckScreen
            footer={(
              <>
                <TemporaryAccountSessionApiCheckList
                  onSelect={(endpoint) => navigation.navigate('Endpoint', { endpoint })}
                />
                <TemporaryPlaceExplorationApiCheckList
                  onSelect={(endpoint) => navigation.navigate('PlaceEndpoint', { endpoint })}
                />
                <TemporaryMapRankingApiCheckList
                  onSelect={(endpoint) => navigation.navigate('MapRankingEndpoint', { endpoint })}
                />
              </>
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
      <Stack.Screen name="PlaceEndpoint">
        {({ navigation, route }) => (
          <TemporaryPlaceExplorationApiCheckPage
            endpoint={route.params.endpoint}
            onBack={navigation.goBack}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MapRankingEndpoint">
        {({ navigation, route }) => (
          <TemporaryMapRankingApiCheckPage
            endpoint={route.params.endpoint}
            onBack={navigation.goBack}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
