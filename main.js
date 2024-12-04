const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

let mainWindow;

function createWindow(file) {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 960,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile(file);
}

async function checkForScreenRecording() {
    const psList = (await import('ps-list')).default;
    const processes = await psList();
    const screenRecordingApps = ['obs', 'screencapture', 'camtasia', 'bandicam', 'fraps', 'snagit', 'debut', 'gamebar', 'gamebarpresencewriter'];
    //'gamebar', 'gamebarpresencewriter' >>> Eğer oyun açıksa bu ikisi uygulamanın kararmasına sebep oluyor. <Detaylı incelenecek>

    const isRecording = processes.some(process => 
        screenRecordingApps.some(app => process.name.toLowerCase().includes(app))
    );

    if (isRecording) {
        if (!mainWindow.screenRecording) {
            mainWindow.screenRecording = true;
            mainWindow.webContents.send('screen-recording-started');
            console.log('Screen recording detected!');
        }
    } else {
        if (mainWindow.screenRecording) {
            mainWindow.screenRecording = false;
            mainWindow.webContents.send('screen-recording-stopped');
            console.log('No screen recording detected.');
        }
    }
}

app.whenReady().then(() => {
    fs.readFile(path.join(__dirname, 'token.json'), 'utf8', (err, data) => {
        if (err || !data) {
            createWindow('index.html');
        } else {
            const tokenData = JSON.parse(data);
            if (tokenData.token) {
                createWindow('app.html'); // Ana uygulama ekranı
            } else {
                createWindow('index.html');
            }
        }
    });

    ipcMain.on('login', async (event, data) => {
        const { username, password } = data;
        console.log('Login attempt:', username);

        try {
            const response = await axios.post('https://www.pelikedu.com/api/development/login', 
                { username, password },
                {
                    headers: {
                        'x-api-key': '1234', 
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('API Response:', response.data);

            if (response.data && response.data.success === true && response.data.data && response.data.data.token) {
                const token = response.data.data.token;
                fs.writeFile(path.join(__dirname, 'token.json'), JSON.stringify({ token }), (err) => {
                    if (err) {
                        console.error('Token write error:', err);
                        event.reply('login-failed');
                        return;
                    }
                    console.log('Login successful');
                    event.reply('login-success');
                    mainWindow.loadFile('app.html');
                });
            } else {
                console.log('Login failed: invalid credentials');
                event.reply('login-failed');
            }
        } catch (error) {
            console.error('API error:', error.response ? error.response.data : error.message);
            event.reply('login-failed');
        }
    });

    ipcMain.on('logout', (event) => {
        fs.unlink(path.join(__dirname, 'token.json'), (err) => {
            if (err) {
                console.error('Token delete error:', err);
                return;
            }
            console.log('Logout successful');
            mainWindow.loadFile('index.html');
        });
    });
    setInterval(checkForScreenRecording, 5000);
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow('index.html');
    }
});
