package com.clearfinance.kotlinapp

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import com.clearfinance.kotlinapp.data.Repository
import com.clearfinance.kotlinapp.data.Transaction

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val repo = Repository.getInstance(application)

    val transactions: StateFlow<List<Transaction>> = repo.allTransactions()
        .map { it }
        .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    fun addTransaction(amount: Double, category: String, notes: String?) {
        val t = Transaction(amount = amount, category = category, notes = notes, timestamp = System.currentTimeMillis())
        viewModelScope.launch {
            repo.addTransaction(t)
        }
    }

    fun deleteTransaction(id: Long) {
        viewModelScope.launch {
            repo.deleteTransaction(id)
        }
    }
}
