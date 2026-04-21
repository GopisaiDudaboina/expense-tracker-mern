import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other'); // New state for category

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/expenses');
        console.log("DATA FROM DATABASE: ", res.data); // <--- ADD THIS LINE
        setExpenses(res.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchExpenses();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    // Include category in the payload
    const newExpense = { text, amount: +amount, category };

    try {
      const res = await axios.post('http://localhost:5000/api/expenses', newExpense);
      setExpenses([res.data, ...expenses]); 
      setText('');
      setAmount('');
      setCategory('Other'); // Reset category
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`);
      setExpenses(expenses.filter(expense => expense._id !== id));
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  // --- ANALYTICS CALCULATIONS ---
  const amounts = expenses.map(expense => expense.amount);
  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

  // Group negative amounts (expenses) by their category
  const expensesByCategory = expenses.reduce((acc, current) => {
    if (current.amount < 0) {
      acc[current.category] = (acc[current.category] || 0) + Math.abs(current.amount);
    }
    return acc;
  }, {});

  return (
    <div className="container">
      <h1><center>Expense Tracker</center></h1>
      
      <div className="balance">
        <h4>Total Balance: </h4>
        <h1 style={{ margin: '5px 0' }}>Rs.{total}</h1>
      </div>

      {/* Analytics Section */}
      <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
        <h4>Spending Breakdown</h4>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
          {Object.entries(expensesByCategory).map(([cat, amount]) => (
             <li key={cat} style={{ display: 'flex', justifyContent: 'space-between' }}>
               <span>{cat}:</span> <strong>Rs.{amount.toFixed(2)}</strong>
             </li>
          ))}
        </ul>
      </div>

      <form onSubmit={onSubmit}>
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="Enter description..." 
          required 
        />
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="Amount (- for expense, + for income)" 
          required 
        />
        
        {/* Category Dropdown */}
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="Income">Income (Positive Amount)</option>
          <option value="Housing">Housing</option>
          <option value="Food">Food</option>
          <option value="Transportation">Transportation</option>
          <option value="Utilities">Utilities</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>

        <button type="submit">Add Transaction</button>
      </form>

      <h3>History</h3>
      <ul className="history-list">
        {expenses.map(expense => (
          <li key={expense._id} className={`history-item ${expense.amount < 0 ? 'minus' : 'plus'}`}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <strong>{expense.text}</strong>
              <small style={{ color: '#888' }}>{expense.category}</small>
            </div>
            <span>
              {expense.amount < 0 ? '-' : '+'}Rs.{Math.abs(expense.amount).toFixed(2)}
            </span>
            <button className="delete-btn" onClick={() => deleteExpense(expense._id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;