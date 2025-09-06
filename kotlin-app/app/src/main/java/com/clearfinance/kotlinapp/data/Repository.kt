package com.clearfinance.kotlinapp.data

import android.content.Context
import kotlinx.coroutines.flow.Flow

class Repository private constructor(context: Context) {
    private val db = AppDatabase.getInstance(context)
    private val dao = db.transactionDao()

    fun allTransactions(): Flow<List<Transaction>> = dao.all()

    suspend fun addTransaction(t: Transaction) {
        dao.insert(t)
    }

    suspend fun deleteTransaction(id: Long) {
        dao.delete(id)
    }

    companion object {
        @Volatile
        private var INSTANCE: Repository? = null

        fun getInstance(context: Context): Repository = INSTANCE ?: synchronized(this) {
            val instance = Repository(context)
            INSTANCE = instance
            instance
        }
    }
}
