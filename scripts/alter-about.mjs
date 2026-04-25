import mysql from "mysql2/promise";

async function alterAbout() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    console.log("✅ Connected to MySQL\n");

    try {
        // Menghapus kolom description_2
        await connection.execute(`
      ALTER TABLE about_section
      DROP COLUMN description_2
    `);
        console.log("✅ Column 'description_2' successfully dropped from 'about_section'\n");
    } catch (err) {
        // Mengabaikan error jika kolom sudah tidak ada (contoh: sudah pernah di-run)
        if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
            console.log("⚠️  Column 'description_2' does not exist. Skipping drop...\n");
        } else {
            console.error("❌ Alter failed:", err);
            process.exit(1);
        }
    }

    await connection.end();
    process.exit(0);
}

alterAbout().catch((err) => {
    console.error("❌ Script failed:", err);
    process.exit(1);
});
