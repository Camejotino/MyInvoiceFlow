import { app, BrowserWindow, protocol } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import isDev from 'electron-is-dev'

// Registrar el protocolo personalizado antes de que la app esté lista
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
])

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: isDev
        ? path.join(process.cwd(), 'dist-electron', 'preload.js')
        : path.join(path.dirname(fileURLToPath(import.meta.url)), 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    if (app.isPackaged) {
      mainWindow.loadURL('app://out_next/index.html')
    } else {
      const indexPath = path.join(process.cwd(), 'out_next', 'index.html')
      mainWindow.loadFile(indexPath)
      // Open DevTools and attach listeners to capture errors when running npm start in production mode
      mainWindow.webContents.openDevTools({ mode: 'detach' })
      mainWindow.webContents.on('did-fail-load', (_e, code, desc, url) => {
        console.error('did-fail-load:', { code, desc, url })
      })
      mainWindow.webContents.on('console-message', (_e, level, message, line, sourceId) => {
        console.log('renderer console:', { level, message, line, sourceId })
      })
    }
  }

  mainWindow.on('closed', () => (mainWindow = null))
}

app.on('ready', () => {
  // Usar app.getAppPath() que funciona tanto en desarrollo como en producción
  // Cuando está empaquetado, apunta correctamente a resources/app.asar o resources/app
  const basePath = app.getAppPath()
  
  protocol.registerFileProtocol('app', (request, callback) => {
    try {
      const url = request.url.replace('app://', '')
      // Normalizar la ruta y manejar correctamente los archivos dentro del asar
      let resolvedPath = path.normalize(path.join(basePath, url))
      
      // Node.js puede leer archivos dentro de app.asar de forma transparente
      // pero necesitamos asegurarnos de que la ruta sea correcta
      if (!resolvedPath.startsWith(basePath)) {
        resolvedPath = path.join(basePath, url)
      }
      
      callback({ path: resolvedPath })
    } catch (error) {
      console.error('Error loading file:', error)
      callback({ error: -6 }) // FILE_NOT_FOUND
    }
  })
  
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
