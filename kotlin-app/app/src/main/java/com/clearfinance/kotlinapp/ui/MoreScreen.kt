package com.clearfinance.kotlinapp.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun MoreScreen(onNavigate: (String) -> Unit) {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("More")
        Button(onClick = { onNavigate("tracker") }, modifier = Modifier.padding(top = 8.dp)) {
            Text("Open Tracker")
        }
        Button(onClick = { onNavigate("records") }, modifier = Modifier.padding(top = 8.dp)) {
            Text("Open Records")
        }
    }
}
