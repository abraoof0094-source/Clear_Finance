import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

// Sample data matching your web app
const expenseData = [
  { id: 1, title: 'Grocery Shopping', category: 'Food', amount: 45.67, date: 'Today' },
  { id: 2, 'Gas Station', category: 'Transport', amount: 32.50, date: 'Yesterday' },
  { id: 3, title: 'Restaurant', category: 'Food', amount: 28.90, date: '2 days ago' },
  { id: 4, title: 'Coffee Shop', category: 'Food', amount: 5.75, date: '3 days ago' }
];

const categories = [
  'Income Sources',
  'Fixed Household Expenses', 
  'Variable Household Expenses',
  'Personal Care',
  'Transportation',
  'Food & Dining',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education'
];

function RecordsScreen() {
  const totalSpent = expenseData.reduce((sum, item) => sum + item.amount, 0);
  
  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#22C55E" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Records</Text>
      </View>
      
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
            <Text style={styles.recordSubtitle}>{item.category} • {item.date}</Text>
          </View>
          <Text style={styles.recordAmount}>-${item.amount}</Text>
        </View>
      ))}
      
      {/* Add Button */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </ScrollView>
  );
}

function AnalysisScreen() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.screenTitle}>Analysis</Text>
      <Text style={styles.screenSubtitle}>Charts and analytics coming soon!</Text>
    </View>
  );
}

function TrackerScreen() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.screenTitle}>Tracker</Text>
      <Text style={styles.screenSubtitle}>Expense tracking features coming soon!</Text>
    </View>
  );
}

function BudgetsScreen() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.screenTitle}>Budgets</Text>
      <Text style={styles.screenSubtitle}>Budget management coming soon!</Text>
    </View>
  );
}

function CategoriesScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>
      {categories.map((category, index) => (
        <TouchableOpacity key={index} style={styles.categoryItem}>
          <View style={styles.categoryIcon}>
            <Ionicons name="folder-outline" size={24} color="#22C55E" />
          </View>
          <Text style={styles.categoryName}>{category}</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            
            if (route.name === 'Records') {
              iconName = 'receipt-outline';
            } else if (route.name === 'Analysis') {
              iconName = 'analytics-outline';
            } else if (route.name === 'Tracker') {
              iconName = 'trending-up-outline';
            } else if (route.name === 'Budgets') {
              iconName = 'wallet-outline';
            } else if (route.name === 'Categories') {
              iconName = 'folder-outline';
            }
            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#22C55E',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e5e5e5',
            paddingBottom: 5,
            height: 60,
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
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#22C55E',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  summaryCard: {
    backgroundColor: '#22C55E',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  summaryAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  recordItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recordDetails: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  recordSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  recordAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  categoryItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
});