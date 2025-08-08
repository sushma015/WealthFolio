// src/services/api.js

const BASE_URL = 'http://localhost:5000/api';

export const getPortfolio = async () => {
  const res = await fetch(`${BASE_URL}/portfolio`);
  const json = await res.json();
  return json.data;
};

export const getPortfolioSummary = async () => {
  const res = await fetch(`${BASE_URL}/portfolio`);
  const json = await res.json();

  const data = json.data;
  const total_value = data.reduce((acc, item) => acc + (item.quantity * item.current_price), 0);
  const total_cost = data.reduce((acc, item) => acc + (item.quantity * item.purchase_price), 0);
  const total_gain_loss = total_value - total_cost;

  const by_type = Object.values(
    data.reduce((acc, item) => {
      const value = item.quantity * item.current_price;
      const cost = item.quantity * item.purchase_price;
      const gain_loss = value - cost;

      if (!acc[item.type]) {
        acc[item.type] = {
          type: item.type,
          current_value: value,
          cost,
          gain_loss,
          count: 1,
        };
      } else {
        acc[item.type].current_value += value;
        acc[item.type].cost += cost;
        acc[item.type].gain_loss += gain_loss;
        acc[item.type].count += 1;
      }

      return acc;
    }, {})
  );

  return {
    total_value,
    total_gain_loss,
    total_gain_loss_percentage: total_cost ? (total_gain_loss / total_cost) * 100 : 0,
    total_items: data.length,
    by_type
  };
};

export const getAssetBreakdownData = async () => {
  const data = await getPortfolio();
  const breakdown = {};

  data.forEach(item => {
    const value = item.quantity * item.current_price;
    if (!breakdown[item.type]) {
      breakdown[item.type] = value;
    } else {
      breakdown[item.type] += value;
    }
  });

  return Object.keys(breakdown).map(type => ({
    name: type,
    value: breakdown[type],
  }));
};

export const getPortfolioPerformanceData = async () => {
  const data = await getPortfolio();
  return data.map(item => ({
    name: item.name,
    current_value: item.quantity * item.current_price,
    cost: item.quantity * item.purchase_price,
  }));
};

export const addPortfolioItem = async (item) => {
  const res = await fetch(`${BASE_URL}/portfolio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  const json = await res.json();
  return json.data;
};

export const deletePortfolioItem = async (id) => {
  const res = await fetch(`${BASE_URL}/portfolio/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  return json.data;
};

export const updatePortfolioItem = async (id, updates) => {
  const res = await fetch(`${BASE_URL}/portfolio/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const json = await res.json();
  return json.data;
};

// Settlement API functions
export const getSettlement = async () => {
  const res = await fetch(`${BASE_URL}/settlement`);
  const json = await res.json();
  return json.data;
};

export const getTransactions = async () => {
  const res = await fetch(`${BASE_URL}/settlement/transactions`);
  const json = await res.json();
  return json.data;
};

export const addTransaction = async (transaction) => {
  const res = await fetch(`${BASE_URL}/settlement/transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction)
  });
  const json = await res.json();
  return json.data;
};
