import { createStackNavigator } from '@react-navigation/stack';
import TrophyList from './TrophyList';
import TrophyDetail from './TrophyDetail';

const Stack = createStackNavigator();

const TrophyRoutes = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TrophyList" component={TrophyList} />
      <Stack.Screen name="TrophyDetail" component={TrophyDetail} />
    </Stack.Navigator>
  );
};

export default TrophyRoutes;