/* src/components/RecipeCard.css */

.resep-card-link {
    text-decoration: none; 
    color: inherit;
}

/* --- Kartu Resep dengan BORDER KUNING (Sesuai Gambar 2) --- */
.resep-card {
    background: white;
    /* Border KUNING CERAH tebal 3px */
    border: 3px solid #FFD700; 
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
    color: #DB944B;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.2s ease-in-out;
    height: 100%;
}
.resep-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.resep-card-img {
    width: 100%;
    /* Tinggi gambar lebih kecil, sesuai gambar */
    height: 180px; 
    object-fit: cover;
    /* Border bawah juga 3px kuning */
    border-bottom: 3px solid #FFD700; 
}

.resep-card-info {
    padding: 15px;
    text-align: left;
    flex-grow: 1;
}

.resep-card-title {
    font-size: 1.2em;
    margin-bottom: 8px;
    color: #DB944B; 
    font-weight: bold;
}

/* --- Style RATING --- */
.rating-stars {
    display: block;
    font-size: 1.2em;
    margin-bottom: 10px;
    color: gold; 
}

.rating-value {
    font-size: 0.9em;
    color: #666; 
    margin-left: 5px;
    font-weight: normal;
}

.resep-card-category {
    font-size: 0.9em;
    color: #555; 
    margin-top: 10px;
}

.card-delete-btn {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #ff6b6b;
    color: #ff6b6b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.05rem;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    transition: transform 120ms ease, background 120ms ease, color 120ms ease;
    z-index: 10;
}
.card-delete-btn:hover {
    background: #ff6b6b;
    color: #fff;
    transform: translateY(-2px) scale(1.04);
}

.resep-card { 
    position: relative; 
}

@media (max-width: 600px) {
  .card-delete-btn {
    width: 30px;
    height: 30px;
    font-size: 0.95rem;
    right: 8px;
    top: 8px;
  }
}
