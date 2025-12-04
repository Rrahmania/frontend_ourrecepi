import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initialRecipes } from '../data/resep'; 
import './Favorite.css';

const Favorite = () => {
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFavorites = () => {
            const favoriteIds = [];
            
            // Cari semua resep yang difavoritkan di localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                if (key.startsWith('recipe-') && key.endsWith('-favorite') && localStorage.getItem(key) === 'true') {
                    const idString = key.split('-')[1];
                    favoriteIds.push(parseInt(idString));
                }
            }

            // Gabungkan resep dari data.js DAN localStorage (resep yang ditambah user)
            const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
            const allRecipes = [...initialRecipes, ...savedRecipes];
            
            // Filter semua resep (bukan cuma initialRecipes)
            const foundFavorites = allRecipes.filter(recipe => 
                favoriteIds.includes(recipe.id)
            );

            setFavoriteRecipes(foundFavorites);
            setLoading(false);
        };

        // Load pertama kali
        loadFavorites();
        
        // Tambah event listener untuk update real-time saat user klik tombol favorit
        window.addEventListener('storage', loadFavorites);
        
        // Cleanup
        return () => {
            window.removeEventListener('storage', loadFavorites);
        };
        
    }, []);

    // Fungsi untuk menampilkan bintang rating
    const renderRating = (rating) => {
        const displayRating = Math.round(rating * 2) / 2;
        const fullStars = Math.floor(displayRating);
        const hasHalfStar = displayRating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return (
            <span className="rating-stars">
                {'★'.repeat(fullStars)}
                {hasHalfStar ? '½' : ''}
                {'☆'.repeat(emptyStars)}
                <span className="rating-value">({rating.toFixed(1)})</span> 
            </span>
        );
    };

    if (loading) {
        return <div className="favorite-page">Memuat Resep Favorit...</div>;
    }

    return (
        <div className="favorite-page">
            <h1 className="page-title">❤️ Resep Favorit Saya</h1>

            <div className='resep-list-favorite'>
                {favoriteRecipes.length > 0 ? (
                    favoriteRecipes.map(recipe => (
                        <Link 
                            to={`/resep/${recipe.id}`} 
                            key={recipe.id} 
                            className='resep-card-link'
                        >
                            <div className='resep-card favorite-card'> 
                                <img 
                                  src={recipe.image} 
                                  alt={recipe.name} 
                                  className='resep-card-img'
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                  }}
                                />
                                <div className='resep-card-info'>
                                    <h3 className='resep-card-title'>{recipe.name}</h3>
                                    {renderRating(recipe.rating || 0)}
                                    <p className='resep-card-category'>
                                        Kategori: {Array.isArray(recipe.categories) ? recipe.categories.join(', ') : recipe.categories}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className='no-favorites'>
                        Anda belum memiliki resep favorit. 
                        Coba jelajahi <Link to="/kategori">Kategori Resep</Link> dan tambahkan beberapa!
                    </p>
                )}
            </div>
        </div>
    );
};

export default Favorite;