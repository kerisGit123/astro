import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon to use WebSocket for Better Auth compatibility
neonConfig.webSocketConstructor = ws;

// Create pool with optimized settings for Neon serverless
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
});

// Helper function for simple queries with better error handling
export async function query(text: string, params?: any[]) {
    let client;
    try {
        client = await pool.connect();
        const result = await client.query(text, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}

export default pool;
