import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large base64 payload for photo uploads and backups
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  const DATA_DIR = path.join(process.cwd(), 'server_data');
  const BACKUP_FILE = path.join(DATA_DIR, 'master_league_backup.json');
  const SYNC_CODES_FILE = path.join(DATA_DIR, 'sync_codes.json');

  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.error('Could not create data dir', e);
    }
  }

  // Helper to read/write sync codes store
  const getSyncCodes = (): Record<string, { data: any; createdAt: string; name?: string }> => {
    try {
      if (fs.existsSync(SYNC_CODES_FILE)) {
        return JSON.parse(fs.readFileSync(SYNC_CODES_FILE, 'utf-8'));
      }
    } catch (e) {
      console.error('Error reading sync codes file', e);
    }
    return {};
  };

  const saveSyncCodes = (codes: Record<string, any>) => {
    try {
      fs.writeFileSync(SYNC_CODES_FILE, JSON.stringify(codes, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing sync codes file', e);
    }
  };

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Load server-side backup
  app.get('/api/backup/load', (req, res) => {
    try {
      if (fs.existsSync(BACKUP_FILE)) {
        const raw = fs.readFileSync(BACKUP_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const stats = fs.statSync(BACKUP_FILE);
        return res.json({
          success: true,
          data: parsed,
          lastSaved: stats.mtime.toISOString(),
        });
      }
      return res.json({
        success: false,
        message: 'Chưa có bản sao lưu trên máy chủ',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save server-side backup
  app.post('/api/backup/save', (req, res) => {
    try {
      const payload = req.body;
      if (!payload || Object.keys(payload).length === 0) {
        return res.status(400).json({ success: false, error: 'Dữ liệu rỗng' });
      }
      fs.writeFileSync(BACKUP_FILE, JSON.stringify(payload, null, 2), 'utf-8');
      return res.json({
        success: true,
        message: 'Đã sao lưu thành công lên máy chủ',
        lastSaved: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create or update a 6-digit Sync Code for instant pairing between iPhone & PC
  app.post('/api/backup/sync-code/create', (req, res) => {
    try {
      const { data, customCode } = req.body;
      if (!data) {
        return res.status(400).json({ success: false, error: 'Thiếu dữ liệu đồng bộ' });
      }

      // Generate a clean 6-digit PIN (e.g. 748291)
      let pin = customCode ? String(customCode).trim().replace(/\D/g, '').slice(0, 6) : '';
      if (!pin || pin.length < 4) {
        pin = Math.floor(100000 + Math.random() * 900000).toString();
      }

      const allCodes = getSyncCodes();
      allCodes[pin] = {
        data,
        createdAt: new Date().toISOString(),
        name: data?.managers?.[0]?.name || 'Master League Backup',
      };

      saveSyncCodes(allCodes);

      return res.json({
        success: true,
        code: pin,
        message: `Đã tạo mã đồng bộ thành công: ${pin}`,
        expiresIn: 'Vĩnh viễn trên máy chủ này',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Retrieve backup by 6-digit sync code
  app.get('/api/backup/sync-code/:code', (req, res) => {
    try {
      const rawCode = req.params.code.trim().replace(/\D/g, '');
      const allCodes = getSyncCodes();
      const match = allCodes[rawCode];

      if (match && match.data) {
        return res.json({
          success: true,
          code: rawCode,
          data: match.data,
          createdAt: match.createdAt,
          name: match.name,
        });
      }

      return res.status(404).json({
        success: false,
        error: `Không tìm thấy bản sao lưu với mã ${rawCode}. Vui lòng kiểm tra lại mã PIN!`,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for dev / static build for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Master League server running on http://localhost:${PORT}`);
  });
}

startServer();
