import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import multer from "multer";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'video', 'image', 'project'
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    preview_path TEXT,
    collection_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    preview_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const app = express();
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// API Routes
app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (password === "RISKALIYEV201010") {
    res.json({ success: true, token: "admin-token-mock" });
  } else {
    res.status(401).json({ success: false, message: "Noto'g'ri parol" });
  }
});

app.get("/api/items", (req, res) => {
  const { type, collection_id } = req.query;
  let query = "SELECT * FROM items";
  const params = [];

  if (type || collection_id) {
    query += " WHERE";
    if (type) {
      query += " type = ?";
      params.push(type);
    }
    if (collection_id) {
      if (type) query += " AND";
      query += " collection_id = ?";
      params.push(collection_id);
    }
  }
  
  query += " ORDER BY created_at DESC";
  const items = db.prepare(query).all(...params);
  res.json(items);
});

app.post("/api/items", upload.fields([{ name: 'file', maxCount: 1 }, { name: 'preview', maxCount: 1 }]), (req, res) => {
  const { type, title, description, collection_id, password } = req.body;
  
  if (password !== "RISKALIYEV201010") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const filePath = files['file'] ? `/uploads/${files['file'][0].filename}` : "";
  const previewPath = files['preview'] ? `/uploads/${files['preview'][0].filename}` : "";

  const stmt = db.prepare("INSERT INTO items (type, title, description, file_path, preview_path, collection_id) VALUES (?, ?, ?, ?, ?, ?)");
  const result = stmt.run(type, title, description, filePath, previewPath, collection_id || null);
  
  res.json({ id: result.lastInsertRowid });
});

app.delete("/api/items/:id", (req, res) => {
  const { password } = req.body;
  if (password !== "RISKALIYEV201010") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id) as any;
  if (item) {
    // Optionally delete files from disk here
  }
  
  db.prepare("DELETE FROM items WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/collections", (req, res) => {
  const collections = db.prepare("SELECT * FROM collections ORDER BY created_at DESC").all();
  res.json(collections);
});

app.post("/api/collections", upload.single('preview'), (req, res) => {
  const { name, description, password } = req.body;
  if (password !== "RISKALIYEV201010") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const previewPath = req.file ? `/uploads/${req.file.filename}` : "";
  const stmt = db.prepare("INSERT INTO collections (name, description, preview_path) VALUES (?, ?, ?)");
  const result = stmt.run(name, description, previewPath);
  res.json({ id: result.lastInsertRowid });
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
