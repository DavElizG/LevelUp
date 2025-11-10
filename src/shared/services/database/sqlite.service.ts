import { CapacitorSQLite, SQLiteDBConnection, SQLiteConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export interface LocalWorkoutSession {
  id: string;
  routine_id: string;
  session_date: string;
  start_time: string;
  end_time?: string;
  notes?: string;
  rating?: number;
  synced: boolean;
  created_at: string;
}

export interface LocalExerciseLog {
  id: string;
  session_id: string;
  exercise_id: string;
  order_performed: number;
  sets_completed: number;
  reps_performed: string; // JSON array
  weight_used_kg: string; // JSON array
  rest_time_seconds?: string; // JSON array
  notes?: string;
  skipped: boolean;
  synced: boolean;
  created_at: string;
}

export interface LocalProgressTracking {
  id: string;
  record_date: string;
  metric_type: string;
  value: number;
  unit: string;
  notes?: string;
  synced: boolean;
  created_at: string;
}

class SQLiteService {
  private dbConnection: SQLiteDBConnection | null = null;
  private sqlite: SQLiteConnection;
  private dbName = 'levelup_local';
  private isInitialized = false;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if platform supports SQLite
      if (!Capacitor.isNativePlatform() && !Capacitor.getPlatform().includes('web')) {
        console.warn('SQLite not available on this platform, using fallback');
        return;
      }

      // Check connection availability
      const isAvailable = await this.sqlite.isConnection(this.dbName, false);
      
      if (isAvailable.result) {
        this.dbConnection = await this.sqlite.retrieveConnection(this.dbName, false);
      } else {
        this.dbConnection = await this.sqlite.createConnection(
          this.dbName,
          false,
          'no-encryption',
          1,
          false
        );
      }

      await this.dbConnection.open();
      await this.createTables();
      this.isInitialized = true;
      
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SQLite:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.dbConnection) throw new Error('Database not initialized');

    const createTablesSQL = `
      -- Tabla de sesiones de entrenamiento local
      CREATE TABLE IF NOT EXISTS local_workout_sessions (
        id TEXT PRIMARY KEY,
        routine_id TEXT NOT NULL,
        session_date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        notes TEXT,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        synced INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );

      -- Tabla de ejercicios realizados en cada sesión
      CREATE TABLE IF NOT EXISTS local_exercise_logs (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        order_performed INTEGER NOT NULL,
        sets_completed INTEGER NOT NULL,
        reps_performed TEXT NOT NULL,
        weight_used_kg TEXT NOT NULL,
        rest_time_seconds TEXT,
        notes TEXT,
        skipped INTEGER DEFAULT 0,
        synced INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES local_workout_sessions(id)
      );

      -- Tabla de progreso (peso, medidas, etc.)
      CREATE TABLE IF NOT EXISTS local_progress_tracking (
        id TEXT PRIMARY KEY,
        record_date TEXT NOT NULL,
        metric_type TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT NOT NULL,
        notes TEXT,
        synced INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );

      -- Índices para mejor rendimiento
      CREATE INDEX IF NOT EXISTS idx_sessions_date ON local_workout_sessions(session_date);
      CREATE INDEX IF NOT EXISTS idx_sessions_synced ON local_workout_sessions(synced);
      CREATE INDEX IF NOT EXISTS idx_exercises_session ON local_exercise_logs(session_id);
      CREATE INDEX IF NOT EXISTS idx_exercises_synced ON local_exercise_logs(synced);
      CREATE INDEX IF NOT EXISTS idx_progress_date ON local_progress_tracking(record_date);
      CREATE INDEX IF NOT EXISTS idx_progress_synced ON local_progress_tracking(synced);
    `;

    await this.dbConnection.execute(createTablesSQL);
  }

  // ==================== WORKOUT SESSIONS ====================

  async saveWorkoutSession(session: Omit<LocalWorkoutSession, 'created_at'>): Promise<void> {
    if (!this.dbConnection) await this.initialize();

    const query = `
      INSERT INTO local_workout_sessions 
      (id, routine_id, session_date, start_time, end_time, notes, rating, synced, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.dbConnection!.run(query, [
      session.id,
      session.routine_id,
      session.session_date,
      session.start_time,
      session.end_time || null,
      session.notes || null,
      session.rating || null,
      session.synced ? 1 : 0,
      new Date().toISOString(),
    ]);
  }

  async getWorkoutSessions(limit = 50): Promise<LocalWorkoutSession[]> {
    if (!this.dbConnection) await this.initialize();

    const query = `
      SELECT * FROM local_workout_sessions 
      ORDER BY session_date DESC, start_time DESC 
      LIMIT ?
    `;

    const result = await this.dbConnection!.query(query, [limit]);
    return result.values as LocalWorkoutSession[];
  }

  async getUnsyncedWorkoutSessions(): Promise<LocalWorkoutSession[]> {
    if (!this.dbConnection) await this.initialize();

    const query = `SELECT * FROM local_workout_sessions WHERE synced = 0`;
    const result = await this.dbConnection!.query(query);
    return result.values as LocalWorkoutSession[];
  }

  async markWorkoutSessionAsSynced(sessionId: string): Promise<void> {
    if (!this.dbConnection) await this.initialize();

    const query = `UPDATE local_workout_sessions SET synced = 1 WHERE id = ?`;
    await this.dbConnection!.run(query, [sessionId]);
  }

  // ==================== EXERCISE LOGS ====================

  async saveExerciseLog(log: Omit<LocalExerciseLog, 'created_at'>): Promise<void> {
    if (!this.dbConnection) await this.initialize();

    const query = `
      INSERT INTO local_exercise_logs 
      (id, session_id, exercise_id, order_performed, sets_completed, reps_performed, 
       weight_used_kg, rest_time_seconds, notes, skipped, synced, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.dbConnection!.run(query, [
      log.id,
      log.session_id,
      log.exercise_id,
      log.order_performed,
      log.sets_completed,
      log.reps_performed,
      log.weight_used_kg,
      log.rest_time_seconds || null,
      log.notes || null,
      log.skipped ? 1 : 0,
      log.synced ? 1 : 0,
      new Date().toISOString(),
    ]);
  }

  async getExerciseLogsBySession(sessionId: string): Promise<LocalExerciseLog[]> {
    if (!this.dbConnection) await this.initialize();

    const query = `
      SELECT * FROM local_exercise_logs 
      WHERE session_id = ? 
      ORDER BY order_performed
    `;

    const result = await this.dbConnection!.query(query, [sessionId]);
    return result.values as LocalExerciseLog[];
  }

  async getUnsyncedExerciseLogs(): Promise<LocalExerciseLog[]> {
    if (!this.dbConnection) await this.initialize();

    const query = `SELECT * FROM local_exercise_logs WHERE synced = 0`;
    const result = await this.dbConnection!.query(query);
    return result.values as LocalExerciseLog[];
  }

  async markExerciseLogAsSynced(logId: string): Promise<void> {
    if (!this.dbConnection) await this.initialize();

    const query = `UPDATE local_exercise_logs SET synced = 1 WHERE id = ?`;
    await this.dbConnection!.run(query, [logId]);
  }

  // ==================== PROGRESS TRACKING ====================

  async saveProgressTracking(progress: Omit<LocalProgressTracking, 'created_at'>): Promise<void> {
    if (!this.dbConnection) await this.initialize();

    const query = `
      INSERT INTO local_progress_tracking 
      (id, record_date, metric_type, value, unit, notes, synced, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.dbConnection!.run(query, [
      progress.id,
      progress.record_date,
      progress.metric_type,
      progress.value,
      progress.unit,
      progress.notes || null,
      progress.synced ? 1 : 0,
      new Date().toISOString(),
    ]);
  }

  async getProgressTracking(metricType?: string, limit = 100): Promise<LocalProgressTracking[]> {
    if (!this.dbConnection) await this.initialize();

    let query = `
      SELECT * FROM local_progress_tracking 
      ${metricType ? 'WHERE metric_type = ?' : ''}
      ORDER BY record_date DESC 
      LIMIT ?
    `;

    const params = metricType ? [metricType, limit] : [limit];
    const result = await this.dbConnection!.query(query, params);
    return result.values as LocalProgressTracking[];
  }

  async getUnsyncedProgressTracking(): Promise<LocalProgressTracking[]> {
    if (!this.dbConnection) await this.initialize();

    const query = `SELECT * FROM local_progress_tracking WHERE synced = 0`;
    const result = await this.dbConnection!.query(query);
    return result.values as LocalProgressTracking[];
  }

  async markProgressTrackingAsSynced(id: string): Promise<void> {
    if (!this.dbConnection) await this.initialize();

    const query = `UPDATE local_progress_tracking SET synced = 1 WHERE id = ?`;
    await this.dbConnection!.run(query, [id]);
  }

  // ==================== UTILITY METHODS ====================

  async clearAllData(): Promise<void> {
    if (!this.dbConnection) await this.initialize();

    await this.dbConnection!.execute(`
      DELETE FROM local_exercise_logs;
      DELETE FROM local_workout_sessions;
      DELETE FROM local_progress_tracking;
    `);
  }

  async close(): Promise<void> {
    if (this.dbConnection) {
      await this.dbConnection.close();
      await this.sqlite.closeConnection(this.dbName, false);
      this.isInitialized = false;
      this.dbConnection = null;
    }
  }

  async getStorageStats(): Promise<{
    sessions: number;
    exercises: number;
    progress: number;
    unsynced: number;
  }> {
    if (!this.dbConnection) await this.initialize();

    const sessionsResult = await this.dbConnection!.query('SELECT COUNT(*) as count FROM local_workout_sessions');
    const exercisesResult = await this.dbConnection!.query('SELECT COUNT(*) as count FROM local_exercise_logs');
    const progressResult = await this.dbConnection!.query('SELECT COUNT(*) as count FROM local_progress_tracking');
    
    const unsyncedResult = await this.dbConnection!.query(`
      SELECT 
        (SELECT COUNT(*) FROM local_workout_sessions WHERE synced = 0) +
        (SELECT COUNT(*) FROM local_exercise_logs WHERE synced = 0) +
        (SELECT COUNT(*) FROM local_progress_tracking WHERE synced = 0) as count
    `);

    return {
      sessions: sessionsResult.values![0].count,
      exercises: exercisesResult.values![0].count,
      progress: progressResult.values![0].count,
      unsynced: unsyncedResult.values![0].count,
    };
  }
}

export const sqliteService = new SQLiteService();
