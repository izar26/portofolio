import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function alterDb() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'portofolio_db',
    });

    try {
        console.log('Adding cv_url column to about_section table if not exists...');
        
        const [columns] = await connection.query('SHOW COLUMNS FROM about_section LIKE "cv_url"');
        
        if (columns.length === 0) {
            await connection.query('ALTER TABLE about_section ADD COLUMN cv_url VARCHAR(255) NULL AFTER image_url');
            console.log('Column cv_url added successfully.');
        } else {
            console.log('Column cv_url already exists.');
        }

    } catch (error) {
        console.error('Error altering database:', error);
    } finally {
        await connection.end();
        console.log('Database connection closed.');
    }
}

alterDb();
