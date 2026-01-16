-- CreateTable
CREATE TABLE "Truck" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "poNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "truckId" INTEGER NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "tonsOrHours" DECIMAL NOT NULL,
    "rate" DECIMAL NOT NULL,
    "total" DECIMAL NOT NULL,
    "invoiceId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ticket_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceNumber" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "subtotal" DECIMAL NOT NULL,
    "dispatchFeePercent" DECIMAL NOT NULL,
    "dispatchFeeAmount" DECIMAL NOT NULL,
    "total" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceId" INTEGER NOT NULL,
    "ticketId" INTEGER NOT NULL,
    CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InvoiceItem_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "defaultDispatchFee" DECIMAL NOT NULL,
    "nextInvoiceNumber" INTEGER NOT NULL,
    "companyInfo" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Ticket_truckId_idx" ON "Ticket"("truckId");

-- CreateIndex
CREATE INDEX "Ticket_projectId_idx" ON "Ticket"("projectId");

-- CreateIndex
CREATE INDEX "Ticket_invoiceId_idx" ON "Ticket"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceItem_ticketId_idx" ON "InvoiceItem"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceItem_invoiceId_ticketId_key" ON "InvoiceItem"("invoiceId", "ticketId");
