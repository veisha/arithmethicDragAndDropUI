document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
    
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
    
            const data = await response.json();
            document.getElementById('loginMessage').textContent = data.message;
    
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId); // Store the userId
                window.location.href = 'menu.html'; // Redirect after login
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;

            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            document.getElementById('registerMessage').textContent = data.message;
            if (response.ok) {
                document.getElementById("registerMessage").textContent = "Registration successful!";
                document.getElementById("registerMessage").style.color = "#4CAF50"; // Green for success message
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
            
            
        });
    }
});
