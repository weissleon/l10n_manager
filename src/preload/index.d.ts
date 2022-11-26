import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      addFilePaths: () => Promise<string[]>
      deleteTextFilePath: (index: number) => Promise<boolean>
      convertTextFiles: () => Promise<boolean>
      clearList: () => Promise<boolean>
      glossary: {
        loadSourceTexts: () => Promise<{ key: string; text: string }[]>
        addGlossaryEntry: (entry: string) => Promise<{ key: string; text: string; count: number }>
        updateGlossaryEntry: (
          key: string,
          entry: string
        ) => Promise<{ key: string; text: string; count: number }>
        exportGlossary: () => Promise<boolean>
      }
      mt: {
        loadTextFile: () => Promise<string[][]>
        translateTextFile: () => Promise<boolean>
        translateSingleText: (text: string) => Promise<string>
      }
    }
  }
}
