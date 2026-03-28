import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store.js';
import './index.css';
import App from './App.jsx';
import { SeoProvider } from './components/Seo.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <SeoProvider>
                <App />
            </SeoProvider>
        </Provider>
    </StrictMode>
);
