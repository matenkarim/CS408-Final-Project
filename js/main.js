document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const greeting = document.getElementById('greeting');
    const navAuth = document.getElementById('nav-auth');
  
    if (token) {
      try {
        // Decode the JWT token to extract the username
        const payload = jwt_decode(token);
        const username = payload.firstname;
  
        greeting.textContent = `Hi, ${firstname}!`;
        navAuth.innerHTML = '<a href="#" id="logout">Logout</a>';
  
        document.getElementById('logout').addEventListener('click', function (e) {
          e.preventDefault();
          localStorage.removeItem('token');
          window.location.href = 'index.html';
        });
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        greeting.textContent = 'Welcome to the Workout Tracker';
        navAuth.innerHTML = '<a href="login.html">Login</a>';
      }
    } else {
      greeting.textContent = 'Welcome to the Workout Tracker';
      navAuth.innerHTML = '<a href="login.html">Login</a>';
    }
  });
  