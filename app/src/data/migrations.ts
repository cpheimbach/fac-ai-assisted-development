import { AppStore } from './store'
import { persistenceService } from './persistence'

interface MigrationData {
  trips?: unknown[] | Map<string, unknown>
  weather?: unknown[] | Map<string, unknown>
  lastSync?: string | Date
  _migrationState?: MigrationState
  [key: string]: unknown
}

export interface Migration {
  version: string
  description: string
  up: (data: MigrationData) => MigrationData
  down: (data: MigrationData) => MigrationData
}

export interface MigrationState {
  currentVersion: string
  appliedMigrations: string[]
  lastMigration: Date
}

const CURRENT_VERSION = '1.0.0'

export const migrations: Migration[] = [
  {
    version: '1.0.0',
    description: 'Initial data structure',
    up: (data: MigrationData): MigrationData => {
      const result = { ...data }
      if (!result.trips) result.trips = []
      if (!result.weather) result.weather = []
      if (!result.lastSync) result.lastSync = new Date().toISOString()
      return result
    },
    down: (data: MigrationData): MigrationData => {
      return { ...data }
    }
  }
]

class MigrationService {
  private getMigrationState(data: MigrationData): MigrationState {
    return data._migrationState || {
      currentVersion: '0.0.0',
      appliedMigrations: [],
      lastMigration: new Date()
    }
  }

  private setMigrationState(data: MigrationData, state: MigrationState): void {
    data._migrationState = {
      ...state,
      lastMigration: new Date()
    }
  }

  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0
      const v2Part = v2Parts[i] || 0
      
      if (v1Part < v2Part) return -1
      if (v1Part > v2Part) return 1
    }
    
    return 0
  }

  needsMigration(data: MigrationData): boolean {
    const migrationState = this.getMigrationState(data)
    return this.compareVersions(migrationState.currentVersion, CURRENT_VERSION) < 0
  }

  async migrate(data: MigrationData): Promise<MigrationData> {
    try {
      const migrationState = this.getMigrationState(data)
      const currentVersion = migrationState.currentVersion
      
      if (!this.needsMigration(data)) {
        return data
      }

      await persistenceService.backup()

      const applicableMigrations = migrations.filter(migration => 
        this.compareVersions(migration.version, currentVersion) > 0 &&
        this.compareVersions(migration.version, CURRENT_VERSION) <= 0
      ).sort((a, b) => this.compareVersions(a.version, b.version))

      let migratedData = { ...data }
      const appliedMigrations = [...migrationState.appliedMigrations]

      for (const migration of applicableMigrations) {
        try {
          console.log(`Applying migration: ${migration.version} - ${migration.description}`)
          migratedData = migration.up(migratedData)
          appliedMigrations.push(migration.version)
        } catch (error) {
          throw new Error(`Migration ${migration.version} failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      this.setMigrationState(migratedData, {
        currentVersion: CURRENT_VERSION,
        appliedMigrations,
        lastMigration: new Date()
      })

      return migratedData
    } catch (error) {
      throw new Error(`Migration process failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async rollback(data: MigrationData, targetVersion: string): Promise<MigrationData> {
    try {
      const migrationState = this.getMigrationState(data)
      
      if (this.compareVersions(targetVersion, migrationState.currentVersion) >= 0) {
        throw new Error('Target version must be lower than current version')
      }

      await persistenceService.backup()

      const rollbackMigrations = migrations.filter(migration => 
        this.compareVersions(migration.version, targetVersion) > 0 &&
        migrationState.appliedMigrations.includes(migration.version)
      ).sort((a, b) => this.compareVersions(b.version, a.version))

      let rolledBackData = { ...data }
      const appliedMigrations = migrationState.appliedMigrations.filter(version =>
        this.compareVersions(version, targetVersion) <= 0
      )

      for (const migration of rollbackMigrations) {
        try {
          console.log(`Rolling back migration: ${migration.version} - ${migration.description}`)
          rolledBackData = migration.down(rolledBackData)
        } catch (error) {
          throw new Error(`Rollback of migration ${migration.version} failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      this.setMigrationState(rolledBackData, {
        currentVersion: targetVersion,
        appliedMigrations,
        lastMigration: new Date()
      })

      return rolledBackData
    } catch (error) {
      throw new Error(`Rollback process failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  getMigrationInfo(data: MigrationData): {
    currentVersion: string
    targetVersion: string
    needsMigration: boolean
    appliedMigrations: string[]
    availableMigrations: string[]
  } {
    const migrationState = this.getMigrationState(data)
    
    return {
      currentVersion: migrationState.currentVersion,
      targetVersion: CURRENT_VERSION,
      needsMigration: this.needsMigration(data),
      appliedMigrations: migrationState.appliedMigrations,
      availableMigrations: migrations.map(m => m.version)
    }
  }

  async loadAndMigrate(): Promise<AppStore> {
    try {
      const rawData = await persistenceService.load()
      
      if (this.needsMigration(rawData as MigrationData)) {
        console.log('Data migration required, applying migrations...')
        const migratedData = await this.migrate(rawData as MigrationData)
        await persistenceService.save(migratedData as AppStore)
        return migratedData as AppStore
      }
      
      return rawData
    } catch (error) {
      throw new Error(`Failed to load and migrate data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const migrationService = new MigrationService()