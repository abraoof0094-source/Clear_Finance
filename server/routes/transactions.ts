import { Router } from 'express';
import { dataStorage, Transaction } from '../utils/dataStorage';

const router = Router();

// Add a new transaction
router.post('/transactions', (req, res) => {
  try {
    const transaction: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: req.body.type,
      mainCategory: req.body.mainCategory,
      subCategory: req.body.subCategory,
      amount: parseFloat(req.body.amount),
      date: req.body.date,
      time: req.body.time,
      timestamp: Date.now(),
    };

    // Validate required fields
    if (!transaction.type || !transaction.mainCategory || !transaction.subCategory || 
        !transaction.amount || !transaction.date || !transaction.time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate transaction type
    if (!['income', 'expense', 'investment'].includes(transaction.type)) {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }

    // Validate amount
    if (isNaN(transaction.amount) || transaction.amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    dataStorage.addTransaction(transaction);
    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

// Get recent transactions
router.get('/transactions/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const transactions = dataStorage.getRecentTransactions(limit);
    res.json(transactions);
  } catch (error) {
    console.error('Error getting recent transactions:', error);
    res.status(500).json({ error: 'Failed to get recent transactions' });
  }
});

// Get current month transactions
router.get('/transactions/current-month', (req, res) => {
  try {
    const transactions = dataStorage.getCurrentMonthTransactions();
    res.json(transactions);
  } catch (error) {
    console.error('Error getting current month transactions:', error);
    res.status(500).json({ error: 'Failed to get current month transactions' });
  }
});

// Get transactions for specific month
router.get('/transactions/:year/:month', (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const transactions = dataStorage.getMonthlyTransactions(year, month);
    res.json(transactions);
  } catch (error) {
    console.error('Error getting monthly transactions:', error);
    res.status(500).json({ error: 'Failed to get monthly transactions' });
  }
});

// Get current month summary
router.get('/summary/current-month', (req, res) => {
  try {
    const summary = dataStorage.getCurrentMonthlySummary();
    res.json(summary);
  } catch (error) {
    console.error('Error getting current month summary:', error);
    res.status(500).json({ error: 'Failed to get current month summary' });
  }
});

// Get monthly summary
router.get('/summary/:year/:month', (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const summary = dataStorage.getMonthlySummary(year, month);
    res.json(summary);
  } catch (error) {
    console.error('Error getting monthly summary:', error);
    res.status(500).json({ error: 'Failed to get monthly summary' });
  }
});

// Get yearly summary
router.get('/summary/year/:year', (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    if (isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year' });
    }

    const summary = dataStorage.getYearlySummary(year);
    res.json(summary);
  } catch (error) {
    console.error('Error getting yearly summary:', error);
    res.status(500).json({ error: 'Failed to get yearly summary' });
  }
});

// Get category breakdown for a month
router.get('/categories/:year/:month', (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const categories = dataStorage.getMonthlyCategoryBreakdown(year, month);
    res.json(categories);
  } catch (error) {
    console.error('Error getting category breakdown:', error);
    res.status(500).json({ error: 'Failed to get category breakdown' });
  }
});

// Delete a transaction
router.delete('/transactions/:id', (req, res) => {
  try {
    const transactionId = req.params.id;
    const date = req.query.date as string;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required for transaction deletion' });
    }

    const success = dataStorage.deleteTransaction(transactionId, date);
    
    if (success) {
      res.json({ success: true, message: 'Transaction deleted successfully' });
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Get available years
router.get('/years', (req, res) => {
  try {
    const years = dataStorage.getAvailableYears();
    res.json(years);
  } catch (error) {
    console.error('Error getting available years:', error);
    res.status(500).json({ error: 'Failed to get available years' });
  }
});

// Get available months for a year
router.get('/months/:year', (req, res) => {
  try {
    const year = parseInt(req.params.year);
    
    if (isNaN(year)) {
      return res.status(400).json({ error: 'Invalid year' });
    }

    const months = dataStorage.getAvailableMonths(year);
    res.json(months);
  } catch (error) {
    console.error('Error getting available months:', error);
    res.status(500).json({ error: 'Failed to get available months' });
  }
});

export default router;
