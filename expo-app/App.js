import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

// Your exact categories from the web app
const categories = [
  {
    name: "Income Sources",
    emoji: "💰",
    type: "INCOME",
    subcategories: 6,
    color: "green",
  },
  {
    name: "Fixed Household Expenses",
    emoji: "🏠",
    type: "EXPENSE",
    subcategories: 9,
    color: "red",
  },
  {
    name: "Family & Personal Living",
    emoji: "👨‍👩‍👧‍👦",
    type: "EXPENSE",
    subcategories: 11,
    color: "red",
  },
  {
    name: "Insurance",
    emoji: "🛡️",
    type: "EXPENSE",
    subcategories: 5,
    color: "red",
  },
  {
    name: "Investments",
    emoji: "📈",
    type: "EXPENSE",
    subcategories: 10,
    color: "red",
  },
  {
    name: "Loans & EMI Payments",
    emoji: "💳",
    type: "EXPENSE",
    subcategories: 6,
    color: "red",
  },
  {
    name: "Lifestyle & Discretionary",
    emoji: "🎪",
    type: "EXPENSE",
    subcategories: 7,
    color: "red",
  },
  {
    name: "Savings & Emergency Funds",
    emoji: "🏦",
    type: "EXPENSE",
    subcategories: 4,
    color: "red",
  },
  {
    name: "Miscellaneous / One-Time",
    emoji: "📦",
    type: "EXPENSE",
    subcategories: 6,
    color: "red",
  },
];

// Sample expense data
const expenseData = [
  {
    id: 1,
    title: "Grocery Shopping",
    category: "Food",
    amount: 45.67,
    date: "Today",
  },
  {
    id: 2,
    title: "Gas Station",
    category: "Transport",
    amount: 32.5,
    date: "Yesterday",
  },
  {
    id: 3,
    title: "Restaurant",
    category: "Food",
    amount: 28.9,
    date: "2 days ago",
  },
  {
    id: 4,
    title: "Coffee Shop",
    category: "Food",
    amount: 5.75,
    date: "3 days ago",
  },
  {
    id: 5,
    title: "Grocery Shopping",
    category: "Food",
    amount: 67.23,
    date: "4 days ago",
  },
];

function Header({ title }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="menu" size={24} color="#22C55E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Clear Finance</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="search" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RecordsScreen() {
  const totalSpent = expenseData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Header title="Records" />

      <ScrollView style={styles.content}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Spent This Month</Text>
          <Text style={styles.summaryAmount}>${totalSpent.toFixed(2)}</Text>
        </View>

        {/* Recent Transactions */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>

        {expenseData.map((item) => (
          <View key={item.id} style={styles.recordItem}>
            <View style={styles.recordIcon}>
              <Ionicons name="receipt-outline" size={24} color="#22C55E" />
            </View>
            <View style={styles.recordDetails}>
              <Text style={styles.recordTitle}>{item.title}</Text>
              <Text style={styles.recordSubtitle}>
                {item.category} • {item.date}
              </Text>
            </View>
            <Text style={styles.recordAmount}>-${item.amount}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function AnalysisScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Analysis" />
      <View style={styles.centerContainer}>
        <Text style={styles.screenTitle}>Analysis</Text>
        <Text style={styles.screenSubtitle}>
          Charts and analytics coming soon!
        </Text>
      </View>
    </SafeAreaView>
  );
}

function TrackerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Tracker" />
      <View style={styles.centerContainer}>
        <Text style={styles.screenTitle}>Tracker</Text>
        <Text style={styles.screenSubtitle}>
          Expense tracking features coming soon!
        </Text>
      </View>
    </SafeAreaView>
  );
}

function BudgetsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Budgets" />
      <View style={styles.centerContainer}>
        <Text style={styles.screenTitle}>Budgets</Text>
        <Text style={styles.screenSubtitle}>
          Budget management coming soon!
        </Text>
      </View>
    </SafeAreaView>
  );
}

function CategoriesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Categories" />

      <ScrollView style={styles.content}>
        <Text style={styles.categoryHeader}>All Categories</Text>

        {categories.map((category, index) => (
          <TouchableOpacity key={index} style={styles.categoryItem}>
            <View style={styles.categoryLeft}>
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              </View>
              <View style={styles.categoryDetails}>
                <View style={styles.categoryTitleRow}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <View
                    style={[
                      styles.categoryBadge,
                      category.type === "INCOME"
                        ? styles.incomeBadge
                        : styles.expenseBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryBadgeText,
                        category.type === "INCOME"
                          ? styles.incomeBadgeText
                          : styles.expenseBadgeText,
                      ]}
                    >
                      {category.type}
                    </Text>
                  </View>
                </View>
                <Text style={styles.categorySubtitle}>
                  {category.subcategories} subcategories
                </Text>
              </View>
            </View>
            <View style={styles.categoryRight}>
              <Ionicons name="chevron-forward" size={20} color="#666" />
              <TouchableOpacity style={styles.menuButton}>
                <Text style={styles.menuDots}>⋯</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Records") {
              iconName = "clipboard-outline";
            } else if (route.name === "Analysis") {
              iconName = "pie-chart-outline";
            } else if (route.name === "Tracker") {
              iconName = "target-outline";
            } else if (route.name === "Budgets") {
              iconName = "wallet-outline";
            } else if (route.name === "Categories") {
              iconName = "folder-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#22C55E",
          tabBarInactiveTintColor: "#999",
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "white",
            borderTopWidth: 1,
            borderTopColor: "#e5e5e5",
            paddingBottom: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
        })}
      >
        <Tab.Screen name="Records" component={RecordsScreen} />
        <Tab.Screen name="Analysis" component={AnalysisScreen} />
        <Tab.Screen name="Tracker" component={TrackerScreen} />
        <Tab.Screen name="Budgets" component={BudgetsScreen} />
        <Tab.Screen name="Categories" component={CategoriesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22C55E",
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryCard: {
    backgroundColor: "#22C55E",
    margin: 0,
    marginTop: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  summaryAmount: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginVertical: 8,
  },
  recordItem: {
    backgroundColor: "white",
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  recordDetails: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  recordSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  recordAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  },
  addButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22C55E",
  },
  screenSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
  },
  categoryHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#EAB308",
    marginTop: 16,
    marginBottom: 16,
  },
  categoryItem: {
    backgroundColor: "white",
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  incomeBadge: {
    backgroundColor: "#dcfce7",
  },
  expenseBadge: {
    backgroundColor: "#fee2e2",
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "500",
  },
  incomeBadgeText: {
    color: "#166534",
  },
  expenseBadgeText: {
    color: "#991b1b",
  },
  categorySubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  categoryRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    marginLeft: 8,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  menuDots: {
    fontSize: 18,
    color: "#1f2937",
    fontWeight: "bold",
  },
});
