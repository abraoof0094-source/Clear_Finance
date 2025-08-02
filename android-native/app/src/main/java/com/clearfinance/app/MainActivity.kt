package com.clearfinance.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material.icons.filled.TrackChanges
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.clearfinance.app.screens.*
import com.clearfinance.app.ui.theme.ClearFinanceTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ClearFinanceTheme {
                ClearFinanceApp()
            }
        }
    }
}

sealed class BottomNavItem(
    val route: String,
    val icon: ImageVector,
    val label: String
) {
    object Records : BottomNavItem("records", Icons.Default.Receipt, "Records")
    object Analysis : BottomNavItem("analysis", Icons.Default.Analytics, "Analysis")
    object Tracker : BottomNavItem("tracker", Icons.Default.TrackChanges, "Tracker")
    object Budgets : BottomNavItem("budgets", Icons.Default.Savings, "Budgets")
    object Categories : BottomNavItem("categories", Icons.Default.Category, "Categories")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClearFinanceApp() {
    val navController = rememberNavController()
    val items = listOf(
        BottomNavItem.Records,
        BottomNavItem.Analysis,
        BottomNavItem.Tracker,
        BottomNavItem.Budgets,
        BottomNavItem.Categories
    )

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                contentColor = Color(0xFF22C55E) // Green theme from your app
            ) {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination

                items.forEach { item ->
                    NavigationBarItem(
                        icon = { 
                            Icon(
                                item.icon, 
                                contentDescription = item.label,
                                tint = if (currentDestination?.hierarchy?.any { it.route == item.route } == true) 
                                    Color(0xFF22C55E) else Color.Gray
                            ) 
                        },
                        label = { 
                            Text(
                                item.label,
                                color = if (currentDestination?.hierarchy?.any { it.route == item.route } == true) 
                                    Color(0xFF22C55E) else Color.Gray
                            ) 
                        },
                        selected = currentDestination?.hierarchy?.any { it.route == item.route } == true,
                        onClick = {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFF22C55E),
                            selectedTextColor = Color(0xFF22C55E),
                            unselectedIconColor = Color.Gray,
                            unselectedTextColor = Color.Gray,
                            indicatorColor = Color(0xFF22C55E).copy(alpha = 0.1f)
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = BottomNavItem.Records.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(BottomNavItem.Records.route) { RecordsScreen() }
            composable(BottomNavItem.Analysis.route) { AnalysisScreen() }
            composable(BottomNavItem.Tracker.route) { TrackerScreen() }
            composable(BottomNavItem.Budgets.route) { BudgetsScreen() }
            composable(BottomNavItem.Categories.route) { CategoriesScreen() }
        }
    }
}
