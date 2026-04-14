import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Referee, Category, Designation } from '../types';

export const generateRefereeReport = (
  designations: Designation[],
  referees: Referee[],
  categories: Category[]
) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  
  // Helper to add logos (using placeholders, user can replace with real URLs)
  const logoUrl = 'https://upload.wikimedia.org/wikipedia/fr/thumb/0/06/Logo_F%C3%A9d%C3%A9ration_Djiboutienne_de_Football.svg/200px-Logo_F%C3%A9d%C3%A9ration_Djiboutienne_de_Football.svg.png';
  
  try {
    // Left Logo
    doc.addImage(logoUrl, 'PNG', 15, 10, 25, 25);
    // Right Logo
    doc.addImage(logoUrl, 'PNG', pageWidth - 40, 10, 25, 25);
  } catch (e) {
    // Fallback if image fails to load
    doc.setFontSize(8);
    doc.text('LOGO FDF', 20, 20);
    doc.text('LOGO FDF', pageWidth - 35, 20);
  }

  // Header Info - Centered
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FEDERATION DJIBOUTIENNE DE FOOTBALL', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Tel : (00253) 35 35 99 - Fax : (00253) 35 35 88 - B.P : 2694', pageWidth / 2, 20, { align: 'center' });
  doc.text('fdf@yahoo.fr', pageWidth / 2, 24, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('COMMISSION CENTRALE DES ARBITRES', pageWidth / 2, 35, { align: 'center' });
  
  // Month Banner
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: fr }).toUpperCase();
  doc.setFontSize(10);
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 4, 38, (pageWidth / 4) * 3, 38);
  doc.text(`FRAIS DU MOIS DE ${currentMonth} COMPLET`, pageWidth / 2, 43, { align: 'center' });
  doc.line(pageWidth / 4, 45, (pageWidth / 4) * 3, 45);

  // Table Data
  const dynamicCategories = categories.sort((a, b) => a.name.localeCompare(b.name));
  const head = [
    ['N°', 'NOM', ...dynamicCategories.map(c => c.name), 'NET A PAYES', 'PHONE']
  ];

  const refereeEarnings = referees.map((ref, index) => {
    const earningsPerCategory = dynamicCategories.map(cat => {
      const relevantDesignations = designations.filter(d => d.categoryId === cat.id);
      let total = 0;
      relevantDesignations.forEach(d => {
        if (d.centralId === ref.id) total += cat.centralFee;
        if (d.assistant1Id === ref.id || d.assistant2Id === ref.id) total += cat.assistantFee;
        if (d.fourthId === ref.id) total += cat.fourthFee;
      });
      return total;
    });

    const netToPay = earningsPerCategory.reduce((acc, val) => acc + val, 0);

    return [
      index + 1,
      ref.name.toUpperCase(),
      ...earningsPerCategory.map(e => e > 0 ? e.toLocaleString() : ''),
      netToPay.toLocaleString(),
      ref.phone || ''
    ];
  });

  const actualColumnTotals = dynamicCategories.map((cat) => {
    return refereeEarnings.reduce((acc, row) => {
      const colIndex = dynamicCategories.indexOf(cat) + 2;
      const val = String(row[colIndex]).replace(/,/g, '');
      return acc + (Number(val) || 0);
    }, 0);
  });

  const grandTotal = refereeEarnings.reduce((acc, row) => {
    const val = String(row[row.length - 2]).replace(/,/g, '');
    return acc + (Number(val) || 0);
  }, 0);

  const footerRow = [
    '',
    'TOTAL',
    ...actualColumnTotals.map(t => t.toLocaleString()),
    grandTotal.toLocaleString(),
    ''
  ];

  autoTable(doc, {
    startY: 50,
    head: head,
    body: [...refereeEarnings, footerRow],
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      textColor: [0, 0, 0],
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [220, 220, 220],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 60, fontStyle: 'bold' },
      [dynamicCategories.length + 2]: { fontStyle: 'bold', halign: 'right', fillColor: [240, 240, 240] },
      [dynamicCategories.length + 3]: { halign: 'center', cellWidth: 25 }
    },
    didParseCell: (data) => {
      if (data.row.index === refereeEarnings.length) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [220, 220, 220];
        if (data.column.index === 1) data.cell.styles.halign = 'right';
      }
      if (data.column.index >= 2 && data.column.index < dynamicCategories.length + 2) {
        data.cell.styles.halign = 'center';
      }
    }
  });

  doc.save(`rapport-frais-${format(new Date(), 'yyyy-MM')}.pdf`);
};



