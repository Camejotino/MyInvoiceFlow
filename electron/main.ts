// Basic imports that are unlikely to fail
import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron';
import path from 'path';

let prisma: any;
let Prisma: any;

let loadURL: any;
let isDev: boolean;

// Simple file logger for production debugging
const fs = require('fs');
const logPath = path.join(app.getPath('userData'), 'startup-log.txt');
function log(msg: string) {
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
  } catch (e) {
    console.error('Logging failed', e);
  }
}

(async () => {
  try {
    log('--- App starting ---');
    log(`isPackaged: ${app.isPackaged}`);
    log(`__dirname: ${__dirname}`);

    // 1. Determine environment
    isDev = !app.isPackaged;
    log('Mode: ' + (isDev ? 'development' : 'production'));

    if (!isDev) {
      try {
        log('Loading electron-serve...');
        const serve = (await eval('import("electron-serve")')).default;
        // Since main.js is in dist-electron/, 'out' is in the parent directory in the ASAR
        const serveDir = path.join(__dirname, '..', 'out');
        log(`Serving from: ${serveDir}`);
        // IMPORTANTE: No pasamos la función directamente, creamos un wrapper que maneja las rutas SPA
        const baseServe = serve({ directory: serveDir });
        loadURL = (mainWindow: any) => {
          baseServe(mainWindow);
        };
      } catch (err: any) {
        throw new Error(`Failed to initialize electron-serve: ${err.message}`);
      }
    }

    // Wait for app to be ready before initializing DB logic or creating windows
    if (!app.isReady()) {
      await app.whenReady();
    }

    // 3. Load Prisma Client (Dynamic require to catch errors)
    try {
      log('Loading Prisma Client...');
      const prismaModule = require('./prisma-client');
      Prisma = prismaModule.Prisma;

      const userDataPath = app.getPath('userData');
      const dbPath = isDev
        ? path.join(__dirname, '../prisma/data/dev.db')
        : path.join(userDataPath, 'database.db');

      console.log('Database path:', dbPath);

      // Ensure DB directory exists (not strictly needed for userData, but good practice)
      const fs = require('fs');
      if (!isDev && !fs.existsSync(dbPath)) {
        const dbTemplatePath = path.join(process.resourcesPath, 'prisma/data/dev.db');
        console.log('Searching for template at:', dbTemplatePath);

        try {
          if (fs.existsSync(dbTemplatePath)) {
            fs.copyFileSync(dbTemplatePath, dbPath);
            console.log('Database template copied successfully');
          } else {
            console.error('Database template not found at:', dbTemplatePath);
          }
        } catch (e: any) {
          console.error("Failed to copy database", e);
          dialog.showErrorBox("Database Error", `Failed to initialize database: ${e.message}`);
        }
      }

      prisma = new prismaModule.PrismaClient({
        datasources: {
          db: { url: `file:${dbPath}` },
        },
      });
    } catch (e: any) {
      console.error('Prisma initialization failed:', e);
      // If app is ready, show error box. If not, the top-level catch will handle it.
      if (app.isReady()) {
        dialog.showErrorBox('Prisma Error', `Could not initialize database client: ${e.message}\n${e.stack}`);
      }
      // Decide whether to quit or continue without DB access. For now, let's quit if Prisma fails.
      app.quit();
      return; // Exit the async IIFE
    }

    // 4. Create Window
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

  } catch (error: any) {
    log(`FATAL ERROR: ${error.message}\n${error.stack}`);
    if (!app.isReady()) await app.whenReady();
    dialog.showErrorBox(
      'Startup Error',
      `A fatal error occurred during application startup:\n\n${error.message}\n\n${error.stack}\n\nCheck logs at: ${logPath}`
    );
    app.quit();
  }
})();

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const mainWindow = new BrowserWindow({
    width,
    height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../public/icon.png'),
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // If we're here, loadURL should be defined because of the async init
    if (loadURL) {
      loadURL(mainWindow);
    } else {
      // Fallback or error handling
      console.error("loadURL is not defined in production!");
    }
  }
}

// --- IPC Handlers ---

// Invoices: Next Number
ipcMain.handle('invoices:next-number', async () => {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 1,
          nextInvoiceNumber: 2500,
          defaultDispatchFee: 0,
          companyInfo: "Pino's Enterprise Multiservices",
        },
      });
    }
    return { invoiceNumber: settings.nextInvoiceNumber };
  } catch (error) {
    console.error('Error fetching next invoice number:', error);
    throw error;
  }
});

// Invoices: List
ipcMain.handle('invoices:list', async (_, { q, page = 1, pageSize = 20 }) => {
  try {
    const skip = (page - 1) * pageSize;
    const where = q
      ? {
        OR: [
          { invoiceNumber: { contains: q } },
          { soldTo: { contains: q } },
        ],
      }
      : {};

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.invoice.count({ where }),
    ]);

    return JSON.parse(JSON.stringify({ items, total, page, pageSize }));
  } catch (error) {
    console.error('Error listing invoices:', error);
    throw error;
  }
});

// Invoices: Create
ipcMain.handle('invoices:create', async (_, data) => {
  try {
    const { date, soldTo, items, subtotal, dispatchFee, total } = data;

    // Basic validation
    if (!date) throw new Error('date requerido');
    if (!soldTo) throw new Error('soldTo requerido');
    if (!items || !items.length) throw new Error('items requerido');

    // Use transaction
    const invoice = await prisma.$transaction(async (tx: any) => {
      let settings = await tx.settings.findUnique({ where: { id: 1 } });
      if (!settings) {
        settings = await tx.settings.create({
          data: {
            id: 1,
            nextInvoiceNumber: 2500,
            defaultDispatchFee: 0,
            companyInfo: "Pino's Enterprise Multiservices",
          },
        });
      }

      const invoiceNumber = settings.nextInvoiceNumber.toString();

      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          date: new Date(date),
          soldTo,
          subtotal: new Prisma.Decimal(subtotal || 0),
          dispatchFee: new Prisma.Decimal(dispatchFee || 0),
          total: new Prisma.Decimal(total || 0),
          items: {
            create: items.map((item: any) => ({
              date: item.date ? new Date(item.date) : null,
              truckNumber: item.truckNumber || '',
              ticketNumber: item.ticketNumber || '',
              projectName: item.projectName || '',
              quantity: new Prisma.Decimal(item.quantity || 0),
              rate: new Prisma.Decimal(item.rate || 0),
              total: new Prisma.Decimal(item.total || 0),
            })),
          },
        },
        include: { items: true },
      });

      await tx.settings.update({
        where: { id: 1 },
        data: { nextInvoiceNumber: settings.nextInvoiceNumber + 1 },
      });

      return newInvoice;
    });

    return JSON.parse(JSON.stringify(invoice));
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    throw error;
  }
});

// Invoices: Delete
ipcMain.handle('invoices:delete', async (_, id) => {
  try {
    // Check if exists
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new Error('Factura no encontrada');

    // Delete (cascade should handle items, but carefully check schema)
    // Schema says: invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade) for InvoiceRowItem
    // Ticket relation is optional? 
    // model Ticket { ... invoice Invoice? ... }
    // If ticket is linked, we might need to unlink it or it might restrict deletion if no cascade.
    // Ticket doesn't have onDelete: Cascade in the relation definition in Ticket model?
    //   invoice Invoice? @relation(fields: [invoiceId], references: [id])
    // So we should probably unlink tickets first just in case, or rely on Prisma behavior. 
    // Safest to unlink tickets.

    await prisma.ticket.updateMany({
      where: { invoiceId: id },
      data: { invoiceId: null }
    });

    const deleted = await prisma.invoice.delete({ where: { id } });
    return JSON.parse(JSON.stringify(deleted));
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
});

// Trucks: List
ipcMain.handle('trucks:list', async (_, { q, page = 1, pageSize = 20 }) => {
  try {
    const skip = (page - 1) * pageSize;
    const where = q
      ? { OR: [{ number: { contains: q } }, { description: { contains: q } }] }
      : {};

    const [items, total] = await Promise.all([
      prisma.truck.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      prisma.truck.count({ where })
    ]);
    return { items, total, page, pageSize };
  } catch (error) {
    console.error('Error listing trucks:', error);
    throw error;
  }
});

// Trucks: Get
ipcMain.handle('trucks:get', async (_, id) => {
  try {
    const truck = await prisma.truck.findUnique({ where: { id } });
    if (!truck) throw new Error("Truck not found");
    return truck;
  } catch (e) {
    throw e;
  }
});

// Trucks: Create
ipcMain.handle('trucks:create', async (_, { number, description, active }) => {
  try {
    if (!number) throw new Error('number requerido');
    const created = await prisma.truck.create({
      data: { number, description: description ?? '', active: active ?? true }
    });
    return created;
  } catch (error) {
    console.error('Error creating truck:', error);
    throw error;
  }
});

// Trucks: Update
ipcMain.handle('trucks:update', async (_, id, data) => {
  try {
    const updated = await prisma.truck.update({ where: { id }, data });
    return updated;
  } catch (error) {
    console.error("Error updating truck", error);
    throw error;
  }
});

// Trucks: Delete
ipcMain.handle('trucks:delete', async (_, id) => {
  try {
    // Check for associated tickets involved in an invoice
    const ticketsWithInvoice = await prisma.ticket.findFirst({
      where: {
        truckId: id,
        invoiceId: { not: null }
      }
    });

    if (ticketsWithInvoice) {
      throw new Error('No se puede eliminar el camión porque tiene tickets asociados a una factura.');
    }

    // Check for any associated tickets (integrity check)
    const anyTickets = await prisma.ticket.findFirst({
      where: { truckId: id }
    });

    if (anyTickets) {
      throw new Error('No se puede eliminar el camión porque tiene tickets registrados.');
    }

    const deleted = await prisma.truck.delete({ where: { id } });
    return deleted;
  } catch (error) {
    console.error('Error deleting truck:', error);
    throw error;
  }
});
