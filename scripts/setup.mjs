import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scripts = [
    'seed.mjs',
    'alter-db.mjs',
    'alter-db-2.mjs',
    'alter-db-project-media.mjs',
    'alter-db-about-cv.mjs',
    'alter-about.mjs',
    'seed-about.mjs',
    'seed-contact.mjs',
    'seed-experience.mjs',
    'seed-projects.mjs',
    'seed-skills.mjs'
];

console.log('🚀 Memulai setup database...\n');

for (const script of scripts) {
    const scriptPath = path.join(__dirname, script);
    console.log(`⏳ Menjalankan: ${script}...`);
    try {
        // Gunakan --env-file=.env jika tersedia di versi Node (Node 20+)
        // Jika tidak, asumsikan process.env sudah terisi atau script memuat .env sendiri
        execSync(`node --env-file=.env "${scriptPath}"`, { stdio: 'inherit' });
        console.log(`✅ Selesai: ${script}\n`);
    } catch (error) {
        console.warn(`⚠️  Gagal menjalankan ${script}, mungkin sudah pernah dijalankan atau ada error. Melanjutkan...\n`);
    }
}

console.log('✨ Setup database selesai!');
