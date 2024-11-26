document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
  
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }
  
    document.getElementById('login-button').disabled = true;
  
    fetch('https://your-api-id.execute-api.your-region.amazonaws.com/prod/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
      .then(response => response.json())
      .then(data => {
        document.getElementById('login-button').disabled = false;
  
        if (data.token) {
          localStorage.setItem('token', data.token);
          window.location.href = 'index.html';
        } else {
          alert('Login failed: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('login-button').disabled = false;
        alert('An error occurred during login. Please try again.');
      });
  });
  