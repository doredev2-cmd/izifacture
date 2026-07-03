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
    <div style="display: flex; justify-content: space-between; color: #059669;">
      <span>Remise</span>
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
        script { display: none; }
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
        <div style="padding: 40px 48px; flex: 1; display: flex; flex-direction: column;">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px;">
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${logoHtml ? logoHtml : `
                <div style="width: 48px; height: 48px; margin-bottom: 16px; background-color: #1e2a47; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #facc15; font-weight: 900; font-size: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  ${activeCompany.name.charAt(0)}
                </div>
              `}
              <h2 style="font-size: 20px; font-weight: 900; color: #0f172a; margin: 0;">${activeCompany.name || 'VOTRE LOGO'}</h2>
              <p style="font-size: 14px; color: #475569; font-weight: 500; margin: 0;">${activeCompany.address || 'Adresse de l\'entreprise'}</p>
              <p style="font-size: 11px; color: #64748b; font-weight: 500; margin: 0;">RCCM : ${activeCompany.rccm || '-'} • NIF : ${activeCompany.nif || '-'}</p>
            </div>

            <div style="display: flex; flex-direction: column; align-items: flex-end; text-align: right;">
              <h1 style="font-size: 36px; font-weight: 900; color: #2563eb; letter-spacing: 0.05em; margin: 0 0 8px 0; text-transform: uppercase;">FACTURE</h1>
              <p style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 24px 0;">${invoice.invoiceNumber || '#INV-1234'}</p>
              <div style="display: flex; flex-direction: column; gap: 4px; font-size: 14px; font-weight: 500; color: #475569;">
                <div style="display: flex; justify-content: flex-end; gap: 8px;">
                  <span>Date d'émission :</span>
                  <span style="font-weight: 700; color: #0f172a;">${invoice.issueDate ? invoice.issueDate : '10/10/2024'}</span>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 8px;">
                  <span>Date d'échéance :</span>
                  <span style="font-weight: 700; color: #e11d48;">${invoice.dueDate || '25/10/2024'}</span>
                </div>
              </div>
            </div>
          </div>

          <div style="width: 100%; border: 1px solid #dbeafe; background-color: rgba(239, 246, 255, 0.5); border-radius: 16px; padding: 24px; margin-bottom: 40px; display: flex; gap: 32px; box-sizing: border-box;">
            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
              <h3 style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">FACTURÉ À</h3>
              <div style="font-weight: 900; font-size: 16px; color: #0f172a; margin: 0;">${invoice.clientName || 'NOM PRENOM'}</div>
              <div style="font-size: 14px; color: #475569; font-weight: 500; margin: 0;">${invoice.clientEmail || 'Adresse email du client'}</div>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px; border-left: 1px solid rgba(219, 234, 254, 0.5); padding-left: 32px;">
              <h3 style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">MODE DE PAIEMENT</h3>
              <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin: 0;">${invoice.paymentMethod || 'Virement bancaire'}</div>
              <div style="font-size: 14px; color: #475569; font-weight: 500; margin: 0;">Règlement en ${activeCompany.currency}</div>
            </div>
          </div>

          <div style="width: 100%; margin-bottom: 40px; flex: 1;">
            <div style="display: flex; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 12px; border-bottom: 2px solid #1e2a47;">
              <div style="width: 60%;">DÉSIGNATION / PRESTATION</div>
              <div style="width: 15%; text-align: center;">QUANTITÉ</div>
              <div style="width: 25%; text-align: right;">TOTAL HT</div>
            </div>
            
            <div style="display: flex; flex-direction: column; border-bottom: 1px solid #e2e8f0; margin-bottom: 24px;">
              ${invoice.items && invoice.items.length > 0 ? invoice.items.map(item => `
                <div style="display: flex; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start;">
                  <div style="width: 60%; display: flex; flex-direction: column; gap: 6px; padding-right: 16px; box-sizing: border-box;">
                    <span style="font-weight: 700; font-size: 14px; color: #0f172a; line-height: 1.4;">${item.description || 'Description de la prestation'}</span>
                    <span style="font-size: 12px; color: #64748b; font-weight: 500;">P.U. : ${formatFCFA(item.unitPrice, activeCompany.currency)}</span>
                  </div>
                  <div style="width: 15%; text-align: center; font-weight: 700; font-size: 14px; color: #0f172a; padding-top: 4px;">${item.quantity}</div>
                  <div style="width: 25%; text-align: right; font-weight: 700; font-size: 14px; color: #0f172a; padding-top: 4px;">${formatFCFA(item.quantity * item.unitPrice, activeCompany.currency)}</div>
                </div>
              `).join('') : `
                <div style="display: flex; padding: 20px 0; border-bottom: 1px solid #f1f5f9; align-items: flex-start;">
                  <div style="width: 60%; display: flex; flex-direction: column; gap: 6px; padding-right: 16px; box-sizing: border-box;">
                    <span style="font-weight: 700; font-size: 14px; color: #0f172a; line-height: 1.4;">Prestation générale</span>
                    <span style="font-size: 12px; color: #64748b; font-weight: 500;">P.U. : ${formatFCFA(invoice.subtotal || invoice.amount, activeCompany.currency)}</span>
                  </div>
                  <div style="width: 15%; text-align: center; font-weight: 700; font-size: 14px; color: #0f172a; padding-top: 4px;">1</div>
                  <div style="width: 25%; text-align: right; font-weight: 700; font-size: 14px; color: #0f172a; padding-top: 4px;">${formatFCFA(invoice.subtotal || invoice.amount, activeCompany.currency)}</div>
                </div>
              `}
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-bottom: 64px;">
            <div style="width: 45%; border: 1px solid #dbeafe; background-color: rgba(239, 246, 255, 0.4); border-radius: 16px; padding: 20px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); display: flex; flex-direction: column; gap: 14px; box-sizing: border-box;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 500; color: #475569;">
                <span>Sous-Total HT :</span>
                <span style="font-weight: 700; color: #0f172a;">${formatFCFA(subtotal, activeCompany.currency)}</span>
              </div>
              ${invoice.discountAmount && invoice.discountAmount > 0 ? `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 500; color: #059669;">
                  <span>Remise :</span>
                  <span style="font-weight: 700;">-${formatFCFA(invoice.discountAmount, activeCompany.currency)}</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 500; color: #475569; padding-bottom: 12px; border-bottom: 1px solid #dbeafe;">
                <span>TVA (18%) :</span>
                <span style="font-weight: 700; color: #0f172a;">${formatFCFA(invoice.taxAmount || 0, activeCompany.currency)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 900; color: #1e2a47;">
                <span>Total TTC :</span>
                <span>${formatFCFA(invoice.amount, activeCompany.currency)}</span>
              </div>
            </div>
          </div>

          <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 24px;">
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <span style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.025em;">${activeCompany.name}</span>
              <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: #059669;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Document signé électroniquement
              </div>
            </div>
            
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 16px;">
              <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">SIGNATURE DE L'ÉMETTEUR</span>
              <span class="signature-font" style="font-size: 32px; color: #1e2a47; opacity: 0.9;">${activeCompany.name}</span>
            </div>
          </div>
        </div>
      </div>

      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <script>
        window.onload = function() {
          const element = document.querySelector('.invoice-card');
          const opt = {
            margin:       0,
            filename:     'Facture_${invoice.invoiceNumber}.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
