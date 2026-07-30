

/* script.js - CinemaX
   Handles data, UI interactions, seat selection, booking, storage sync, search/filter.
   Commented for learning.
*/

(() => {
  // Movie data shared across pages
  const movies = [
    {id:1,title:'Starlight Saga',genre:'Action',duration:'2h 10m',rating:8.2,release:'2026-03-15',lang:'English',price:220,poster:'images/movie1.svg'},
    {id:2,title:'Moonlit Melody',genre:'Romance',duration:'1h 50m',rating:7.5,release:'2025-12-05',lang:'Hindi',price:180,poster:'images/movie2.svg'},
    {id:3,title:'The Hidden Code',genre:'Thriller',duration:'2h 05m',rating:8.0,release:'2026-01-22',lang:'English',price:240,poster:'images/movie3.svg'},
    {id:4,title:'Galactic Quest',genre:'Sci-Fi',duration:'2h 25m',rating:8.6,release:'2026-06-01',lang:'English',price:260,poster:'images/movie4.svg'},
    {id:5,title:'Laugh Riot',genre:'Comedy',duration:'1h 40m',rating:7.1,release:'2026-02-10',lang:'Hindi',price:150,poster:'images/movie5.svg'},
    {id:6,title:'Midnight Echoes',genre:'Horror',duration:'1h 55m',rating:7.8,release:'2025-10-31',lang:'English',price:190,poster:'images/movie6.svg'},
    {id:7,title:'Legends Of Dawn',genre:'Fantasy',duration:'2h 20m',rating:8.3,release:'2026-04-05',lang:'Telugu',price:230,poster:'images/movie7.svg'},
    {id:8,title:'City Lights',genre:'Drama',duration:'2h 00m',rating:7.9,release:'2026-05-20',lang:'Hindi',price:170,poster:'images/movie8.svg'},
    {id:9,title:'Speedline',genre:'Action',duration:'1h 50m',rating:7.6,release:'2026-07-02',lang:'English',price:200,poster:'images/movie9.svg'},
    {id:10,title:'Aurora',genre:'Adventure',duration:'2h 05m',rating:8.0,release:'2026-03-01',lang:'English',price:210,poster:'images/movie10.svg'}
  ];

  // Utility helpers
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
  const formatCurrency = v => `₹${v.toFixed(0)}`;

  // Render dynamic year
  ['#year','#year2','#year3','#year4','#year5'].forEach(id => {
    const el = document.querySelector(id);
    if(el) el.textContent = new Date().getFullYear();
  });

  // Responsive nav toggle
  const navToggle = $('#nav-toggle');
  if(navToggle){
    navToggle.addEventListener('click', () => {
      const nav = $('#main-nav');
      nav.style.display = (nav.style.display === 'flex') ? '' : 'flex';
    });
    // hide on resize large
    window.addEventListener('resize', () => {
      if(window.innerWidth > 900) $('#main-nav').style.display = 'flex';
    });
  }

  // Back to top button
  const backTop = document.getElementById('backTop') || document.getElementById('backTop2');
  const checkBackTop = () => {
    const btn = document.querySelector('.back-top');
    if(!btn) return;
    if(window.scrollY > 300) btn.style.display = 'flex'; else btn.style.display = 'none';
  };
  window.addEventListener('scroll', checkBackTop);
  document.addEventListener('click', (e) => {
    if(e.target.closest('.back-top')) window.scrollTo({top:0,behavior:'smooth'});
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if(t) t.scrollIntoView({behavior:'smooth'});
    });
  });

  // --------- HOME PAGE: show few featured movies ----------
  const homeMoviesContainer = $('#home-movies');
  if(homeMoviesContainer){
    const featured = movies.slice(0,6);
    featured.forEach(m=>{
      const card = document.createElement('div');
      card.className = 'movie-card glass';
      card.innerHTML = `
        <img src="${m.poster}" alt="${m.title}" loading="lazy">
        <div class="movie-meta">
          <h4>${m.title}</h4>
          <div class="meta-small">${m.genre} • ${m.duration} • ⭐ ${m.rating}</div>
          <p class="muted" style="margin:0 0 .6rem">${m.release} • ${m.lang}</p>
          <a class="btn small" href="booking.html?movieId=${m.id}"><i class="fa fa-ticket-alt"></i> Book Ticket</a>
        </div>
      `;
      homeMoviesContainer.appendChild(card);
    });
  }

  // --------- MOVIES PAGE: search & filter & render ----------
  const moviesGrid = $('#moviesGrid');
  const searchInput = $('#searchInput');
  const genreFilter = $('#genreFilter');
  if(moviesGrid){
    // populate genres
    const genres = [...new Set(movies.map(m=>m.genre))].sort();
    genres.forEach(g => {
      const o = document.createElement('option'); o.value = g; o.textContent = g; genreFilter.appendChild(o);
    });

    function renderMovies(list){
      moviesGrid.innerHTML = '';
      list.forEach(m => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
          <img src="${m.poster}" alt="${m.title}" loading="lazy">
          <div class="movie-meta">
            <h4>${m.title}</h4>
            <div class="meta-small">${m.genre} • ${m.duration} • ⭐ ${m.rating}</div>
            <p class="muted">${m.release} • ${m.lang}</p>
            <div style="margin-top:.6rem">
              <a class="btn small" href="booking.html?movieId=${m.id}"><i class="fa fa-ticket-alt"></i> Book Ticket</a>
              <button class="btn small btn-outline more" data-id="${m.id}" style="margin-left:.5rem">Details</button>
            </div>
          </div>
        `;
        moviesGrid.appendChild(card);
      });
    }

    renderMovies(movies);

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      const g = genreFilter.value;
      const filtered = movies.filter(m => {
        const matchQ = m.title.toLowerCase().includes(q);
        const matchG = g ? m.genre === g : true;
        return matchQ && matchG;
      });
      renderMovies(filtered);
    });

    genreFilter.addEventListener('change', () => searchInput.dispatchEvent(new Event('input')));

    $('#resetFilters').addEventListener('click', ()=>{
      searchInput.value=''; genreFilter.value=''; renderMovies(movies);
    });
  }

  // --------- BOOKING PAGE: seat map, selection, summary ----------
  const bookingPage = document.getElementById('booking-page');
  if(bookingPage){
    // Elements
    const selectMovie = $('#selectMovie');
    const selectTheatre = $('#selectTheatre');
    const selectDate = $('#selectDate');
    const selectTime = $('#selectTime');
    const seatMap = $('#seatMap');
    const selectedSeatsEl = $('#selectedSeats');
    const numTickets = $('#numTickets');
    const confirmBtn = $('#confirmBtn');
    const finalizeBtn = $('#finalizeBtn');
    const loadingEl = $('#loading');
    const confirmationEl = $('#confirmation');
    const confDetails = $('#confDetails');

    const sumMovie = $('#sumMovie');
    const sumTheatre = $('#sumTheatre');
    const sumDate = $('#sumDate');
    const sumTime = $('#sumTime');
    const sumSeats = $('#sumSeats');
    const sumPrice = $('#sumPrice');
    const sumGst = $('#sumGst');
    const sumTotal = $('#sumTotal');

    // load movies into select
    movies.forEach(m=>{
      const o = document.createElement('option'); o.value = m.id; o.textContent = `${m.title} — ${m.genre}`;
      selectMovie.appendChild(o);
    });

    // Preselect movie if passed in query params
    const urlParams = new URLSearchParams(location.search);
    const preMovieId = urlParams.get('movieId');
    if(preMovieId) selectMovie.value = preMovieId;

    // date min = today
    const today = new Date().toISOString().split('T')[0];
    selectDate.min = today;
    if(!selectDate.value) selectDate.value = today;

    // seat map config
    const ROWS = 8;
    const COLS = 12;
    const seatRows = 'ABCDEFGH'.split('').slice(0, ROWS);

    // Build seat map (A1..H12)
    function buildSeatMap(){
      seatMap.innerHTML = '';
      for(let r=0;r<ROWS;r++){
        for(let c=1;c<=COLS;c++){
          const seatCode = `${seatRows[r]}${c}`;
          const btn = document.createElement('button');
          btn.className = 'seat available';
          btn.type = 'button';
          btn.dataset.seat = seatCode;
          btn.textContent = seatCode;
          btn.addEventListener('click', () => toggleSeat(seatCode, btn));
          seatMap.appendChild(btn);
        }
      }
      refreshBookedSeats();
    }

    // Storage key for booked seats: key = bookings (object). We'll store bookings keyed by combo: movieId|theatre|date|time -> array of seats
    const BOOKINGS_KEY = 'CINEMAX_BOOKINGS_v1';

    function loadBookings(){
      try {
        return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '{}');
      } catch(e){
        return {};
      }
    }
    function saveBookings(b){ localStorage.setItem(BOOKINGS_KEY, JSON.stringify(b)); }

    // Compose booking key string
    function bookingKey(movieId, theatre, date, time){
      return `${movieId}||${theatre}||${date}||${time}`;
    }

    // Mark booked seats from storage
    function refreshBookedSeats(){
      const b = loadBookings();
      const key = bookingKey(selectMovie.value, selectTheatre.value, selectDate.value, selectTime.value);
      const booked = b[key] || [];
      // set classes
      $$('.seat', seatMap).forEach(btn=>{
        const code = btn.dataset.seat;
        btn.classList.remove('booked');
        btn.classList.add('available');
        btn.disabled = false;
        if(booked.includes(code)){
          btn.classList.remove('available'); btn.classList.add('booked'); btn.disabled = true;
        }
      });
      // Update selected seats if some were booked by others
      const selected = selectedSeats();
      const stillValid = selected.filter(s => !booked.includes(s));
      if(stillValid.length !== selected.length){
        // update UI
        setSelectedSeats(stillValid);
      }
      updateSummary();
    }

    // Selected seats state is kept in-memory for the current booking
    let _selectedSeats = [];

    function selectedSeats(){ return _selectedSeats.slice(); }

    function setSelectedSeats(list){
      _selectedSeats = list.slice();
      // update DOM classes
      $$('.seat', seatMap).forEach(btn=>{
        const code = btn.dataset.seat;
        btn.classList.remove('selected');
        if(_selectedSeats.includes(code) && !btn.classList.contains('booked')){
          btn.classList.add('selected');
        }
      });
      selectedSeatsEl.textContent = _selectedSeats.length ? _selectedSeats.join(', ') : 'None';
      numTickets.value = Math.max(1, Math.min(12, _selectedSeats.length || numTickets.value));
      updateSummary();
      finalizeBtn.disabled = _selectedSeats.length === 0;
    }

    function toggleSeat(code, btn){
      if(btn.classList.contains('booked')) return;
      if(_selectedSeats.includes(code)){
        setSelectedSeats(_selectedSeats.filter(s=>s!==code));
      } else {
        // limit by numTickets
        const max = parseInt(numTickets.value) || 12;
        if(_selectedSeats.length >= max){
          alert(`You can select up to ${max} seats.`);
          return;
        }
        setSelectedSeats([..._selectedSeats, code]);
      }
    }

    // numTickets changes adjust selected seats constraint
    numTickets.addEventListener('change', () => {
      const max = parseInt(numTickets.value) || 12;
      if(_selectedSeats.length > max) setSelectedSeats(_selectedSeats.slice(0, max));
    });

    // Update payment summary based on selections
    function updateSummary(){
      const movieObj = movies.find(m => String(m.id) === String(selectMovie.value));
      const theatre = selectTheatre.value;
      const date = selectDate.value;
      const time = selectTime.value;
      const seats = _selectedSeats.slice();

      sumMovie.textContent = movieObj ? movieObj.title : '-';
      sumTheatre.textContent = theatre || '-';
      sumDate.textContent = date || '-';
      sumTime.textContent = time || '-';
      sumSeats.textContent = seats.length ? seats.join(', ') : '-';

      const basePrice = movieObj ? movieObj.price : 0;
      const price = basePrice * seats.length;
      const gst = price * 0.18;
      const total = price + gst;

      sumPrice.textContent = formatCurrency(price);
      sumGst.textContent = formatCurrency(gst);
      sumTotal.textContent = formatCurrency(total);
    }

    // When booking details change, we need to refresh seat availability
    [selectMovie, selectTheatre, selectDate, selectTime].forEach(el=>{
      el.addEventListener('change', () => {
        refreshBookedSeats();
      });
    });

    // Confirm -> proceed to payment (simulated) step: validate selections and show loading then confirmation
    confirmBtn.addEventListener('click', () => {
      // basic validation
      const name = $('#custName').value.trim();
      const email = $('#custEmail').value.trim();
      const phone = $('#custPhone').value.trim();
      if(!name || !email || !phone){
        alert('Please fill name, email and phone.');
        return;
      }
      if(_selectedSeats.length === 0){
        alert('Please select at least one seat.');
        return;
      }
      // confirm popup
      const ok = confirm(`Proceed to book ${_selectedSeats.length} seats for "${$('#selectMovie option:checked').textContent}"?`);
      if(!ok) return;

      // Show loading
      loadingEl.hidden = false;
      finalizeBtn.disabled = true;
      confirmBtn.disabled = true;

      // Simulate server processing
      setTimeout(() => {
        loadingEl.hidden = true;
        // finalize booking: mark seats as booked in storage
        const b = loadBookings();
        const key = bookingKey(selectMovie.value, selectTheatre.value, selectDate.value, selectTime.value);
        b[key] = b[key] || [];
        // ensure seats not already booked (race condition)
        const already = b[key].filter(s => _selectedSeats.includes(s));
        if(already.length){
          alert('Some seats were taken by others. Please reselect.');
          refreshBookedSeats();
          confirmBtn.disabled = false;
          finalizeBtn.disabled = false;
          return;
        }
        b[key] = b[key].concat(_selectedSeats);
        saveBookings(b);

        // create booking record for confirmation display
        const movieObj = movies.find(m => String(m.id) === String(selectMovie.value));
        const price = (movieObj ? movieObj.price : 0) * _selectedSeats.length;
        const gst = price * 0.18;
        const total = price + gst;
        const bookingId = 'CX' + Math.random().toString(36).slice(2,10).toUpperCase();

        const bookingRecord = {
          id: bookingId,
          name: $('#custName').value.trim(),
          email: $('#custEmail').value.trim(),
          phone: $('#custPhone').value.trim(),
          movie: movieObj ? movieObj.title : '-',
          theatre: selectTheatre.value,
          date: selectDate.value,
          time: selectTime.value,
          seats: _selectedSeats.slice(),
          price, gst, total
        };

        // Save confirmations in localStorage for persistence
        const history = JSON.parse(localStorage.getItem('CINEMAX_HISTORY_v1') || '[]');
        history.push(bookingRecord);
        localStorage.setItem('CINEMAX_HISTORY_v1', JSON.stringify(history));

        // Show confirmation section
        showConfirmation(bookingRecord);
        // Notify other tabs of change (storage event triggers automatically on other tabs)
        localStorage.setItem('CINEMAX_LAST_UPDATE', Date.now().toString());

      }, 1200);
    });

    function showConfirmation(rec){
      confirmationEl.classList.remove('hidden');
      confDetails.innerHTML = `
        <p><strong>Booking ID:</strong> ${rec.id}</p>
        <p><strong>Name:</strong> ${rec.name}</p>
        <p><strong>Movie:</strong> ${rec.movie}</p>
        <p><strong>Theatre:</strong> ${rec.theatre}</p>
        <p><strong>Date & Time:</strong> ${rec.date} ${rec.time}</p>
        <p><strong>Seats:</strong> ${rec.seats.join(', ')}</p>
        <p><strong>Total Paid:</strong> ${formatCurrency(rec.total)}</p>
      `;
      $('#printTicket').onclick = () => {
        // open printable view in new window or use print on current
        window.print();
      };
      $('#newBooking').onclick = () => {
        window.location.href = 'movies.html';
      };
      // disable finalize until next booking
      finalizeBtn.disabled = true;
      confirmBtn.disabled = false;
    }

    // When finalizeBtn clicked (alternative confirm)
    finalizeBtn.addEventListener('click', () => {
      confirmBtn.click();
    });

    // Storage event listener for real-time availability across tabs
    window.addEventListener('storage', (e) => {
      if(e.key === BOOKINGS_KEY || e.key === 'CINEMAX_LAST_UPDATE'){
        refreshBookedSeats();
      }
    });

    // Build the seats on load
    buildSeatMap();
    updateSummary();
  }

  // Additional: make sure movie select in booking page pre-select shows summary (if present)
  document.addEventListener('change', (e) => {
    if(e.target && e.target.id === 'selectMovie'){
      // refresh summary if present
      const evt = new Event('input');
      document.dispatchEvent(evt);
    }
  });

  // Print-friendly styles via JS: add a simple handler
  window.addEventListener('beforeprint', () => {
    document.body.classList.add('printing');
  });
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('printing');
  });

  // Accessibility small improvement: focus visible class
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Tab') document.body.classList.add('show-focus');
  });

})();
