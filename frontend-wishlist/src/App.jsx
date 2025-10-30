// src/App.jsx
import './App.css';
import Login from './pages/Login'; // 1. Importa a página que criamos

function App() {
  return (
    <div className="App">
      <Login /> {/* 2. Mostra a página de Login */}
    </div>
  );
}

export default App;