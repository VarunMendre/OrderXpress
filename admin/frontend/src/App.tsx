import { useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { AuthScreen } from "./screens/AuthScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { MenuCrudScreen } from "./screens/MenuCrudScreen";
import { MenuExtractionScreen } from "./screens/MenuExtractionScreen";
import { OrdersListScreen } from "./screens/OrdersListScreen";
import { OrderDetailsScreen } from "./screens/OrderDetailsScreen";
import { CollectionsScreen } from "./screens/CollectionsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { QrCodeScreen } from "./screens/QrCodeScreen";

export function App() {
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [screen, setScreen] = useState<"auth" | "home" | "menu" | "crud" | "qr" | "orders" | "order-details" | "collections" | "settings">("auth");
  const [selectedOrderId, setSelectedOrderId] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {!isAuthenticated || screen === "auth" ? (
          <AuthScreen
            onAuthenticated={(name, id, token) => {
              setRestaurantName(name);
              setRestaurantId(id);
              setSessionToken(token);
              setIsAuthenticated(true);
              setScreen("home");
            }}
          />
        ) : screen === "menu" ? (
          <MenuExtractionScreen
            restaurantName={restaurantName}
            location="Downtown"
            sessionToken={sessionToken}
            onBackToHome={() => setScreen("home")}
            onContinueToMenuCrud={() => setScreen("crud")}
          />
        ) : screen === "crud" ? (
          <MenuCrudScreen />
        ) : screen === "orders" ? (
          <OrdersListScreen
            onOpenOrderDetails={(orderId) => {
              setSelectedOrderId(orderId);
              setScreen("order-details");
            }}
          />
        ) : screen === "order-details" ? (
          <OrderDetailsScreen
            orderId={selectedOrderId}
            onBackToOrders={() => setScreen("orders")}
          />
        ) : screen === "collections" ? (
          <CollectionsScreen onBackToHome={() => setScreen("home")} />
        ) : screen === "settings" ? (
          <SettingsScreen onBackToHome={() => setScreen("home")} />
        ) : screen === "qr" ? (
          <QrCodeScreen
            restaurantName={restaurantName}
            restaurantId={restaurantId || "restaurant-demo-id"}
            onBackToHome={() => setScreen("home")}
          />
        ) : (
          <HomeScreen
            restaurantName={restaurantName}
            onOpenMenuExtraction={() => setScreen("menu")}
            onOpenQrGeneration={() => setScreen("qr")}
            onOpenOrdersList={() => setScreen("orders")}
            onOpenCollections={() => setScreen("collections")}
            onOpenSettings={() => setScreen("settings")}
          />
        )}
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
