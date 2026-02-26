import axios from 'axios';

export const addToCartBackend = async (productId, quantity, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const { data } = await axios.post(
    'http://localhost:5000/api/cart', 
    { productId, quantity }, 
    config
  );
  
  return data;
};