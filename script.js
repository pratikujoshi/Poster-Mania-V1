const API_KEY = 'c9b6c9e91a7cb6a990b48a0a4aa48d59'; // Replace with your TMDB API key

// DOM elements
const searchBar = document.getElementById('searchBar');
const clearBtn = document.getElementById('clearSearch');
const header = document.querySelector('header');
const posterGrid = document.getElementById('posterGrid');
const carousel = document.getElementById('carousel');
const logo = document.querySelector('.logo');

// Show/hide clear button
searchBar.addEventListener('input', () => {
  clearBtn.style.display = searchBar.value ? 'block' : 'none';
});

// Handle search on Enter
searchBar.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && searchBar.value.trim()) {
    searchMedia(searchBar.value.trim());
  }
});

// Clear search and reset
clearBtn.addEventListener('click', () => {
  searchBar.value = '';
  clearBtn.style.display = 'none';
  header.classList.remove('active');
  posterGrid.style.display = 'none';
  posterGrid.innerHTML = '';
  carousel.style.display = 'block';
  initCarousel();
});

// Logo click handler
logo.addEventListener('click', () => {
  if (header.classList.contains('active')) {
    // Showcase page: reset to landing
    searchBar.value = '';
    clearBtn.style.display = 'none';
    header.classList.remove('active');
    posterGrid.style.display = 'none';
    posterGrid.innerHTML = '';
    carousel.style.display = 'block';
    initCarousel();
  } else {
    // Landing page: refresh
    window.location.reload();
  }
});

// Search function
async function searchMedia(query) {
  try {
    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) throw new Error(`Search API failed: ${searchResponse.status}`);
    const searchData = await searchResponse.json();

    if (searchData.results.length === 0) {
      alert('No results found!');
      return;
    }

    const media = searchData.results[0];
    const mediaId = media.id;
    const mediaType = media.media_type;

    const imagesUrl = `https://api.themoviedb.org/3/${mediaType}/${mediaId}/images?api_key=${API_KEY}`;
    const imagesResponse = await fetch(imagesUrl);
    if (!imagesResponse.ok) throw new Error(`Images API failed: ${imagesResponse.status}`);
    const imagesData = await imagesResponse.json();

    const posters = imagesData.posters || [];
    if (posters.length === 0) {
      alert('No posters found for this title!');
      return;
    }

    header.classList.add('active');
    posterGrid.style.display = 'block';
    carousel.style.display = 'none';
    posterGrid.innerHTML = '';

    posters.forEach(poster => {
      const imgUrl = `https://image.tmdb.org/t/p/w500${poster.file_path}`;
      const posterDiv = document.createElement('div');
      posterDiv.className = 'poster';
      posterDiv.innerHTML = `<img src="${imgUrl}" alt="Poster">`;
      posterGrid.appendChild(posterDiv);
    });
  } catch (error) {
    console.error('Search error:', error);
    alert('Something went wrong. Please try again.');
  }
}

// Carousel function
async function initCarousel() {
  try {
    carousel.innerHTML = '<p>Loading trending posters...</p>';
    const trendingUrl = `https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}`;
    const response = await fetch(trendingUrl, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) throw new Error(`Trending API failed: ${response.status}`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      carousel.innerHTML = '<p>No trending posters available.</p>';
      return;
    }

    const validItems = data.results.filter(item => item.poster_path).slice(0, 5);
    if (validItems.length === 0) {
      carousel.innerHTML = '<p>No valid posters found.</p>';
      return;
    }

    carousel.innerHTML = '';
    validItems.forEach((item, index) => {
      const imgUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
      const img = document.createElement('img');
      img.src = imgUrl;
      img.alt = item.title || item.name || 'Trending Poster';
      img.className = index === 0 ? 'active' : '';
      carousel.appendChild(img);
    });

    const images = carousel.querySelectorAll('img');
    if (images.length > 1) {
      let current = 0;
      setInterval(() => {
        images[current].className = '';
        current = (current + 1) % images.length;
        images[current].className = 'active';
      }, 3000);
    }
  } catch (error) {
    console.error('Carousel error:', error.message);
    carousel.innerHTML = '<p>Failed to load trending posters.</p>';
  }
}

// Start carousel on load
initCarousel();