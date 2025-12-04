import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initialRecipes } from '../data/resep'; 
import './DetailResep.css'; 

const DetailResep = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false); 
    const [userRating, setUserRating] = useState(0); 

    const isUserLoggedIn = () => {
        return !!localStorage.getItem('user'); 
    };

    useEffect(() => {
        const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
        const allRecipes = [...initialRecipes, ...savedRecipes];
        
        const recipeId = parseInt(id);
        const foundRecipe = allRecipes.find(r => r.id === recipeId || r.id.toString() === id);
        setRecipe(foundRecipe);
        
        const storedFav = localStorage.getItem(`recipe-${id}-favorite`) === 'true';
        const storedRating = parseInt(localStorage.getItem(`recipe-${id}-rating`)) || 0;
        setIsFavorite(storedFav);
        setUserRating(storedRating);
        
        setLoading(false);
    }, [id]);

    const toggleFavorite = () => {
        if (!isUserLoggedIn()) {
            alert("Anda harus login untuk menyimpan resep ke Favorite!");
            navigate('/login');
            return;
        }

        const newFavStatus = !isFavorite;
        setIsFavorite(newFavStatus);
        localStorage.setItem(`recipe-${id}-favorite`, newFavStatus);
        window.dispatchEvent(new Event('storage'));
    };

    const { user, token } = useAuth();

    const currentUser = user || JSON.parse(localStorage.getItem('user')) || null;

    const canDelete = () => {
        if (!currentUser) return false;
        // Server-stored recipes use userId
        if (recipe.userId) {
            return recipe.userId === (currentUser.id || currentUser.uid || currentUser.name);
        }
        // If recipe has owner info from localStorage
        if (recipe.owner && recipe.owner.id) {
            return recipe.owner.id === (currentUser.id || currentUser.uid || currentUser.name);
        }
        return false;
    };

    const handleDelete = async () => {
        if (!canDelete()) {
            alert('Anda tidak memiliki izin untuk menghapus resep ini.');
            return;
        }

        const ok = window.confirm('Yakin ingin menghapus resep ini? Tindakan ini tidak dapat dibatalkan.');
        if (!ok) return;

        // If user is authenticated and recipe appears server-managed, call backend
        if (token && recipe.userId) {
            try {
                const res = await fetch(`http://localhost:5010/api/recipes/${recipe.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    alert(`Gagal menghapus recipe: ${data.message || res.statusText}`);
                    return;
                }
                alert('Resep berhasil dihapus');
                navigate('/kategori');
                return;
            } catch (e) {
                console.error('Error calling backend delete', e);
                alert('Terjadi error saat mencoba menghapus resep di server. Cek konsol.');
                return;
            }
        }

        // Fallback: delete from localStorage (lokal flow)
        try {
            const saved = JSON.parse(localStorage.getItem('recipes')) || [];
            const filtered = saved.filter(r => r.id !== recipe.id && r.id.toString() !== id.toString());
            localStorage.setItem('recipes', JSON.stringify(filtered));
            window.dispatchEvent(new Event('storage'));
            alert('Resep berhasil dihapus');
            navigate('/kategori');
        } catch (e) {
            console.error('Error deleting local recipe', e);
            alert('Gagal menghapus resep lokal. Cek konsol.');
        }
    };

    const handleRating = (rate) => {
        if (!isUserLoggedIn()) {
            alert("Anda harus login untuk memberi nilai (rating) resep ini!");
            navigate('/login');
            return;
        }

        setUserRating(rate);
        localStorage.setItem(`recipe-${id}-rating`, rate);
    };

    const renderStars = (currentRating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span 
                    key={i} 
                    className={`star ${i <= currentRating ? 'filled' : 'empty'}`}
                    onClick={() => handleRating(i)}
                >
                    ★
                </span>
            );
        }
        return stars;
    };
    
    const renderAverageRating = () => {
        if (!recipe || !recipe.rating) return null;
        const rating = recipe.rating;
        const displayRating = Math.round(rating * 2) / 2;
        const fullStars = Math.floor(displayRating);
        const hasHalfStar = displayRating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return (
            <span className="avg-rating">
                {'★'.repeat(fullStars)}
                {hasHalfStar ? '½' : ''}
                {'☆'.repeat(emptyStars)} 
                <span style={{color: '#333', marginLeft: '5px'}}>({rating.toFixed(1)}/5)</span>
            </span>
        );
    };

    if (loading) {
        return <div className="detail-page" style={{textAlign: 'center', padding: '50px'}}>
            <div>Memuat resep...</div>
        </div>;
    }

    if (!recipe) {
        return <div className="detail-page" style={{textAlign: 'center', color: '#DB944B'}}>
            <Link to="/kategori" className="back-button">← Kembali ke Daftar Resep</Link>
            <p>Resep dengan ID {id} tidak ditemukan.</p>
        </div>;
    }

    return (
        <div className="detail-page">
            <Link to="/kategori" className="back-button">← Kembali ke Daftar Resep</Link>

            <div className="detail-container">
                <img 
                  src={recipe.image} 
                  alt={recipe.name} 
                  className="detail-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                  }}
                />
                
                <div className="detail-info">
                    
                    <div className="header-info">
                        <h2>{recipe.name}</h2>
                        <button onClick={toggleFavorite} className={`favorite-btn ${isFavorite ? 'active' : ''}`}>
                            {isFavorite ? '❤️ Favorite Tersimpan' : '🤍 Tambahkan ke Favorite'}
                        </button>
                        { /* Delete button only visible to uploader */ }
                        { (function(){ try { return canDelete() ? (
                            <button onClick={handleDelete} className="delete-btn">🗑️ Hapus Resep</button>
                        ) : null } catch(e){ return null } })() }
                    </div>

                    <div className="metadata">
                        <p>Kategori: <strong>{Array.isArray(recipe.categories) ? recipe.categories.join(', ') : recipe.categories}</strong></p>
                        {recipe.rating && <p>Rating Rata-rata: {renderAverageRating()}</p>}
                    </div>

                    <div className="description">
                        <h3>Deskripsi:</h3>
                        <p>{recipe.description}</p>
                    </div>

                    <div className="bahan-bahan">
                        <h3>Bahan - bahan:</h3>
                        <div className="ingredients-content">
                            {recipe.bahan ? (
                                recipe.bahan.split('\n').map((line, index) => (
                                    line.trim() && <div key={index} className="ingredient-item">{line}</div>
                                ))
                            ) : (
                                <p>Belum ada bahan yang ditambahkan</p>
                            )}
                        </div>
                    </div>

                    <div className="langkah-langkah">
                        <h3>Langkah - langkah:</h3>
                        <div className="steps-content">
                            {recipe.langkah ? (
                                recipe.langkah.split('\n').map((line, index) => (
                                    line.trim() && <div key={index} className="step-item">{line}</div>
                                ))
                            ) : (
                                <p>Belum ada langkah yang ditambahkan</p>
                            )}
                        </div>
                    </div>
                    
                    <hr/>
                    
                    <div className="user-rating-section">
                        <h3>Beri Nilai Resep Ini:</h3>
                        <div className="rating-controls">
                            {renderStars(userRating)}
                            <span className="rating-status">
                                {userRating > 0 
                                    ? `Anda memberi ${userRating} bintang.` 
                                    : 'Klik bintang untuk memberi nilai.'
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailResep;