import React from 'react';
import { CarrefourOrderButton } from './components/CarrefourOrderButton';
import './App.css';

function App() {
  return (
    <div className="App">
      <header style={{ 
        textAlign: 'center', 
        padding: '2rem',
        backgroundColor: '#f8f9fa',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          color: '#28a745',
          fontSize: '2.5rem',
          margin: 0
        }}>
          🥗 GreenReal
        </h1>
        <p style={{ 
          color: '#666',
          fontSize: '1.2rem',
          marginTop: '0.5rem'
        }}>
          Transition vers une alimentation végétale
        </p>
      </header>
      
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ 
            fontSize: '1.8rem',
            marginBottom: '1rem',
            color: '#333'
          }}>
            🍔 Burger Végétal
          </h2>
          <p style={{ 
            color: '#666',
            lineHeight: '1.6',
            marginBottom: '2rem'
          }}>
            Découvrez notre délicieux burger végétal, une alternative savoureuse et durable 
            à votre burger traditionnel. Tous les ingrédients sont disponibles sur Carrefour !
          </p>
          
          <CarrefourOrderButton 
            dishId="burger-vege"
            dishName="Burger Végétal"
          />
        </div>
      </main>
    </div>
  );
}

export default App;


