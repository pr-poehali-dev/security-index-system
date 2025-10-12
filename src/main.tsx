// src/main.tsx
// Описание: Точка входа в приложение, инициализация React корня
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);