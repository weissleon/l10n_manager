import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  addFilePaths: async (): Promise<string[]> => {
    return await ipcRenderer.invoke('file:import')
  },

  convertTextFiles: async (): Promise<boolean> => {
    return await ipcRenderer.invoke('file:convert')
  },
  clearList: async (): Promise<boolean> => {
    return await ipcRenderer.invoke('file:clear')
  },
  glossary: {
    loadSourceTexts: async (): Promise<{ key: string; text: string }> => {
      return await ipcRenderer.invoke('glossary:loadSourceTexts')
    },
    addGlossaryEntry: async (
      entry: string
    ): Promise<{ key: string; text: string; count: number }> => {
      return await ipcRenderer.invoke('glossary:addGlossaryEntry', entry)
    },
    updateGlossaryEntry: async (
      key: string,
      entry: string
    ): Promise<{ key: string; text: string; count: number }> => {
      return await ipcRenderer.invoke('glossary:updateGlossaryEntry', key, entry)
    },
    exportGlossary: async (): Promise<boolean> => {
      return await ipcRenderer.invoke('glossary:exportGlossary')
    },
    postprocessGlossary: async (): Promise<boolean> => {
      return await ipcRenderer.invoke('glossary:postprocessGlossary')
    }
  },
  mt: {
    loadTextFile: async (): Promise<string[][]> => {
      return await ipcRenderer.invoke('mt:loadTextFile')
    },
    translateTextFile: async (): Promise<boolean> => {
      return await ipcRenderer.invoke('mt:translateTextFile')
    },
    translateSingleText: async (text: string): Promise<string> => {
      return await ipcRenderer.invoke('mt:translateSingleText', text)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
