export interface Company {
  id: string;
  userId?: string;
  name: string;
  email: string;
  logo: string;
  currency: string;
  address: string;
  rccm?: string;
  nif?: string;
}

export interface Client {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number; // e.g. 18
}

export interface Invoice {
  id: string;
  userId?: string;
  companyId?: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  amount: number; // total TTC
  status: 'paid' | 'sent' | 'draft' | 'overdue' | 'cancelled';
  paymentMethod?: string;
}

export interface RevenueData {
  month: string;
  invoiced: number;
  paid: number;
}

export interface Transaction {
  id: string;
  userId?: string;
  date: string;
  description: string;
  type: 'credit' | 'debit';
  method: 'Orange Money' | 'MTN Money' | 'Virement' | 'Espèces';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

export interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  color: string;
}

export const mockCompanies: Company[] = [
  {
    id: 'co-1',
    name: 'Chargement...',
    email: '',
    logo: '⏳',
    currency: 'FCFA',
    address: ''
  }
];

export const mockClients: Client[] = [];

export const mockInvoices: Invoice[] = [];

export const mockTransactions: Transaction[] = [];

export const mockBudgets: Budget[] = [
  { id: 'bd-1', category: 'Développement & Tech', allocated: 25000000, spent: 18200000, color: 'bg-blue-500' },
  { id: 'bd-2', category: 'Marketing & Pub', allocated: 10000000, spent: 4500000, color: 'bg-emerald-500' },
  { id: 'bd-3', category: 'Opérations & Salaires', allocated: 30000000, spent: 28500000, color: 'bg-amber-500' },
  { id: 'bd-4', category: 'Frais Généraux / Locaux', allocated: 8000000, spent: 5400000, color: 'bg-rose-500' }
];

export const mockRevenueData: RevenueData[] = [
  { month: 'Jan', invoiced: 24000000, paid: 18000000 },
  { month: 'Feb', invoiced: 32000000, paid: 29000000 },
  { month: 'Mar', invoiced: 41000000, paid: 35000000 },
  { month: 'Apr', invoiced: 38000000, paid: 34000000 },
  { month: 'May', invoiced: 52000000, paid: 42000000 },
  { month: 'Jun', invoiced: 71500000, paid: 55500000 }
];

export function formatFCFA(amount: number, currency: string = 'GNF'): string {
  // Rounded to integer as requested
  const rounded = Math.round(amount);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ' + currency;
}

export function printInvoice(invoice: Invoice, activeCompany: Company) {
  if (typeof window === 'undefined') return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const itemsHtml = (invoice.items || []).map((item: any) => `
    <tr>
      <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; text-align: left;">
        <strong style="color: #1e293b; font-size: 13px;">${item.description}</strong><br/>
        <span style="font-size: 11px; color: #64748b;">P.U. : ${formatFCFA(item.unitPrice, activeCompany.currency)}</span>
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #334155; font-weight: 600;">${item.quantity}</td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #0f172a;">
        ${formatFCFA(item.quantity * item.unitPrice, activeCompany.currency)}
      </td>
    </tr>
  `).join('');

  const subtotal = invoice.subtotal || (invoice.amount - (invoice.taxAmount || 0));
  const discountHtml = (invoice.discountAmount && invoice.discountAmount > 0) ? `
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #10b981; font-weight: 700;">
      <span>Remise :</span>
      <span>-${formatFCFA(invoice.discountAmount, activeCompany.currency)}</span>
    </div>
  ` : '';

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <title>Facture ${invoice.invoiceNumber} - ${activeCompany.name}</title>
      <meta charset="utf-8" />
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 40px;
          background: #ffffff;
          line-height: 1.5;
        }
        .invoice-card {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 25px;
        }
        .company-logo {
          font-size: 36px;
          margin-bottom: 8px;
        }
        .company-name {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }
        .company-details, .client-details {
          font-size: 11px;
          color: #64748b;
          line-height: 1.6;
          margin-top: 4px;
        }
        .invoice-title-container {
          text-align: right;
        }
        .invoice-title {
          font-size: 26px;
          font-weight: 900;
          color: #2563eb;
          margin: 0;
          letter-spacing: -0.025em;
        }
        .invoice-number {
          font-family: monospace;
          font-size: 14px;
          font-weight: 700;
          color: #475569;
          margin-top: 5px;
        }
        .dates {
          font-size: 11px;
          margin-top: 15px;
          color: #475569;
        }
        .billing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 35px;
          font-size: 12px;
        }
        .section-title {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .billing-name {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 35px;
          font-size: 12px;
        }
        th {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          border-bottom: 2px solid #cbd5e1;
          padding: 10px;
          text-align: left;
          font-weight: 700;
        }
        .totals-container {
          display: flex;
          justify-content: flex-end;
          font-size: 12px;
        }
        .totals-box {
          width: 280px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          padding: 16px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: #475569;
        }
        .grand-total {
          font-size: 14px;
          font-weight: 900;
          color: #0f172a;
          border-top: 1px solid #e2e8f0;
          padding-top: 10px;
          margin-top: 10px;
        }
        .footer {
          margin-top: 60px;
          border-top: 1px solid #f1f5f9;
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 10px;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <div class="header">
          <div>
            <div class="company-logo" style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: flex-start; margin-bottom: 8px; overflow: hidden;">
              ${activeCompany.logo && activeCompany.logo.startsWith('data:image') 
                ? `<img src="${activeCompany.logo}" style="max-height: 100%; max-width: 100%; object-fit: contain;" />` 
                : `<span style="font-size: 36px;">${activeCompany.logo || '🏢'}</span>`}
            </div>
            <div class="company-name">${activeCompany.name}</div>
            <div class="company-details">
              ${activeCompany.address}<br/>
              ${activeCompany.rccm ? 'RCCM : ' + activeCompany.rccm : ''} 
              ${activeCompany.nif ? '• NIF : ' + activeCompany.nif : ''}
            </div>
          </div>
          <div class="invoice-title-container">
            <h1 class="invoice-title">FACTURE</h1>
            <div class="invoice-number">${invoice.invoiceNumber}</div>
            <div class="dates">
              Date d'émission : <strong>${invoice.issueDate}</strong><br/>
              Date d'échéance : <strong style="color: #ef4444;">${invoice.dueDate}</strong>
            </div>
          </div>
        </div>

        <div class="billing-grid">
          <div>
            <div class="section-title">Facturé à</div>
            <div class="billing-name">${invoice.clientName}</div>
            <div style="color: #475569; margin-top: 2px;">${invoice.clientEmail}</div>
          </div>
          <div>
            <div class="section-title">Mode de Paiement</div>
            <div style="font-weight: 600; color: #334155;">${invoice.paymentMethod || 'Virement bancaire / Mobile Money'}</div>
            <div style="color: #64748b; font-size: 10px; margin-top: 4px;">Règlement en ${activeCompany.currency}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 55%;">Désignation / Prestation</th>
              <th style="width: 15%; text-align: center;">Quantité</th>
              <th style="width: 30%; text-align: right;">Total HT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals-container">
          <div class="totals-box">
            <div class="total-row">
              <span>Sous-Total HT :</span>
              <span>${formatFCFA(subtotal, activeCompany.currency)}</span>
            </div>
            ${discountHtml}
            <div class="total-row">
              <span>TVA (18%) :</span>
              <span>${formatFCFA(invoice.taxAmount || 0, activeCompany.currency)}</span>
            </div>
            <div class="total-row grand-total">
              <strong>Total TTC :</strong>
              <strong>${formatFCFA(invoice.amount, activeCompany.currency)}</strong>
            </div>
          </div>
        </div>

        <div class="footer">
          <div>
            <strong>${activeCompany.name.toUpperCase()}</strong><br/>
            <span style="color: #10b981; font-weight: 600;">✓ Document signé électroniquement</span>
          </div>
          <div style="text-align: right;">
            <div class="section-title">Signature de l'Émetteur</div>
            <div style="font-style: italic; font-weight: 700; margin-top: 5px; color: #334155;">${activeCompany.name}</div>
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
