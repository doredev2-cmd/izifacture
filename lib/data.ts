import { getTranslation } from './i18n';

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
  phone?: string;
  website?: string;
  signature?: string;
}

export interface Client {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  companyName?: string;
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
  invoiceId?: string;
  invoiceNumber?: string;
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

export function printInvoice(invoice: Invoice, activeCompany: Company, clients?: Client[]) {
  if (typeof window === 'undefined') return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const t = getTranslation('fr').invoice;
  
  let resolvedClients = clients;
  if (!resolvedClients && typeof window !== 'undefined') {
    const saved = localStorage.getItem('izi-facture-clients');
    if (saved) {
      try {
        resolvedClients = JSON.parse(saved);
      } catch (e) {}
    }
  }
  
  const client = resolvedClients ? resolvedClients.find(c => c.id === invoice.clientId) : undefined;
  
  const clientName = client?.companyName || invoice.clientName || 'NOM PRENOM';
  const clientEmail = client?.email || invoice.clientEmail || t.fallbackEmail;
  const clientPhone = client?.phone || t.fallbackPhone;
  const clientAddress = client?.address || t.fallbackAddress;

  const itemsHtml = (invoice.items && invoice.items.length > 0) 
    ? invoice.items.map((item: any, index: number) => `
    <tr style="page-break-inside: avoid; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
      <td style="padding: 12px 16px; font-size: 12px; color: #64748b; text-align: center;">${index + 1}</td>
      <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600;">${item.description || t.generalService}</td>
      <td style="padding: 12px 16px; font-size: 13px; color: #475569; text-align: right;">${formatFCFA(item.unitPrice, activeCompany.currency)}</td>
      <td style="padding: 12px 16px; font-size: 13px; color: #475569; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 16px; font-size: 13px; color: #475569; text-align: right;">${item.taxPercent || 0}%</td>
      <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; text-align: right; font-weight: 700;">${formatFCFA(item.quantity * item.unitPrice, activeCompany.currency)}</td>
    </tr>
  `).join('') 
  : `
    <tr style="page-break-inside: avoid; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
      <td style="padding: 12px 16px; font-size: 12px; color: #64748b; text-align: center;">1</td>
      <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; font-weight: 600;">${t.generalService}</td>
      <td style="padding: 12px 16px; font-size: 13px; color: #475569; text-align: right;">${formatFCFA(invoice.subtotal || invoice.amount, activeCompany.currency)}</td>
      <td style="padding: 12px 16px; font-size: 13px; color: #475569; text-align: center;">1</td>
      <td style="padding: 12px 16px; font-size: 13px; color: #475569; text-align: right;">0%</td>
      <td style="padding: 12px 16px; font-size: 14px; color: #0f172a; text-align: right; font-weight: 700;">${formatFCFA(invoice.subtotal || invoice.amount, activeCompany.currency)}</td>
    </tr>
  `;

  const subtotal = invoice.subtotal || (invoice.amount - (invoice.taxAmount || 0));
  
  const logoHtml = activeCompany.logo && activeCompany.logo.startsWith('data:image') 
    ? `<img src="${activeCompany.logo}" style="max-height: 80px; max-width: 200px; object-fit: contain;" />` 
    : `<div style="width: 56px; height: 56px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #0f172a; font-weight: 800; font-size: 24px;">
         ${activeCompany.name.charAt(0)}
       </div>`;

  const signatureHtml = activeCompany.signature
    ? `<img src="${activeCompany.signature}" style="max-height: 60px; object-fit: contain; margin-top: 8px;" />`
    : `<div style="height: 60px; margin-top: 8px;"></div>`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <title>${t.title} ${invoice.invoiceNumber} - ${activeCompany.name}</title>
      <meta charset="utf-8" />
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Mrs+Saint+Delafield&display=swap');
        
        * { box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          margin: 0;
          padding: 0;
          background: #f8fafc;
          color: #0f172a;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .invoice-container {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background-color: white;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        
        .header-band {
          height: 12px;
          background: linear-gradient(90deg, #2563eb, #3b82f6);
          width: 100%;
        }

        .content {
          padding: 48px;
          flex: 1;
        }

        .top-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 48px;
        }

        .company-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 50%;
        }
        
        .company-name {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .company-details {
          font-size: 12px;
          color: #475569;
          line-height: 1.6;
        }

        .invoice-title-wrapper {
          text-align: right;
        }

        .invoice-title {
          font-size: 36px;
          font-weight: 900;
          color: #2563eb;
          letter-spacing: 0.05em;
          margin: 0 0 8px 0;
          text-transform: uppercase;
        }

        .invoice-number {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 24px 0;
        }

        .dates-grid {
          display: grid;
          grid-template-columns: auto auto;
          gap: 8px 16px;
          text-align: right;
          font-size: 13px;
        }

        .dates-label { color: #64748b; font-weight: 500; }
        .dates-val { color: #0f172a; font-weight: 700; }

        .billing-section {
          display: flex;
          gap: 32px;
          margin-bottom: 48px;
        }

        .billing-box {
          flex: 1;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
        }

        .billing-title {
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 12px 0;
        }

        .client-name {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .client-details {
          font-size: 13px;
          color: #475569;
          line-height: 1.6;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }

        th {
          background-color: #f8fafc;
          border-y: 1px solid #e2e8f0;
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .summary-wrapper {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 64px;
        }

        .summary-box {
          width: 320px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          background: #ffffff;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding-bottom: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 13px;
          color: #475569;
        }

        .summary-row:last-of-type {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          padding-top: 16px;
          margin-top: 16px;
          border-top: 2px solid #e2e8f0;
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        .footer {
          margin-top: auto;
          border-top: 1px solid #e2e8f0;
          padding: 32px 48px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          background: #fafafa;
        }

        .footer-info {
          font-size: 11px;
          color: #64748b;
          line-height: 1.6;
        }

        .signature-block {
          text-align: right;
        }

        .signature-title {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .signature-font {
          font-family: 'Mrs Saint Delafield', cursive;
          font-size: 32px;
          color: #0f172a;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header-band"></div>
        
        <div class="content">
          <div class="top-section">
            <div class="company-info">
              <div style="margin-bottom: 16px;">${logoHtml}</div>
              <h2 class="company-name">${activeCompany.name}</h2>
              <div class="company-details">
                ${activeCompany.address}<br/>
                ${activeCompany.phone ? activeCompany.phone + '<br/>' : ''}
                ${activeCompany.email}<br/>
                ${activeCompany.website ? activeCompany.website + '<br/>' : ''}
              </div>
              ${(activeCompany.rccm || activeCompany.nif) ? `
                <div class="company-details" style="margin-top: 8px; color: #64748b; font-size: 11px;">
                  ${activeCompany.rccm ? 'RCCM: ' + activeCompany.rccm : ''} 
                  ${activeCompany.rccm && activeCompany.nif ? ' • ' : ''} 
                  ${activeCompany.nif ? 'NIF: ' + activeCompany.nif : ''}
                </div>
              ` : ''}
            </div>

            <div class="invoice-title-wrapper">
              <h1 class="invoice-title">${t.title}</h1>
              <p class="invoice-number">${invoice.invoiceNumber || '#INV-1234'}</p>
              
              <div class="dates-grid">
                <div class="dates-label">${t.issueDate} :</div>
                <div class="dates-val">${invoice.issueDate || 'N/A'}</div>
                <div class="dates-label">${t.dueDate} :</div>
                <div class="dates-val" style="color: #e11d48;">${invoice.dueDate || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="billing-section">
            <div class="billing-box">
              <h3 class="billing-title">${t.invoiceTo}</h3>
              <div class="client-name">${clientName}</div>
              <div class="client-details">
                ${clientAddress !== t.fallbackAddress ? clientAddress + '<br/>' : ''}
                ${clientPhone !== t.fallbackPhone ? clientPhone + '<br/>' : ''}
                ${clientEmail}
              </div>
            </div>
            
            <div class="billing-box" style="background-color: #f0fdf4; border-color: #bbf7d0;">
              <h3 class="billing-title" style="color: #166534;">${t.paymentInfo}</h3>
              <div class="client-name" style="color: #14532d;">${invoice.paymentMethod || t.fallbackMethod}</div>
              <div class="client-details" style="color: #166534;">
                ${t.currencyText} <strong>${activeCompany.currency}</strong>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: center; width: 5%; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">${t.table.number}</th>
                <th style="text-align: left; width: 40%; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">${t.table.description}</th>
                <th style="text-align: right; width: 15%; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">${t.table.unitPrice}</th>
                <th style="text-align: center; width: 10%; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">${t.table.quantity}</th>
                <th style="text-align: right; width: 10%; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">${t.table.tax}</th>
                <th style="text-align: right; width: 20%; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">${t.table.total}</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary-wrapper">
            <div class="summary-box">
              <div class="summary-row">
                <span style="font-weight: 500;">${t.summary.subtotal}</span>
                <span style="font-weight: 700; color: #0f172a;">${formatFCFA(subtotal, activeCompany.currency)}</span>
              </div>
              
              ${invoice.discountAmount && invoice.discountAmount > 0 ? `
              <div class="summary-row" style="color: #059669;">
                <span style="font-weight: 500;">${t.summary.discount}</span>
                <span style="font-weight: 700;">-${formatFCFA(invoice.discountAmount, activeCompany.currency)}</span>
              </div>
              ` : ''}

              <div class="summary-row">
                <span style="font-weight: 500;">${t.summary.taxRate}</span>
                <span style="font-weight: 700; color: #0f172a;">${formatFCFA(invoice.taxAmount || 0, activeCompany.currency)}</span>
              </div>

              <div class="summary-total">
                <span>${t.summary.totalTTC}</span>
                <span style="color: #2563eb;">${formatFCFA(invoice.amount, activeCompany.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="footer-info">
            <strong>${activeCompany.name}</strong><br/>
            ${activeCompany.email} ${activeCompany.phone ? ' • ' + activeCompany.phone : ''}<br/>
            ${t.footer.legal}
          </div>
          <div class="signature-block">
            <div class="signature-title">${t.footer.authorizedSign}</div>
            ${signatureHtml}
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
               ${activeCompany.signature ? '' : t.footer.electronicallySigned}
            </div>
          </div>
        </div>
      </div>

      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <script>
        window.onload = function() {
          const element = document.querySelector('.invoice-container');
          const opt = {
            margin:       0,
            filename:     'Facture_' + '${invoice.invoiceNumber}'.replace('#', '') + '.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
          };
          
          html2pdf().set(opt).from(element).save().then(() => {
            setTimeout(function() { window.close(); }, 1000);
          });
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
