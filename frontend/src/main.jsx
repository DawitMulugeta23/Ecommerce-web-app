import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'; // ይሄ መኖሩን አረጋግጥ
import { store } from './app/store';   // የፈጠርከው store
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* አፑን በProvider መጥለፍ ግዴታ ነው */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);