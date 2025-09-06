package com.clearfinance.kotlinapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ClearFinanceApp()
        }
    }
}

@Composable
fun ClearFinanceApp() {
    val navController = rememberNavController()
    val vm: MainViewModel = viewModel()

    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            NavHost(navController = navController, startDestination = Routes.TRACKER) {
                composable(Routes.TRACKER) { TrackerScreen(vm = vm, onNavigate = { route -> navController.navigate(route) }) }
                composable(Routes.ANALYSIS) { AnalysisScreen(onNavigate = { route -> navController.navigate(route) }) }
                composable(Routes.RECORDS) { RecordsScreen(vm = vm, onNavigate = { route -> navController.navigate(route) }) }
                composable(Routes.MORE) { MoreScreen(onNavigate = { route -> navController.navigate(route) }) }
            }
        }
    }
}
