import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CatBreedSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    if (searchTerm.length >= 3) {
      const debounceTimer = setTimeout(() => {
        fetchCatBreeds();
      }, 1000);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm]);

  const fetchCatBreeds = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://api.thecatapi.com/v1/breeds/search?q=${searchTerm}&limit=20`); 
      const breedsWithImages = await Promise.all(response.data.map(async (breed) => {
        const imageResponse = await axios.get(`https://api.thecatapi.com/v1/images/search?breed_id=${breed.id}`);
        const image = imageResponse.data[0];
        return { ...breed, image };
      }));
      setSearchResults(breedsWithImages);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const sortResults = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  
    const sortedResults = [...searchResults].sort((a, b) => {
      if (key === 'name') {
        return sortOrder === 'asc' ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key]);
      } else {
        return sortOrder === 'asc' ? a[key] - b[key] : b[key] - a[key];
      }
    });
  
    setSearchResults(sortedResults);
  };

  return (
    <div>
      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a cat name"
        />
        <div className="sort-buttons">
          <button onClick={() => sortResults('name')}>Sort by Name</button>
          <button onClick={() => sortResults('weight.metric')}>Sort by Weight</button>
          <button onClick={() => sortResults('life_span')}>Sort by Lifespan</button>
        </div>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <ul className="cat">
        {searchResults.map((breed) => (
          <li key={breed.id}>
            <h3>{breed.name}</h3>
            <p>Description: {breed.description}</p>
            <p>Origin: {breed.origin}</p>
            <p>Temperament: {breed.temperament}</p>
            <p>Life span: {breed.life_span}</p>
            {breed.weight && (
              <p>
                Weight: {breed.weight.metric} {breed.weight.imperial}
              </p>
            )}
            {breed.image && <img src={breed.image.url} alt={breed.name} style={{ width: '600px', height: '600px' }} />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CatBreedSearch;
