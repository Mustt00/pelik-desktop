const { ipcRenderer } = require('electron');

// Overlay div
const overlay = document.createElement('div');
overlay.style.position = 'fixed';
overlay.style.top = 0;
overlay.style.left = 0;
overlay.style.width = '100%';
overlay.style.height = '100%';
overlay.style.backgroundColor = 'black';
overlay.style.zIndex = 1000;
overlay.style.display = 'none'; // Başlangıçta gizli
document.body.appendChild(overlay);

document.getElementById('logoutButton').addEventListener('click', () => {
    ipcRenderer.send('logout');
});


ipcRenderer.on('screen-recording-started', () => {
    if (overlay.style.display === 'none') {
        overlay.style.display = 'block'; // Overlay'i göster
        console.log('Ekran kaydı algılandı, ekran karartıldı.');
    }
});

ipcRenderer.on('screen-recording-stopped', () => {
    if (overlay.style.display === 'block') {
        overlay.style.display = 'none'; // Overlay'i gizle
        console.log('Ekran kaydı durduruldu, ekran normal hale getirildi.');
    }
});
