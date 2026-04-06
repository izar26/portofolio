import mysql from "mysql2/promise";

async function seedAbout() {
    const connection = await mysql.createConnection({
        host: "localhost",
        user: "izar",
        password: "261426",
        database: "portofolio",
    });

    console.log("✅ Connected to MySQL\n");

    // Create about_section table
    await connection.execute(`
    CREATE TABLE IF NOT EXISTS about_section (
      id INT PRIMARY KEY DEFAULT 1,
      description_1 TEXT NOT NULL,
      description_2 TEXT NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      location_badge VARCHAR(100) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      role VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      location_detail VARCHAR(100) NOT NULL,
      stats_1_value VARCHAR(50) NOT NULL,
      stats_1_label VARCHAR(100) NOT NULL,
      stats_2_value VARCHAR(50) NOT NULL,
      stats_2_label VARCHAR(100) NOT NULL,
      stats_3_value VARCHAR(50) NOT NULL,
      stats_3_label VARCHAR(100) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CHECK (id = 1)
    )
  `);
    console.log("✅ Table 'about_section' created\n");

    // Check if data already exists
    const [rows] = await connection.execute(
        "SELECT id FROM about_section WHERE id = 1"
    );

    const defaultData = {
        id: 1,
        description_1: "Saya adalah seorang Software Engineer yang bersemangat, mengkhususkan diri dalam membangun aplikasi web yang skalabel dan memukau. Dengan kecintaan mendalam pada desain estetis dan pengembangan pixel-perfect, saya berusaha menciptakan pengalaman digital yang meninggalkan kesan mendalam.",
        description_2: "Perjalanan saya dimulai dari rasa ingin tahu tentang cara kerja internet, yang dengan cepat berkembang menjadi sebuah karir yang mengisi passion saya setiap harinya. Fokus utama saya bukan sekadar menulis kode, namun menyusun solusi elegan untuk permasalahan kompleks—memastikan produk akhir tidak hanya fungsional, tapi juga menyenangkan untuk digunakan pengguna.",
        image_url: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=1500&auto=format&fit=crop",
        location_badge: "Jakarta, ID",
        full_name: "John Doe",
        role: "Senior Software Eng.",
        email: "hello@example.com",
        location_detail: "Jakarta, Indonesia",
        stats_1_value: "5+",
        stats_1_label: "Tahun Pengalaman",
        stats_2_value: "50+",
        stats_2_label: "Proyek Selesai",
        stats_3_value: "100%",
        stats_3_label: "Kepuasan Klien"
    };

    if (Array.isArray(rows) && rows.length > 0) {
        console.log("⚠️  About section data already exists. Skipping insertion...\n");
    } else {
        await connection.execute(
            `INSERT INTO about_section (
        id, description_1, description_2, image_url, location_badge, 
        full_name, role, email, location_detail, 
        stats_1_value, stats_1_label, stats_2_value, stats_2_label, stats_3_value, stats_3_label
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                defaultData.id, defaultData.description_1, defaultData.description_2, defaultData.image_url, defaultData.location_badge,
                defaultData.full_name, defaultData.role, defaultData.email, defaultData.location_detail,
                defaultData.stats_1_value, defaultData.stats_1_label, defaultData.stats_2_value, defaultData.stats_2_label, defaultData.stats_3_value, defaultData.stats_3_label
            ]
        );
        console.log("✅ Initial 'about_section' data inserted\n");
    }

    await connection.end();
    process.exit(0);
}

seedAbout().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
