import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import path from "node:path";

let _db: DatabaseSync | null = null;

/**
 * Conexión única a SQLite. Se usa `node:sqlite` (integrado en Node 22+)
 * para no depender de binarios nativos ni de un servicio externo.
 *
 * Para pasar a Postgres en producción alcanza con reimplementar
 * `src/lib/repo/*` respetando las mismas firmas.
 */
export function db(): DatabaseSync {
  if (_db) return _db;
  const file = process.env.DATABASE_FILE ?? path.join(process.cwd(), "rastro.db");
  const conn = new DatabaseSync(file);
  const schema = readFileSync(
    path.join(process.cwd(), "src/lib/db/schema.sql"),
    "utf8",
  );
  conn.exec(schema);

  // Migraciones livianas para bases creadas antes de sumar esta columna.
  // ALTER TABLE ADD COLUMN falla si ya existe; lo ignoramos a propósito.
  try {
    conn.exec(`ALTER TABLE categories ADD COLUMN home_visible INTEGER NOT NULL DEFAULT 0`);
  } catch {
    // ya existe
  }

  _db = conn;
  return conn;
}

/**
 * `node:sqlite` devuelve filas con prototipo nulo, que React Server
 * Components no puede serializar hacia el cliente. Las normalizamos acá.
 */
function plain<T>(row: unknown): T {
  return { ...(row as object) } as T;
}

export function all<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] {
  const rows = db().prepare(sql).all(...(params as never[]));
  return rows.map((r) => plain<T>(r));
}

export function get<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T | undefined {
  const row = db().prepare(sql).get(...(params as never[]));
  return row === undefined ? undefined : plain<T>(row);
}

export function run(sql: string, ...params: unknown[]) {
  return db().prepare(sql).run(...(params as never[]));
}
