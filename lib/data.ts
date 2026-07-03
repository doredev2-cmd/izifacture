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

export function printInvoice(invoice: Invoice, activeCompany: Company) {
  if (typeof window === 'undefined') return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const itemsHtml = (invoice.items || []).map((item: any, index: number) => `
    <div style="display: flex; font-size: 12px; padding: 16px; border-bottom: 1px solid #e2e8f0; color: #1e2a47; font-weight: 600; align-items: center;">
      <div style="width: 10%; text-align: center; color: #64748b;">${index + 1}</div>
      <div style="width: 45%; font-weight: 700;">${item.description || 'Description de la prestation'}</div>
      <div style="width: 15%; text-align: center; color: #475569;">${formatFCFA(item.unitPrice, activeCompany.currency)}</div>
      <div style="width: 10%; text-align: center; color: #475569;">${item.quantity}</div>
      <div style="width: 20%; text-align: right;">${formatFCFA(item.quantity * item.unitPrice, activeCompany.currency)}</div>
    </div>
  `).join('');

  const subtotal = invoice.subtotal || (invoice.amount - (invoice.taxAmount || 0));
  const discountHtml = (invoice.discountAmount && invoice.discountAmount > 0) ? `
    <div style="display: flex; justify-content: space-between; color: #059669;">
      <span>Discount</span>
      <span>-${formatFCFA(invoice.discountAmount, activeCompany.currency)}</span>
    </div>
  ` : '';

  const logoHtml = activeCompany.logo && activeCompany.logo.startsWith('data:image') 
    ? `<img src="${activeCompany.logo}" style="max-height: 64px; object-fit: contain; margin-bottom: 12px;" />` 
    : `<div style="display: flex; gap: 6px; margin-bottom: 20px; margin-right: 12px;">
         <div style="width: 24px; height: 24px; background-color: #1e2a47; transform: rotate(45deg);"></div>
         <div style="width: 24px; height: 24px; background-color: #eab308; transform: rotate(45deg);"></div>
         <div style="width: 24px; height: 24px; background-color: #1e2a47; transform: rotate(45deg);"></div>
       </div>`;

  let dotsHtml = '';
  for(let i = 0; i < 42; i++) {
    dotsHtml += `<div style="width: 4px; height: 4px; border-radius: 50%; background-color: #eab308;"></div>`;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <title>Facture ${invoice.invoiceNumber} - ${activeCompany.name}</title>
      <meta charset="utf-8" />
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Mrs+Saint+Delafield&display=swap');
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          margin: 0;
          padding: 0;
          background: #ffffff;
          line-height: 1.5;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color: #1e2a47;
        }
        @page {
          size: A4;
          margin: 0;
        }
        .invoice-card {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background-color: white;
        }
        .decorative-top {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 128px;
          overflow: hidden;
          pointer-events: none;
        }
        .dots-grid {
          position: absolute;
          top: 40px;
          left: 40px;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          opacity: 0.5;
          width: 64px;
        }
        .geo-shape {
          position: absolute;
          top: 0;
          left: 45%;
          transform: translateX(-50%);
          width: 192px;
          height: 128px;
          color: #eab308;
        }
        .content-area {
          padding: 64px 40px 0 40px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          z-index: 10;
        }
        .header-left {
          width: 50%;
          padding-top: 64px;
        }
        .header-right {
          width: 50%;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          padding-top: 16px;
        }
        .main-title {
          font-size: 48px;
          font-weight: 900;
          color: #1e2a47;
          letter-spacing: 0.05em;
          margin: 0 0 32px 0;
        }
        .signature-font {
          font-family: 'Mrs Saint Delafield', cursive;
        }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <div class="decorative-top">
          <div class="dots-grid">
            ${dotsHtml}
          </div>
          <svg class="geo-shape" viewBox="0 0 100 60" fill="none" stroke="currentColor" stroke-width="1.5">
             <path d="M10,0 L50,40 L90,0" />
             <path d="M25,0 L50,25 L75,0" />
             <path d="M40,0 L50,10 L60,0" />
          </svg>
        </div>

        <div class="content-area">
          <div class="header">
            <div class="header-left">
              <h1 class="main-title">INVOICE</h1>
              <div style="font-size: 14px; font-weight: 700; color: #1e2a47; margin-bottom: 4px;">Invoice to:</div>
              <div style="font-weight: 900; font-size: 16px; color: #1e2a47; text-transform: uppercase;">${invoice.clientName || 'NAME SURNAME'}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px; max-width: 200px; line-height: 1.6;">
                ${invoice.clientEmail || 'Adresse du client non renseignée'}
              </div>
            </div>
            
            <div class="header-right">
              ${logoHtml}
              <div style="font-size: 20px; font-weight: 900; color: #1e2a47; letter-spacing: 0.1em; text-transform: uppercase; text-align: right;">
                ${activeCompany.name || 'YOUR LOGO'}
              </div>
              <div style="font-size: 9px; font-weight: 600; color: #64748b; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 4px;">
                SLOGAN / RCCM: ${activeCompany.rccm || '-'}
              </div>

              <div style="margin-top: 56px; display: flex; flex-direction: column; gap: 6px; width: 224px; font-size: 14px;">
                <div style="display: flex; justify-content: space-between; font-weight: 700; color: #1e2a47;">
                  <span>Invoice #</span>
                  <span>${invoice.invoiceNumber || '#1234'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: 700; color: #1e2a47;">
                  <span>Date</span>
                  <span>${invoice.issueDate ? invoice.issueDate : '10/10/2024'}</span>
                </div>
              </div>
            </div>
          </div>

          <div style="width: 100%; margin-bottom: 32px;">
            <div style="display: flex; background-color: #1e2a47; color: white; font-size: 11px; font-weight: 700; padding: 10px 16px; text-transform: uppercase; letter-spacing: 0.05em;">
              <div style="width: 10%; text-align: center;">No.</div>
              <div style="width: 45%;">Service Description</div>
              <div style="width: 15%; text-align: center;">Price</div>
              <div style="width: 10%; text-align: center;">Qty.</div>
              <div style="width: 20%; text-align: right;">Total</div>
            </div>
            
            <div style="border-bottom: 2px solid #1e2a47; margin-bottom: 24px;">
              ${invoice.items && invoice.items.length > 0 ? itemsHtml : `
                <div style="display: flex; font-size: 12px; padding: 16px; border-bottom: 1px solid #e2e8f0; color: #1e2a47; font-weight: 600; align-items: center;">
                  <div style="width: 10%; text-align: center; color: #64748b;">1</div>
                  <div style="width: 45%; font-weight: 700;">Prestation générale</div>
                  <div style="width: 15%; text-align: center; color: #475569;">-</div>
                  <div style="width: 10%; text-align: center; color: #475569;">1</div>
                  <div style="width: 20%; text-align: right;">${formatFCFA(invoice.subtotal || invoice.amount, activeCompany.currency)}</div>
                </div>
              `}
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: auto; margin-bottom: 16px;">
            <div style="width: 50%; font-size: 10px; color: #1e2a47;">
              <div style="margin-bottom: 20px;">
                <div style="font-weight: 700; margin-bottom: 4px; font-size: 12px;">Terms and Conditions</div>
                <div style="color: #64748b; line-height: 1.6; padding-right: 24px;">
                  Les règlements s'effectuent en ${activeCompany.currency}. Tout retard de paiement entraîne des pénalités selon la réglementation en vigueur. Merci de votre confiance.
                </div>
              </div>
              <div style="margin-bottom: 20px;">
                <div style="font-weight: 700; margin-bottom: 4px; font-size: 12px;">Questions:</div>
                <div style="display: flex; flex-direction: column; gap: 4px; color: #64748b; font-weight: 500;">
                  <div style="display: flex;"><span style="width: 64px;">Email us:</span> <span>${activeCompany.email || 'contact@votreentreprise.com'}</span></div>
                </div>
              </div>
              <div>
                <div style="font-weight: 700; margin-bottom: 4px; font-size: 12px;">Payment Info:</div>
                <div style="display: flex; flex-direction: column; gap: 4px; color: #64748b; font-weight: 500;">
                  <div style="display: flex;"><span style="width: 80px;">Method:</span> <span>${invoice.paymentMethod || 'Virement bancaire'}</span></div>
                  <div style="display: flex;"><span style="width: 80px;">Currency:</span> <span>${activeCompany.currency}</span></div>
                </div>
              </div>
            </div>

            <div style="width: 45%; display: flex; flex-direction: column; align-items: flex-end;">
              <div style="width: 100%; font-size: 14px; font-weight: 700; color: #1e2a47; display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; padding: 0 16px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #475569;">Subtotal</span>
                  <span>${formatFCFA(subtotal, activeCompany.currency)}</span>
                </div>
                ${discountHtml}
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #475569;">Tax Rate (18%)</span>
                  <span>${formatFCFA(invoice.taxAmount || 0, activeCompany.currency)}</span>
                </div>
              </div>
              <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; background-color: #1e2a47; color: white; font-size: 14px; font-weight: 700; padding: 12px 16px; margin-bottom: 40px; box-sizing: border-box;">
                <span>TOTAL</span>
                <span>${formatFCFA(invoice.amount, activeCompany.currency)}</span>
              </div>

              <div style="width: 192px; text-align: center; margin-top: auto; padding-bottom: 16px;">
                <div style="height: 80px; display: flex; align-items: flex-end; justify-content: center;">
                  <div class="signature-font" style="font-size: 32px; color: #1e2a47; opacity: 0.8; transform: rotate(-3deg);">
                    ${activeCompany.name}
                  </div>
                </div>
                <div style="border-top: 1px solid #1e2a47; padding-top: 6px; font-size: 10px; color: #1e2a47; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                  Authorised Sign
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="background-color: #1e2a47; height: 56px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 40px; font-size: 10px; color: white; font-weight: 500;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #eab308; display: flex; align-items: center; justify-content: center; color: #1e2a47; font-weight: 700; font-size: 12px;">f</div>
            <span>@${activeCompany.name.replace(/\\s+/g, '').toLowerCase() || 'username'}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #eab308; display: flex; align-items: center; justify-content: center; color: #1e2a47; font-weight: 700; font-size: 12px;">
              <svg style="width: 12px; height: 12px;" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </div>
            <span>@${activeCompany.name.replace(/\\s+/g, '').toLowerCase() || 'username'}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #eab308; display: flex; align-items: center; justify-content: center; color: #1e2a47; font-weight: 700; font-size: 12px;">ig</div>
            <span>@${activeCompany.name.replace(/\\s+/g, '').toLowerCase() || 'username'}</span>
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
