package com.clearfinance.kotlinapp.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.clearfinance.kotlinapp.MainViewModel

@Composable
fun RecordsScreen(vm: MainViewModel, onNavigate: (String) -> Unit) {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("Records", modifier = Modifier.padding(bottom = 8.dp))
        LazyColumn {
            items(vm.transactions.value) { t ->
                Card(modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(text = "Amount: ${'$'}${t.amount}")
                        Text(text = "Category: ${t.category}")
                        Text(text = "Notes: ${t.notes ?: ""}")
                        Button(onClick = { vm.deleteTransaction(t.id) }, modifier = Modifier.padding(top = 8.dp)) {
                            Text("Delete")
                        }
                    }
                }
            }
        }
        Button(onClick = { onNavigate("tracker") }, modifier = Modifier.padding(top = 12.dp)) {
            Text("Back to Tracker")
        }
    }
}
