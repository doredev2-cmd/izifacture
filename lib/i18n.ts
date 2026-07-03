export const translations = {
  fr: {
    invoice: {
      title: "FACTURE",
      invoiceNumber: "N° de facture",
      issueDate: "Date d'émission",
      dueDate: "Date d'échéance",
      invoiceTo: "FACTURÉ À",
      paymentInfo: "INFORMATIONS DE PAIEMENT",
      paymentMethod: "Mode de paiement",
      currencyText: "Règlement en",
      table: {
        number: "N°",
        description: "DÉSIGNATION / PRESTATION",
        unitPrice: "PRIX UNIT.",
        quantity: "QTÉ",
        tax: "TVA",
        total: "TOTAL HT",
        discount: "REMISE",
      },
      summary: {
        subtotal: "Sous-total HT",
        discount: "Remise",
        taxRate: "TVA (18 %)",
        totalTTC: "Total TTC",
      },
      footer: {
        authorizedSign: "SIGNATURE AUTORISÉE",
        electronicallySigned: "Document signé électroniquement",
        contact: "Contact :",
        emailUs: "E-mail :",
        website: "Site web :",
        legal: "Merci pour votre confiance. Ce document est une facture originale.",
      },
      generalService: "Prestation générale",
      fallbackAddress: "Adresse non renseignée",
      fallbackEmail: "E-mail non renseigné",
      fallbackPhone: "Téléphone non renseigné",
      fallbackMethod: "Virement bancaire",
    }
  }
};

export function getTranslation(lang: 'fr' = 'fr') {
  return translations[lang];
}
