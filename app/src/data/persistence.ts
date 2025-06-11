import * as fs from 'fs/promises'
import * as path from 'path'

import { Trip } from '../domains/trip-management/types/trip'
import { WeatherData } from '../domains/weather/types/weather'
import { AppStore } from './store'

export interface PersistenceService {
  save(data: AppStore): Promise<void>
  load(): Promise<AppStore>
  backup(): Promise<string>
  restore(backup: string): Promise<void>
}

interface SerializedStore {
  trips: Array<[string, Trip]>
  weather: Array<[string, WeatherData]>
  lastSync: string
}

class FilePersistenceService implements PersistenceService {
  private readonly dataDir: string
  private readonly dataFile: string
  private readonly backupDir: string

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data')
    this.dataFile = path.join(this.dataDir, 'store.json')
    this.backupDir = path.join(this.dataDir, 'backups')
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true })
      await fs.mkdir(this.backupDir, { recursive: true })
    } catch (error) {
      throw new Error(`Failed to create data directories: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private serializeStore(store: AppStore): SerializedStore {
    return {
      trips: Array.from(store.trips.entries()).map(([key, trip]) => [
        key,
        {
          ...trip,
          startDate: trip.startDate,
          endDate: trip.endDate,
          createdAt: trip.createdAt,
          updatedAt: trip.updatedAt
        }
      ]),
      weather: Array.from(store.weather.entries()).map(([key, weather]) => [
        key,
        {
          ...weather,
          lastUpdated: weather.lastUpdated,
          forecast: weather.forecast.map((forecast) => ({
            ...forecast,
            date: forecast.date
          }))
        }
      ]),
      lastSync: store.lastSync.toISOString()
    }
  }

  private deserializeStore(serialized: SerializedStore): AppStore {
    const trips = new Map<string, Trip>()
    serialized.trips.forEach(([key, trip]) => {
      trips.set(key, {
        ...trip,
        startDate: new Date(trip.startDate),
        endDate: new Date(trip.endDate),
        createdAt: new Date(trip.createdAt),
        updatedAt: new Date(trip.updatedAt)
      })
    })

    const weather = new Map<string, WeatherData>()
    serialized.weather.forEach(([key, weatherData]) => {
      weather.set(key, {
        ...weatherData,
        lastUpdated: new Date(weatherData.lastUpdated),
        forecast: weatherData.forecast.map((forecast) => ({
          ...forecast,
          date: new Date(forecast.date)
        }))
      })
    })

    return {
      trips,
      weather,
      lastSync: new Date(serialized.lastSync)
    }
  }

  async save(data: AppStore): Promise<void> {
    try {
      await this.ensureDirectories()
      
      const serialized = this.serializeStore(data)
      const jsonData = JSON.stringify(serialized, null, 2)
      
      await fs.writeFile(this.dataFile, jsonData, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async load(): Promise<AppStore> {
    try {
      await this.ensureDirectories()
      
      const fileExists = await fs.access(this.dataFile).then(() => true).catch(() => false)
      
      if (!fileExists) {
        return {
          trips: new Map<string, Trip>(),
          weather: new Map<string, WeatherData>(),
          lastSync: new Date()
        }
      }

      const jsonData = await fs.readFile(this.dataFile, 'utf-8')
      const serialized: SerializedStore = JSON.parse(jsonData)
      
      return this.deserializeStore(serialized)
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Data file is corrupted: ${error.message}`)
      }
      throw new Error(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async backup(): Promise<string> {
    try {
      await this.ensureDirectories()
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupFile = path.join(this.backupDir, `backup-${timestamp}.json`)
      
      const fileExists = await fs.access(this.dataFile).then(() => true).catch(() => false)
      
      if (!fileExists) {
        throw new Error('No data file exists to backup')
      }
      
      const data = await fs.readFile(this.dataFile, 'utf-8')
      await fs.writeFile(backupFile, data, 'utf-8')
      
      return backupFile
    } catch (error) {
      throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async restore(backupPath: string): Promise<void> {
    try {
      await this.ensureDirectories()
      
      const backupExists = await fs.access(backupPath).then(() => true).catch(() => false)
      
      if (!backupExists) {
        throw new Error(`Backup file does not exist: ${backupPath}`)
      }
      
      const backupData = await fs.readFile(backupPath, 'utf-8')
      
      JSON.parse(backupData)
      
      await fs.writeFile(this.dataFile, backupData, 'utf-8')
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Backup file is corrupted: ${error.message}`)
      }
      throw new Error(`Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async cleanupOldBackups(maxBackups: number = 10): Promise<void> {
    try {
      await this.ensureDirectories()
      
      const files = await fs.readdir(this.backupDir)
      const backupFiles = files
        .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file)
        }))
        .sort((a, b) => b.name.localeCompare(a.name))
      
      if (backupFiles.length > maxBackups) {
        const filesToDelete = backupFiles.slice(maxBackups)
        
        for (const file of filesToDelete) {
          await fs.unlink(file.path)
        }
      }
    } catch (error) {
      console.warn(`Failed to cleanup old backups: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const persistenceService = new FilePersistenceService()