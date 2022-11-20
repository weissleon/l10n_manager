import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      addFilePaths: () => Promise<string[]>
      deleteTextFilePath: (index: number) => Promise<boolean>
      convertTextFiles: () => Promise<boolean>
      clearList: () => Promise<boolean>
    }
  }
}
