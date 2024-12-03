const { ipcRenderer } = require('electron');

document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('Attempting to login with', username);
    ipcRenderer.send('login', { username, password });
});

ipcRenderer.on('login-success', () => {
    console.log('Giriş Başarılı!');
});

ipcRenderer.on('login-failed', () => {
    console.log('Giriş Başarısız!');
});


ipcRenderer.on('screen-recording-started', () => {
    document.body.style.filter = 'brightness(0)'; // Ekranı karart
    console.log('Ekran kaydı algılandı, ekran karartıldı.');
});

ipcRenderer.on('screen-recording-stopped', () => {
    document.body.style.filter = 'brightness(1)'; // Ekranı normal hale getir
    console.log('Ekran kaydı durduruldu, ekran normal hale getirildi.');
});

// Backend'den kullanıcı bilgilerini çekme
fetch("http://localhost:5000/api/user")
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("full_name").innerText = data.username;
    document.getElementById("email").innerText = data.email;
    document.getElementById("mobile").innerText = data.phone;
    document.getElementById("bio").innerText = data.about;
  })
  .catch((error) => console.error("Error fetching user data:", error));