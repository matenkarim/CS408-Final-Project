// js/signup.js

document.getElementById('signup-form').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const firstName = document.getElementById('first-name').value.trim();
    const lastName  = document.getElementById('last-name').value.trim();
    const username  = document.getElementById('username').value.trim();
    const email     = document.getElementById('email').value.trim();
    const password  = document.getElementById('password').value;
  
    // Validate inputs
    if (!firstName || !lastName || !username || !email || !password) {
      alert('Please fill in all fields.');
      return;
    }
  
    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    
    document.getElementById('signup-button').disabled = true;
  
    fetch('https://your-api-id.execute-api.your-region.amazonaws.com/prod/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ firstName, lastName, username, email, password })
    })
      .then(response => response.json())
      .then(data => {
        document.getElementById('signup-button').disabled = false;
  
        if (data.message === 'User registered successfully.') {
          alert('Registration successful! Please log in.');
          window.location.href = 'login.html';
        } else {
          alert('Registration failed: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('signup-button').disabled = false;
        alert('An error occurred during registration. Please try again.');
      });
  });
  