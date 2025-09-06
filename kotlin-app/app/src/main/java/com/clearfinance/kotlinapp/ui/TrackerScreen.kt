package com.clearfinance.kotlinapp.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.clearfinance.kotlinapp.MainViewModel

@Composable
fun TrackerScreen(vm: MainViewModel, onNavigate: (String) -> Unit) {
    var amountText by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }

    Column(modifier = Modifier.padding(16.dp)) {
        OutlinedTextField(value = amountText, onValueChange = { amountText = it }, label = { Text("Amount") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = category, onValueChange = { category = it }, label = { Text("Category") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
        OutlinedTextField(value = notes, onValueChange = { notes = it }, label = { Text("Notes") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))

        Button(onClick = {
            val amount = amountText.toDoubleOrNull() ?: 0.0
            if (amount > 0.0) {
                vm.addTransaction(amount = amount, category = category.ifBlank { "Uncategorized" }, notes = notes.ifBlank { null })
                amountText = ""
                category = ""
                notes = ""
            }
        }, contentPadding = PaddingValues(12.dp), modifier = Modifier.padding(top = 12.dp)) {
            Text("Add Transaction")
        }

        Button(onClick = { onNavigate("records") }, modifier = Modifier.padding(top = 8.dp)) {
            Text("View Records")
        }
    }
}
