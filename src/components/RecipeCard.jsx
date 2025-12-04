import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RecipeCard.css';

const RecipeCard = ({ recipe }) => {
  const {
    id,
    name,
    categories, // ✅ BENAR: dari resep.js
    rating,
    image 
  } = recipe;

  const { user, token } = useAuth();

  const canDelete = () => {
    if (!user) return false;
    if (recipe.userId) return (recipe.userId === (user.id || user.uid || user.name));
    if (recipe.owner && recipe.owner.id) return (recipe.owner.id === (user.id || user.uid || user.name));
    return false;
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canDelete()) {
      alert('Anda tidak memiliki izin untuk menghapus resep ini.');
      return;
    }

    const ok = window.confirm('Yakin ingin menghapus resep ini?');
    if (!ok) return;

    // If server-managed and we have token, call backend
    if (token && recipe.userId) {
      try {
        const res = await fetch(`http://localhost:5010/api/recipes/${recipe.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(`Gagal menghapus resep: ${data.message || res.statusText}`);
          return;
        }
        // Notify listeners and refresh
        window.dispatchEvent(new Event('storage'));
        alert('Resep berhasil dihapus');
        return;
      } catch (err) {
        console.error('Error deleting recipe', err);
        alert('Terjadi error saat menghapus resep dari server');
        return;
      }
    }

    // Fallback: localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('recipes')) || [];
      const filtered = saved.filter(r => r.id !== recipe.id && r.id.toString() !== id.toString());
      localStorage.setItem('recipes', JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage'));
      alert('Resep berhasil dihapus');
    } catch (err) {
      console.error('Error deleting local recipe', err);
      alert('Gagal menghapus resep lokal');
    }
  };

  const renderRating = (rating) => {
    // ... kode rating tetap
  };
  
  const categoryDisplay = categories 
    ? (Array.isArray(categories) ? categories.join(', ') : categories)
    : 'Tidak Ada Kategori'; // ✅ BENAR: handle categories array

  return (
    <Link to={`/resep/${id}`} className='resep-card-link'>
      <div className='resep-card'> 
            {image ? (
                <img 
                  src={image} 
                  alt={name} 
                  className='resep-card-img'
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                />
            ) : (
                <div className='img-placeholder'>
                    <span className='recipe-emoji'>👨‍🍳</span>
                </div>
            )}

            <div className='resep-card-info'>
                { canDelete() && (
                  <button className="card-delete-btn" onClick={handleDelete} aria-label="Hapus resep">🗑️</button>
                ) }
                <h3 className='resep-card-title'>{name}</h3>
                {renderRating(rating)}
                <p className='resep-card-category'>
                    Kategori: {categoryDisplay}
                </p>
            </div>
        </div>
    </Link>
  );
};

export default RecipeCard;