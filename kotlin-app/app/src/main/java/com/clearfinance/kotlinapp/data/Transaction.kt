package com.clearfinance.kotlinapp.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "transactions")
data class Transaction(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val amount: Double,
    val category: String,
    val notes: String?,
    val timestamp: Long
)
