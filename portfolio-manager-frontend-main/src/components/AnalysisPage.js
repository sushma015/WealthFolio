// src/components/AnalysisPage.js

import React, { useState } from 'react';
import styled from 'styled-components';
import { addPortfolioItem, addTransaction } from '../services/api';
import { toast } from 'react-hot-toast';

const FormContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: white;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  margin-top: 0.5rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
`;

const Suggestions = styled.ul`
  background: white;
  color: black;
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 150px;
  overflow-y: auto;
  border-radius: 6px;
  position: absolute;
  width: 100%;
  z-index: 10;
`;

const SuggestionItem = styled.li`
  padding: 0.5rem;
  cursor: pointer;
  &:hover {
    background-color: #eee;
  }
`;

const AnalysisPage = () => {
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    type: 'stock',
    quantity: '',
    purchase_price: '',
    current_price: '',
    purchase_date: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSymbolChange = async (e) => {
    const value = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, symbol: value }));

    if (value.length >= 1) {
      try {
        const finhubKey = 'd2acuf1r01qoad6p8o20d2acuf1r01qoad6p8o2g';
        const response = await fetch(`https://finnhub.io/api/v1/search?q=${value}&token=${finhubKey}`);
        const data = await response.json();

        if (data && data.result) {
          setSuggestions(data.result.slice(0, 10));
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const fetchCurrentPrice = async (symbol) => {
    try {
      const finhubKey = 'd2acuf1r01qoad6p8o20d2acuf1r01qoad6p8o2g';
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finhubKey}`);
      const data = await response.json();

      if (data && data.c) {
        setFormData(prev => ({ ...prev, current_price: data.c }));
      }
    } catch (error) {
      console.error('Error fetching current price:', error);
    }
  };

  const handleSuggestionClick = (symbol, name) => {
    setFormData(prev => ({ ...prev, symbol, name }));
    setSuggestions([]);
    fetchCurrentPrice(symbol);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Calculate total purchase cost
      const totalCost = parseFloat(formData.quantity) * parseFloat(formData.purchase_price);
      
      // Add asset to portfolio
      await addPortfolioItem(formData);
      
      // Deduct money from settlement account
      await addTransaction({
        type: 'withdrawal',
        amount: totalCost,
        description: `Purchase of ${formData.quantity} shares of ${formData.symbol} at $${formData.purchase_price} each`
      });
      
      toast.success(`Asset added to portfolio. $${totalCost.toLocaleString()} deducted from settlement account.`);
      setFormData({
        symbol: '',
        name: '',
        type: 'stock',
        quantity: '',
        purchase_price: '',
        current_price: '',
        purchase_date: ''
      });
    } catch (error) {
      toast.error('Failed to add asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
<center><h2>Add New Asset</h2></center>
      <form onSubmit={handleSubmit}>
        <Label>
          Asset Type
          <Select name="type" value={formData.type} onChange={handleChange}>
            <option value="stock">Stock</option>
            <option value="crypto">Crypto</option>
            <option value="bond">Bond</option>
            <option value="etf">ETF</option>
            <option value="mutual_fund">Mutual Fund</option>
          </Select>
        </Label>

        <Label>
          Asset Symbol
          <div style={{ position: 'relative' }}>
            <Input
              name="symbol"
              value={formData.symbol}
              onChange={handleSymbolChange}
              placeholder="Start typing symbol (e.g. AAPL)"
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <Suggestions>
                {suggestions.map((s, index) => (
                  <SuggestionItem
                    key={s.symbol || index}
                    onClick={() => handleSuggestionClick(s.symbol, s.description)}
                  >
                    {s.symbol} — {s.description}
                  </SuggestionItem>
                ))}
              </Suggestions>
            )}
          </div>
        </Label>

        <Label>
          Asset Name
          <Input name="name" value={formData.name} placeholder="Auto-filled" readOnly />
        </Label>

        <Label>
          Quantity
          <Input type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
        </Label>

        <Label>
          Purchase Price
          <Input type="number" name="purchase_price" value={formData.purchase_price} onChange={handleChange} />
        </Label>

        <Label>
          Current Price
          <Input type="number" name="current_price" value={formData.current_price} onChange={handleChange} readOnly />
        </Label>

        <Label>
          Purchase Date
          <Input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleChange} />
        </Label>

        <Button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add to Portfolio'}
        </Button>
      </form>
    </FormContainer>
  );
};

export default AnalysisPage;
