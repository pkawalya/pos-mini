require('dotenv').config();
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path')

// Retrieve the app version
const appVersion = app.getVersion();

// Set the feed URL for updates
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'pkawalya',
  repo: 'pos-mini',
  token: process.env.GITHUB_TOKEN,
  url: `https://github.com/pkawalya/pos-mini/releases/tag/v${appVersion}`,
});

autoUpdater.checkForUpdatesAndNotify();

const setupEvents = require('./installers/setupEvents')
 if (setupEvents.handleSquirrelEvent()) {
    return;
 }

// Set the log file location
log.transports.file.file = `${app.getPath('userData')}/quicktill.log`;

// Set the log level (optional)
log.transports.file.level = 'info'; // or 'debug', 'warn', 'error', etc.

// Configure other options (optional)
log.transports.file.format = '{h}:{i}:{s} {level} {text}';

// Add logging to console (optional)
log.transports.console.level = false; // Disable console logging

// Initialize the logger
log.catchErrors();

// Usage example
log.info('App started');

const contextMenu = require('electron-context-menu');

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 1200,
    frame: false,
    minWidth: 1200, 
    minHeight: 750,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    },
  });

  mainWindow.maximize();
  mainWindow.show();

  // Load login page by default
  mainWindow.loadURL(
    `file://${path.join(__dirname, 'login.html')}`
  );

  mainWindow.on('closed', () => {
    mainWindow = null
  });
}

// Handle page reloads
ipcMain.on('app-reload', () => {
  mainWindow.reload();
});

app.on("ready", ()=>{
  process.env.APPDATA = path.join(app.getPath('home'),app.name);
  require('./server');
  createWindow();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})



ipcMain.on('app-quit', (evt, arg) => {
  app.quit()
})



contextMenu({
  prepend: (params, browserWindow) => [
     
      {label: 'DevTools',
       click(item, focusedWindow){
        focusedWindow.toggleDevTools();
      }
    },
     { 
      label: "Reload", 
        click() {
          mainWindow.reload();
      } 
    // },
    // {  label: 'Quit',  click:  function(){
    //    mainWindow.destroy();
    //     mainWindow.quit();
    // } 
  }  
  ],

});