import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Referee, Category, Designation } from '../types';

export const generateRefereeExcelReport = async (
  designations: Designation[],
  referees: Referee[],
  categories: Category[]
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Rapport de Frais');

  const dynamicCategories = categories.sort((a, b) => a.name.localeCompare(b.name));
  const totalCols = 4 + dynamicCategories.length; // N°, NOM, [Cats], NET, PHONE

  // --- HEADER SECTION ---
  // Federation Name
  worksheet.mergeCells(1, 1, 1, totalCols);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = 'FEDERATION DJIBOUTIENNE DE FOOTBALL';
  titleCell.font = { bold: true, size: 12 };
  titleCell.alignment = { horizontal: 'center' };

  // Contact Info
  worksheet.mergeCells(2, 1, 2, totalCols);
  const contactCell = worksheet.getCell(2, 1);
  contactCell.value = 'Tel : (00253) 35 35 99 - Fax : (00253) 35 35 88 - B.P : 2694 - fdf@yahoo.fr';
  contactCell.font = { size: 10 };
  contactCell.alignment = { horizontal: 'center' };

  // Commission Name
  worksheet.mergeCells(3, 1, 3, totalCols);
  const commissionCell = worksheet.getCell(3, 1);
  commissionCell.value = 'COMMISSION CENTRALE DES ARBITRES';
  commissionCell.font = { bold: true, size: 11, underline: true };
  commissionCell.alignment = { horizontal: 'center' };

  // Month Banner
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: fr }).toUpperCase();
  worksheet.mergeCells(4, 1, 4, totalCols);
  const bannerCell = worksheet.getCell(4, 1);
  bannerCell.value = `FRAIS DU MOIS DE ${currentMonth} COMPLET`;
  bannerCell.font = { bold: true, size: 10 };
  bannerCell.alignment = { horizontal: 'center' };
  bannerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // --- TABLE HEADERS ---
  const headerRow = worksheet.getRow(6);
  headerRow.values = ['N°', 'NOM', ...dynamicCategories.map(c => c.name), 'NET A PAYES', 'PHONE'];
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Style headers
  for (let i = 1; i <= totalCols; i++) {
    const cell = headerRow.getCell(i);
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
  }

  // --- DATA ROWS ---
  referees.forEach((ref, index) => {
    const row = worksheet.getRow(7 + index);
    const earningsPerCategory = dynamicCategories.map(cat => {
      const relevantDesignations = designations.filter(d => d.categoryId === cat.id);
      let total = 0;
      relevantDesignations.forEach(d => {
        if (d.centralId === ref.id) total += cat.centralFee;
        if (d.assistant1Id === ref.id || d.assistant2Id === ref.id) total += cat.assistantFee;
        if (d.fourthId === ref.id) total += cat.fourthFee;
      });
      return total || null;
    });

    const netToPay = earningsPerCategory.reduce((acc, val) => acc + (val || 0), 0);

    row.values = [
      index + 1,
      ref.name.toUpperCase(),
      ...earningsPerCategory,
      netToPay,
      ref.phone || ''
    ];

    // Style data cells
    for (let i = 1; i <= totalCols; i++) {
      const cell = row.getCell(i);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (i === 2) cell.font = { bold: true };
      if (i > 2 && i < totalCols) cell.alignment = { horizontal: 'center' };
    }
  });

  // --- TOTAL ROW ---
  const lastDataRowIndex = 7 + referees.length;
  const totalRow = worksheet.getRow(lastDataRowIndex);
  
  totalRow.getCell(2).value = 'TOTAL';
  totalRow.getCell(2).font = { bold: true };
  totalRow.getCell(2).alignment = { horizontal: 'right' };

  dynamicCategories.forEach((cat, colIdx) => {
    const colNum = 3 + colIdx;
    let colTotal = 0;
    referees.forEach((_, refIdx) => {
      const val = worksheet.getRow(7 + refIdx).getCell(colNum).value;
      colTotal += (Number(val) || 0);
    });
    totalRow.getCell(colNum).value = colTotal;
  });

  const netColNum = totalCols - 1;
  let grandTotal = 0;
  referees.forEach((_, refIdx) => {
    const val = worksheet.getRow(7 + refIdx).getCell(netColNum).value;
    grandTotal += (Number(val) || 0);
  });
  totalRow.getCell(netColNum).value = grandTotal;

  // Style total row
  for (let i = 1; i <= totalCols; i++) {
    const cell = totalRow.getCell(i);
    cell.font = { bold: true };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
  }

  // Column Widths
  worksheet.getColumn(1).width = 5;
  worksheet.getColumn(2).width = 35;
  for (let i = 3; i <= totalCols; i++) {
    worksheet.getColumn(i).width = 15;
  }

  // Write to buffer and save
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `rapport-frais-${format(new Date(), 'yyyy-MM')}.xlsx`);
};
