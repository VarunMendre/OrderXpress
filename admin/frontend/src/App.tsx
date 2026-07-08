import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { AuthScreen } from "./screens/AuthScreen";

export function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <AuthScreen />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  container: {
    flex: 1,
    padding: 24,
  },
});
