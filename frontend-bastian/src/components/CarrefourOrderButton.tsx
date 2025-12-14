import React, { useState } from 'react';

interface CarrefourOrderButtonProps {
  dishId?: string;
  dishName?: string;
}

export const CarrefourOrderButton: React.FC<CarrefourOrderButtonProps> = ({ 
  dishId = 'burger-vege',
  dishName = 'Burger Végétal'
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleOrderClick = async () => {
    setLoading(true);
    setMessage(null);

    try {
      console.log('🛒 Starting Carrefour order...');
      
      const response = await fetch('/api/start-shopping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dishId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Automation started! The browser will open...');
        console.log('✅ Réponse du serveur:', data);
      } else {
        setMessage('❌ Error: ' + (data.message || 'Unable to start automation'));
      }
    } catch (error) {
      console.error('❌ Error during API call:', error);
      setMessage('❌ Connection error to automation service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: '1rem',
      padding: '2rem'
    }}>
      <button
        onClick={handleOrderClick}
        disabled={loading}
        style={{
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          padding: '1.5rem 3rem',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          opacity: loading ? 0.7 : 1,
          minWidth: '250px'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }}
      >
        {loading ? '⏳ Chargement...' : '🛒 COMMANDER LE PANIER'}
      </button>
      
      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
      
      <p style={{ 
        color: '#666', 
        fontSize: '0.9rem',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        Click to automatically add the ingredients of your {dishName} to the Carrefour cart
      </p>
    </div>
  );
};


