import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { initialRecipes, categories } from '../data/resep'; 
import './Kategori.css'; 
import cari from '../assets/cari.png'; 

const Kategori = () => {
  const [activeCategory, setActiveCategory] = useState('Semua Resep');
  const [searchTerm, setSearchTerm] = useState('');
  const [allRecipes, setAllRecipes] = useState([]);

  // Load resep dari localStorage
  useEffect(() => {
    const loadRecipes = () => {
      try {
        const savedRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
        setAllRecipes([...initialRecipes, ...savedRecipes]);
      } catch (error) {
        console.error('Error loading recipes:', error);
        setAllRecipes(initialRecipes);
      }
    };
    
    loadRecipes();
    window.addEventListener('storage', loadRecipes);
    
    return () => {
      window.removeEventListener('storage', loadRecipes);
    };
  }, []);

  const handleFilterClick = (category) => {
    setActiveCategory(category);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const filterRecipes = () => {
    let filtered = allRecipes;
    
    if (activeCategory !== 'Semua Resep') {
        filtered = allRecipes.filter(recipe => 
            recipe.categories && recipe.categories.includes(activeCategory)
        );
    }
    
    if (searchTerm) {
        const lowerCaseSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(recipe => 
            recipe.name.toLowerCase().includes(lowerCaseSearch)
        );
    }
    
    return filtered;
  };

  const recipesToShow = filterRecipes();

  // Fungsi untuk menampilkan bintang rating (Penuh, Setengah, Kosong)
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

  return (
    <div className='kategori-page'>
      <div className='search-input-area'>
         <div className='cari'> 
           <input 
               type="text" 
               placeholder='Cari Resep di sini...' 
               value={searchTerm}
               onChange={handleSearchChange}
           />
           <img src={cari} alt="ikon pencarian"/>
         </div>
      </div>
      
      <div className='filter-container'>
        <h2 className='filter-title'>Pilih Kategori Resep:</h2>
        <div className='filter-buttons'>
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-button ${activeCategory === category ? 'active' : ''}`}
              onClick={() => handleFilterClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <hr className='separator' />

      <div className='resep-list'>
        <h1 className='list-header'>Resep untuk Kategori: {activeCategory}</h1>
        
        {recipesToShow.length > 0 ? (
            recipesToShow.map(recipe => (
                <Link 
                    to={`/resep/${recipe.id}`} 
                    key={recipe.id} 
                    className='resep-card-link'
                >
                    <div className='resep-card'> 
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
            <div className='no-result'>
              <p>Tidak ada resep ditemukan.</p>
              <Link to="/tambah-resep" className="add-recipe-link">
                + Tambah Resep Pertama
              </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default Kategori;