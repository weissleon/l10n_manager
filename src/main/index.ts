import { dialog, app, shell, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import * as fs from 'fs/promises'
import * as hi from 'fs'
import * as TOML from 'toml'
import * as XLSX from 'xlsx'

XLSX.set_fs(hi)

let mainWindow: BrowserWindow = null
let textFilePaths: string[] = []

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux'
      ? {
          icon: path.join(__dirname, '../../build/icon.png')
        }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('file:import', async () => {
  const MSG_SELECT_TEXT_FILE = 'Choose the text file to import'
  const result = await dialog.showOpenDialog(mainWindow, {
    message: MSG_SELECT_TEXT_FILE,
    filters: [
      { extensions: ['toml', 'json', 'xlsx'], name: 'Text File' },
      { extensions: ['*'], name: 'All Files' }
    ],
    properties: ['multiSelections']
  })

  if (!result.canceled) {
    const { filePaths } = result

    for (const filePath of filePaths) {
      if (textFilePaths.includes(filePath)) continue

      textFilePaths.push(filePath)
    }
  }

  return textFilePaths.map((filePath) => filePath.slice(filePath.lastIndexOf('\\') + 1))
})

ipcMain.handle('file:clear', async () => {
  textFilePaths = []

  return true
})

ipcMain.handle('file:convert', async () => {
  for (const filePath of textFilePaths) {
    const extension = path.extname(filePath).toLowerCase()
    const fileName = path.basename(filePath)
    if (extension === '.toml') {
      const result = await loadTomlFile(filePath)
      await exportXlsx(fileName.slice(0, fileName.lastIndexOf('.')), result)
    }
    if (extension === '.json') {
      const result = await loadJsonFIle(filePath)
      await exportXlsx(fileName.slice(0, fileName.lastIndexOf('.')), result)
    }
  }
})

const exportXlsx = async (fileName: string, input: [key: string, value: string][]) => {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(input)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'data')

  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: path.join(app.getPath('downloads'), fileName + '.xlsx')
  })

  if (!result.canceled) {
    XLSX.writeFile(workbook, result.filePath)
  }
}

const readFile = async (filePath: string): Promise<string> => {
  const fileData = await fs.readFile(filePath, { encoding: 'utf-8' })
  return fileData
}

const loadJsonFIle = async (filePath: string): Promise<[key: string, value: string][]> => {
  const fileData = await readFile(filePath)
  let finalData = null
  try {
    const jsonData = JSON.parse(fileData)
    finalData = processObject(jsonData)
  } catch (error) {
    console.log(error)
  }
  return finalData
}

const loadTomlFile = async (filePath: string): Promise<[key: string, value: string][]> => {
  const fileData = await readFile(filePath)
  let finalData = null
  try {
    const temp = TOML.parse(fileData)
    const tomlData = JSON.parse(JSON.stringify(temp))
    finalData = processObject(tomlData)
  } catch (error) {
    console.log(error)
  }
  return finalData
}

function processObject(object: Object): [key: string, value: string][] {
  const procData: [key: string, value: string][] = []
  for (const key in object) {
    switch (checkDataType(object[key])) {
      case 'value': {
        procData.push([key, object[key].toString()])

        break
      }
      case 'array': {
        for (const [index, value] of object[key].entries()) {
          const arrKey = `${key}[${index}]`
          if (isObject(value)) {
            console.log(value)
            const data = processObject(value)
            console.log(`Data inside array ${arrKey}: ${data}`)
            for (const datum of data) {
              const finalKey = `${arrKey}/${datum[0]}`
              const value = datum[1]

              procData.push([finalKey, value])
            }
          } else {
            procData.push([arrKey, value.toString()])
          }
        }

        break
      }
      case 'object': {
        const data = processObject(object[key])

        for (const datum of data) {
          const finalKey = `${key}/${datum[0]}`
          const value = datum[1]

          procData.push([finalKey, value])
        }

        break
      }
      default:
        break
    }
  }

  return procData
}

function isValue(input): boolean {
  const type = typeof input
  return type === 'string' || type === 'number' || type === 'boolean'
}

function isObject(input) {
  return typeof input === 'object'
}

function isArray(input) {
  return Array.isArray(input)
}

function checkDataType(input) {
  if (isValue(input)) return 'value'
  if (isArray(input)) return 'array'
  if (isObject(input)) return 'object'
}
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
