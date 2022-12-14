import { dialog, app, shell, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import * as fs from 'fs/promises'
import * as hi from 'fs'
import * as TOML from 'toml'
import * as XLSX from 'xlsx'
import * as crypto from 'node:crypto'
import { config } from 'dotenv'
import pluralize from 'pluralize'
import capitalize from 'capitalize'

const axios = require('axios')
config()
XLSX.set_fs(hi)

let mainWindow: BrowserWindow = null
let textFilePaths: string[] = []
let glossarySourceTexts: { key: string; text: string }[] = []
let glossary: {
  [key: string]: {
    text: string
    count: number
  }
} = {}
let translateSourceData: string[][] = []
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

ipcMain.handle('glossary:loadSourceTexts', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [{ extensions: ['xlsx'], name: 'Translation File' }],
    defaultPath: app.getPath('downloads')
  })

  if (!result.canceled) {
    const { filePaths } = result
    const filePath = filePaths[0]

    const workbook = XLSX.readFile(filePath)
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
      header: 1
    }) as [[key: string, text: string]]
    data.shift()
    const processedData = data
      .filter((value) => value[1] !== '' && value[1] !== undefined)
      .map((value) => ({ key: value[0], text: value[1].toString() }))

    glossarySourceTexts = processedData

    return processedData
  }
})

ipcMain.handle('glossary:updateGlossaryEntry', async (event, key: string, entry: string) => {
  let count = 0

  for (const datum of glossarySourceTexts) {
    const regex = entry.replace(/\+/gi, '\\$&')
    const occurrence = (datum.text.toLowerCase().match(new RegExp(`${regex}`, 'gi')) || []).length
    count += occurrence
  }

  glossary[key] = { text: entry, count: count }

  return { key: key, text: entry, count: count }
})

ipcMain.handle('glossary:addGlossaryEntry', async (event, entry: string) => {
  const uuid = crypto.randomUUID()
  let count = 0

  for (const datum of glossarySourceTexts) {
    if (typeof datum.text !== 'string') console.log('NOT STRING!')

    const regex = entry.replace(/\+/gi, '\\$&')
    const occurrence = (datum.text.toLowerCase().match(new RegExp(`${regex}`, 'gi')) || []).length
    count += occurrence
  }

  glossary[uuid] = { text: entry, count: count }
  return { key: uuid, text: entry, count: count }
})

ipcMain.handle('glossary:exportGlossary', async (event) => {
  const sourceData: [text: string, count: string][] = [['text', 'count']]
  for (const id in glossary) {
    sourceData.push([glossary[id].text, glossary[id].count.toString()])
  }

  await exportXlsx('filename', sourceData)
})

ipcMain.handle('glossary:postprocessGlossary', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [
      { extensions: ['xlsx'], name: 'Glossary File' },
      { extensions: ['*'], name: 'All Files' }
    ]
  })

  if (result.canceled) return

  const filePath = result.filePaths[0]

  const workbook = XLSX.readFile(filePath)
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    rawNumbers: false
  }) as string[][]

  const processedGlossary: [key: string, value: string][] = []

  for (const datum of data) {
    const originalText = datum[0]
    const capitalizedText = capitalize(originalText, true)
    const eachCapitalText = capitalize.words(originalText)
    const pluralizedText = pluralize(capitalizedText)
    const pluralizedText2 = pluralize(eachCapitalText)
    const pluralizedText3 = pluralize(originalText)

    processedGlossary.push([originalText, datum[1]])
    processedGlossary.push([capitalizedText, datum[1]])
    processedGlossary.push([eachCapitalText, datum[1]])
    processedGlossary.push([pluralizedText, datum[1]])
    processedGlossary.push([pluralizedText2, datum[1]])
    processedGlossary.push([pluralizedText3, datum[1]])
  }

  await exportXlsx('finalGlossary', processedGlossary)
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

ipcMain.handle('mt:loadTextFile', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [
      { extensions: ['xlsx'], name: 'Text File' },
      { extensions: ['*'], name: 'All Files' }
    ]
  })

  if (result.canceled) return

  const filePath = result.filePaths[0]

  const workbook = XLSX.readFile(filePath)
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]

  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    blankrows: true,
    rawNumbers: false
  }) as string[][]

  translateSourceData = data
})

ipcMain.handle('mt:translateTextFile', async (event) => {
  if (translateSourceData.length === 0) return

  const translatedData: [key: string, value: string][] = []

  const promises: Promise<string>[] = []
  for (const sourceData of translateSourceData) {
    if (sourceData[0] === undefined || sourceData[0] === '') {
      continue
    }
    const result = sourceData[0].match(/^\s+$/gi)
    if (result !== null) continue
    const promise = translate(sourceData[0])
    promises.push(promise)
  }

  const result = await Promise.allSettled(promises)

  let index = 0
  for (const sourceData of translateSourceData) {
    const source = sourceData[0]
    if (source === undefined || source.match(/^\s*$/gi) !== null || sourceData[0] === '') {
      translatedData.push([source, source])
    } else {
      const data = result[index]
      if (data.status === 'fulfilled') {
        translatedData.push([source, data.value])
        index++
      }
    }
  }

  await exportXlsx('Pretranslated', translatedData)
})

ipcMain.handle('mt:translateSingleText', async (event, text: string) => {
  return await translate(text)
})

const translate = async (text: string): Promise<string> => {
  const apiEndpoint = 'https://naveropenapi.apigw.ntruss.com/nmt/v1/translation	'
  const sourceLang = 'en'
  const targetLang = 'ko'
  const id = process.env.PAPAGO_CLIENT_ID
  const secret = process.env.PAPAGO_CLIENT_SECRET
  try {
    const result = await axios.post(
      apiEndpoint,
      {
        source: sourceLang,
        target: targetLang,
        text: text,
        glossaryKey: 'a748a867-f95d-47f1-8f1e-5577f4879408'
      },
      {
        headers: {
          'X-NCP-APIGW-API-KEY-ID': id,
          'X-NCP-APIGW-API-KEY': secret,
          'Content-Type': 'application/json'
        }
      }
    )

    const translatedText = result.data.message.result.translatedText
    return translatedText
  } catch (error: any) {
    console.log(error)
    // for (const key in error) {
    //   console.log(error[key])
    // }

    return ''
  }
}
