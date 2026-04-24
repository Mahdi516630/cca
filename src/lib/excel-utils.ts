import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Referee, Category, Designation } from '../types';

export const generateNetAPayerExcelReport = async (
  designations: Designation[],
  referees: Referee[],
  categories: Category[]
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Net à Payer');

  const dynamicCategories = categories.sort((a, b) => a.name.localeCompare(b.name));
  const totalCols = 5 + dynamicCategories.length; // N°, NOM, GRADE, [Cats Totals], TOTAL, PHONE

  // --- HEADER SECTION ---
  worksheet.mergeCells(1, 1, 1, totalCols);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = 'FEDERATION DJIBOUTIENNE DE FOOTBALL';
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };

  worksheet.mergeCells(2, 1, 2, totalCols);
  const contactCell = worksheet.getCell(2, 1);
  contactCell.value = 'COMMISSION CENTRALE DES ARBITRES';
  contactCell.font = { bold: true, size: 12, underline: true };
  contactCell.alignment = { horizontal: 'center' };

  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: fr }).toUpperCase();
  worksheet.mergeCells(4, 1, 4, totalCols);
  const bannerCell = worksheet.getCell(4, 1);
  bannerCell.value = `RAPPORT NET A PAYER - MOIS DE ${currentMonth}`;
  bannerCell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  bannerCell.alignment = { horizontal: 'center' };
  bannerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2E7D32' }
  };

  // --- TABLE HEADERS ---
  const headerRow = worksheet.getRow(6);
  headerRow.values = ['N°', 'NOM', 'GRADE', ...dynamicCategories.map(c => c.name), 'TOTAL', 'PHONE'];
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  
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
      fgColor: { argb: 'FFC6EFCE' }
    };
  }

  // --- DATA ROWS ---
  let grandTotal = 0;
  const activeReferees = referees.filter(ref => {
    return designations.some(d => d.centralId === ref.id || d.assistant1Id === ref.id || d.assistant2Id === ref.id || d.fourthId === ref.id);
  });

  activeReferees.forEach((ref, index) => {
    const row = worksheet.getRow(7 + index);
    let rowNetTotal = 0;
    
    const catFees = dynamicCategories.map(cat => {
      const relevantDesignations = designations.filter(d => d.categoryId === cat.id);
      let catTotal = 0;
      relevantDesignations.forEach(d => {
        if (d.centralId === ref.id) catTotal += cat.centralFee;
        if (d.assistant1Id === ref.id || d.assistant2Id === ref.id) catTotal += cat.assistantFee;
        if (d.fourthId === ref.id) catTotal += cat.fourthFee;
      });
      rowNetTotal += catTotal;
      return catTotal || '';
    });

    row.values = [
      index + 1,
      ref.name.toUpperCase(),
      ref.grade || '',
      ...catFees,
      rowNetTotal,
      ref.phone || ''
    ];

    grandTotal += rowNetTotal;

    for (let i = 1; i <= totalCols; i++) {
      const cell = row.getCell(i);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (i > 3) cell.alignment = { horizontal: 'center' };
    }
  });

  // --- TOTAL ROW ---
  const totalRowIndex = 7 + activeReferees.length;
  const totalRow = worksheet.getRow(totalRowIndex);
  
  worksheet.mergeCells(totalRowIndex, 1, totalRowIndex, 3);
  totalRow.getCell(1).value = 'TOTAL GENERAL';
  totalRow.getCell(1).font = { bold: true, color: { argb: 'FFFF0000' } };
  totalRow.getCell(1).alignment = { horizontal: 'right' };

  totalRow.getCell(totalCols - 1).value = grandTotal;
  totalRow.getCell(totalCols - 1).font = { bold: true, color: { argb: 'FFFF0000' } };
  totalRow.getCell(totalCols - 1).alignment = { horizontal: 'center' };

  for (let i = 1; i <= totalCols; i++) {
    const cell = totalRow.getCell(i);
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    if (i > 3 && i !== totalCols - 1) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC6EFCE' }
      };
    }
  }

  // Column Widths
  worksheet.getColumn(1).width = 5;
  worksheet.getColumn(2).width = 35;
  worksheet.getColumn(3).width = 15;
  for (let i = 4; i <= totalCols; i++) {
    worksheet.getColumn(i).width = 12;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `rapport-net-a-payer-${format(new Date(), 'yyyy-MM')}.xlsx`);
};

export const generateRefereeExcelReport = async (
  designations: Designation[],
  referees: Referee[],
  categories: Category[]
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Rapport de Frais (Audit)');

  const dynamicCategories = categories.sort((a, b) => a.name.localeCompare(b.name));
  const numCats = dynamicCategories.length;
  // Columns: N°, NOM, GRADE, [3 cols per Cat], TOTAL, PHONE
  const totalCols = 3 + (numCats * 3) + 2;

  // --- HEADER SECTION ---
  worksheet.mergeCells(1, 1, 1, totalCols);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = 'FEDERATION DJIBOUTIENNE DE FOOTBALL';
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };

  worksheet.mergeCells(2, 1, 2, totalCols);
  const contactCell = worksheet.getCell(2, 1);
  contactCell.value = 'Tel : (00253) 35 35 99 - Fax : (00253) 35 35 88 - B.P : 2694 - fdf@yahoo.fr';
  contactCell.font = { size: 10 };
  contactCell.alignment = { horizontal: 'center' };

  worksheet.mergeCells(3, 1, 3, totalCols);
  const commissionCell = worksheet.getCell(3, 1);
  commissionCell.value = 'COMMISSION CENTRALE DES ARBITRES';
  commissionCell.font = { bold: true, size: 12, underline: true };
  commissionCell.alignment = { horizontal: 'center' };

  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: fr }).toUpperCase();
  worksheet.mergeCells(4, 1, 4, totalCols);
  const bannerCell = worksheet.getCell(4, 1);
  bannerCell.value = `RAPPORT DETAILLE DES FRAIS - MOIS DE ${currentMonth}`;
  bannerCell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  bannerCell.alignment = { horizontal: 'center' };
  bannerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2E7D32' }
  };

  // --- TABLE HEADERS (HIERARCHICAL) ---
  const headerRow1 = worksheet.getRow(6);
  const headerRow2 = worksheet.getRow(7);

  // Fixed merged headers
  const fixedHeaders = ['N°', 'NOM', 'GRADE'];
  fixedHeaders.forEach((label, i) => {
    worksheet.mergeCells(6, i + 1, 7, i + 1);
    const cell = headerRow1.getCell(i + 1);
    cell.value = label;
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Category headers
  dynamicCategories.forEach((cat, i) => {
    const startCol = 4 + (i * 3);
    worksheet.mergeCells(6, startCol, 6, startCol + 2);
    const cell = headerRow1.getCell(startCol);
    cell.value = cat.name.toUpperCase();
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };

    headerRow2.getCell(startCol).value = 'C';
    headerRow2.getCell(startCol + 1).value = 'As';
    headerRow2.getCell(startCol + 2).value = '4ème';
    
    [0, 1, 2].forEach(offset => {
      headerRow2.getCell(startCol + offset).font = { bold: true, size: 9 };
      headerRow2.getCell(startCol + offset).alignment = { horizontal: 'center' };
    });
  });

  // End headers
  const totalCol = 4 + (numCats * 3);
  const phoneCol = totalCol + 1;
  
  worksheet.mergeCells(6, totalCol, 7, totalCol);
  const totalHeaderCell = headerRow1.getCell(totalCol);
  totalHeaderCell.value = 'TOTAL';
  totalHeaderCell.font = { bold: true };
  totalHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(6, phoneCol, 7, phoneCol);
  const phoneHeaderCell = headerRow1.getCell(phoneCol);
  phoneHeaderCell.value = 'TÉL';
  phoneHeaderCell.font = { bold: true };
  phoneHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Style all header cells
  for (let r = 6; r <= 7; r++) {
    for (let c = 1; c <= totalCols; c++) {
      const cell = worksheet.getRow(r).getCell(c);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC6EFCE' }
      };
    }
  }

  // --- DATA ROWS ---
  let grandTotal = 0;
  const activeReferees = referees.filter(ref => {
    return designations.some(d => d.centralId === ref.id || d.assistant1Id === ref.id || d.assistant2Id === ref.id || d.fourthId === ref.id);
  });

  activeReferees.forEach((ref, index) => {
    const row = worksheet.getRow(8 + index);
    let rowNetTotal = 0;
    
    // N°, Nom, Grade
    row.getCell(1).value = index + 1;
    row.getCell(2).value = ref.name.toUpperCase();
    row.getCell(3).value = ref.grade || '';

    // Category Counts
    dynamicCategories.forEach((cat, i) => {
      const startCol = 4 + (i * 3);
      const relDesigs = designations.filter(d => d.categoryId === cat.id);
      
      let cCount = 0;
      let aCount = 0;
      let fCount = 0;
      
      relDesigs.forEach(d => {
        if (d.centralId === ref.id) cCount++;
        if (d.assistant1Id === ref.id || d.assistant2Id === ref.id) aCount++;
        if (d.fourthId === ref.id) fCount++;
      });

      row.getCell(startCol).value = cCount || '';
      row.getCell(startCol + 1).value = aCount || '';
      row.getCell(startCol + 2).value = fCount || '';

      rowNetTotal += (cCount * cat.centralFee) + (aCount * cat.assistantFee) + (fCount * cat.fourthFee);
    });

    row.getCell(totalCol).value = rowNetTotal;
    row.getCell(phoneCol).value = ref.phone || '';

    grandTotal += rowNetTotal;

    // Style data cells
    for (let i = 1; i <= totalCols; i++) {
      const cell = row.getCell(i);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (i > 2) cell.alignment = { horizontal: 'center' };
    }
  });

  // --- TOTAL ROW ---
  const totalRowIndex = 8 + activeReferees.length;
  const totalRow = worksheet.getRow(totalRowIndex);
  
  worksheet.mergeCells(totalRowIndex, 1, totalRowIndex, 3);
  totalRow.getCell(1).value = 'TOTAL GENERAL';
  totalRow.getCell(1).font = { bold: true, color: { argb: 'FFFF0000' } };
  totalRow.getCell(1).alignment = { horizontal: 'right' };

  totalRow.getCell(totalCol).value = grandTotal;
  totalRow.getCell(totalCol).font = { bold: true, color: { argb: 'FFFF0000' } };
  totalRow.getCell(totalCol).alignment = { horizontal: 'center' };

  for (let i = 1; i <= totalCols; i++) {
    const cell = totalRow.getCell(i);
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    if (i > 3 && i !== totalCol) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };
    }
  }

  // Column Widths
  worksheet.getColumn(1).width = 5;
  worksheet.getColumn(2).width = 35;
  worksheet.getColumn(3).width = 15;
  for (let i = 4; i < totalCol; i++) {
    worksheet.getColumn(i).width = 6;
  }
  worksheet.getColumn(totalCol).width = 15;
  worksheet.getColumn(phoneCol).width = 15;

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `rapport-net-a-payer-${format(new Date(), 'yyyy-MM')}.xlsx`);
};

export const generateSingleCategoryExcelAudit = async (
  designations: Designation[],
  referees: Referee[],
  category: Category
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`Audit ${category.name}`);

  const totalCols = 9; // N°, NOM, GRADES, Catégorie, CENTRE, ASSISTANTS, 4ème, TOTAL, TEL

  // --- HEADER SECTION ---
  worksheet.mergeCells(1, 1, 1, totalCols);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = 'FEDERATION DJIBOUTIENNE DE FOOTBALL';
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };

  worksheet.mergeCells(2, 1, 2, totalCols);
  const contactCell = worksheet.getCell(2, 1);
  contactCell.value = 'Tel : (00253) 35 35 99 - Fax : (00253) 35 35 88 - B.P : 2694 - fdf@yahoo.fr';
  contactCell.font = { size: 11 };
  contactCell.alignment = { horizontal: 'center' };

  worksheet.mergeCells(3, 1, 3, totalCols);
  const commissionCell = worksheet.getCell(3, 1);
  commissionCell.value = 'COMMISSION CENTRALE DES ARBITRES';
  commissionCell.font = { bold: true, size: 12, underline: true };
  commissionCell.alignment = { horizontal: 'center' };

  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: fr }).toUpperCase();
  worksheet.mergeCells(4, 1, 4, totalCols);
  const bannerCell = worksheet.getCell(4, 1);
  bannerCell.value = `FRAIS DU MOIS DE ${currentMonth} ${category.name.toUpperCase()}`;
  bannerCell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  bannerCell.alignment = { horizontal: 'center' };
  bannerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2E7D32' }
  };

  // --- TABLE HEADERS (HIERARCHICAL) ---
  const headerRow1 = worksheet.getRow(6);
  const headerRow2 = worksheet.getRow(7);

  // Merged headers for N°, NOM, GRADES, Catégorie
  const fixedLabels = ['N°', 'NOM', 'GRADES', 'Catégorie'];
  fixedLabels.forEach((label, i) => {
    worksheet.mergeCells(6, i + 1, 7, i + 1);
    const cell = headerRow1.getCell(i + 1);
    cell.value = label;
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Merged ROI Header
  worksheet.mergeCells(6, 5, 6, 7);
  const roleHeaderCell = headerRow1.getCell(5);
  roleHeaderCell.value = 'RÔLES';
  roleHeaderCell.font = { bold: true };
  roleHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };

  headerRow2.getCell(5).value = 'CENTRE';
  headerRow2.getCell(6).value = 'ASSISTANTS';
  headerRow2.getCell(7).value = '4ème';

  // TOTAL and TEL
  worksheet.mergeCells(6, 8, 7, 8);
  const totalHeaderCell = headerRow1.getCell(8);
  totalHeaderCell.value = 'TOTAL';
  totalHeaderCell.font = { bold: true };
  totalHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells(6, 9, 7, 9);
  const telHeaderCell = headerRow1.getCell(9);
  telHeaderCell.value = 'TEL';
  telHeaderCell.font = { bold: true };
  telHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Style all header cells
  for (let r = 6; r <= 7; r++) {
    for (let c = 1; c <= totalCols; c++) {
      const cell = worksheet.getRow(r).getCell(c);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC6EFCE' }
      };
      if (r === 7 && c >= 5 && c <= 7) {
        cell.font = { bold: true, size: 9 };
      }
    }
  }

  // --- DATA ROWS ---
  let totalCentre = 0;
  let totalAsst = 0;
  let totalFourth = 0;
  let totalAmount = 0;

  const results = referees.map(ref => {
    const relDesigs = designations.filter(d => d.categoryId === category.id);
    let cCount = 0;
    let aCount = 0;
    let fCount = 0;
    
    relDesigs.forEach(d => {
      if (d.centralId === ref.id) cCount++;
      if (d.assistant1Id === ref.id || d.assistant2Id === ref.id) aCount++;
      if (d.fourthId === ref.id) fCount++;
    });
    
    const fees = (cCount * category.centralFee) + (aCount * category.assistantFee) + (fCount * category.fourthFee);
    
    return { ref, cCount, aCount, fCount, fees };
  }).filter(r => r.fees > 0);

  results.forEach((res, index) => {
    const row = worksheet.getRow(8 + index);
    row.values = [
      index + 1,
      res.ref.name.toUpperCase(),
      res.ref.grade || '',
      category.name,
      res.cCount || '',
      res.aCount || '',
      res.fCount || '',
      res.fees,
      res.ref.phone || ''
    ];

    totalCentre += res.cCount;
    totalAsst += res.aCount;
    totalFourth += res.fCount;
    totalAmount += res.fees;

    for (let i = 1; i <= totalCols; i++) {
      const cell = row.getCell(i);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (i > 3) cell.alignment = { horizontal: 'center' };
    }
  });

  // --- TOTAL ROW ---
  const totalRowIndex = 8 + results.length;
  const totalRow = worksheet.getRow(totalRowIndex);
  worksheet.mergeCells(totalRowIndex, 1, totalRowIndex, 3);
  totalRow.getCell(1).value = 'TOTAL';
  totalRow.getCell(1).font = { bold: true, italic: true, color: { argb: 'FFFF0000' } };
  totalRow.getCell(1).alignment = { horizontal: 'center' };
  
  totalRow.getCell(5).value = totalCentre;
  totalRow.getCell(6).value = totalAsst;
  totalRow.getCell(7).value = totalFourth;
  totalRow.getCell(8).value = totalAmount;

  for (let i = 1; i <= totalCols; i++) {
    const cell = totalRow.getCell(i);
    cell.font = { bold: true, color: { argb: (i === 1 || i === 8) ? 'FFFF0000' : 'FF000000' } };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  }

  // Column Widths
  worksheet.getColumn(1).width = 5;
  worksheet.getColumn(2).width = 35;
  worksheet.getColumn(3).width = 20;
  worksheet.getColumn(4).width = 15;
  worksheet.getColumn(5).width = 12;
  worksheet.getColumn(6).width = 12;
  worksheet.getColumn(7).width = 12;
  worksheet.getColumn(8).width = 15;
  worksheet.getColumn(9).width = 15;

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `audit-${category.name}-${format(new Date(), 'yyyy-MM')}.xlsx`);
};

export const exportDesignationsToExcel = async (
  designations: Designation[],
  referees: Referee[],
  categories: Category[]
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Désignations de la semaine');

  const totalCols = 12;
  let currentRow = 1;

  // --- FEDERATION HEADER ---
  worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
  const titleCell = worksheet.getCell(currentRow, 1);
  titleCell.value = 'FEDERATION DJIBOUTIENNE DE FOOTBALL';
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };
  currentRow++;

  worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
  const contactCell = worksheet.getCell(currentRow, 1);
  contactCell.value = 'COMMISSION CENTRALE DES ARBITRES';
  contactCell.font = { bold: true, size: 12, underline: true };
  contactCell.alignment = { horizontal: 'center' };
  currentRow += 2;

  // Group by category
  const grouped = designations.reduce((acc, d) => {
    const catId = d.categoryId;
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(d);
    return acc;
  }, {} as Record<string, Designation[]>);

  const entries = Object.entries(grouped);
  if (entries.length === 0) return;

  for (const [catId, catDesigs] of entries) {
    const cat = categories.find(c => c.id === catId);
    const sortedDesigs = catDesigs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Category Header
    worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
    const catCell = worksheet.getCell(currentRow, 1);
    catCell.value = (cat?.name || 'Catégorie Inconnue').toUpperCase();
    catCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    catCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E7D32' }
    };
    catCell.alignment = { horizontal: 'center' };
    currentRow += 1;

    // Table Headers
    const headerRow = worksheet.getRow(currentRow);
    headerRow.values = [
      'Date', 'JOUR', 'HEURE', 'Equipe A', 'Equipe B', 'TERRAIN', 'MATC N°', 
      'Arbitre', 'Assisstant 1', 'Assisstant 2', '4eme officiel', 'ASSESSEUR'
    ];
    headerRow.font = { bold: true, size: 10 };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    
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
        fgColor: { argb: 'FFC6EFCE' }
      };
    }
    currentRow += 1;

    // Data Rows
    sortedDesigs.forEach(d => {
      const row = worksheet.getRow(currentRow);
      const refereeName = (id: string) => referees.find(r => r.id === id)?.name || '';
      const dayName = d.date ? format(parseISO(d.date), 'EEEE', { locale: fr }).toUpperCase() : '';

      row.values = [
        d.date || '',
        dayName,
        d.startTime || '',
        d.teamA || '',
        d.teamB || '',
        d.terrain || '',
        d.matchNumber || '',
        refereeName(d.centralId),
        refereeName(d.assistant1Id),
        refereeName(d.assistant2Id),
        refereeName(d.fourthId),
        d.assessor || ''
      ];

      for (let i = 1; i <= totalCols; i++) {
        const cell = row.getCell(i);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.font = { size: 9 };
      }
      currentRow += 1;
    });

    currentRow += 2; // Extra space after category
  }

  // Column Widths
  worksheet.getColumn(1).width = 12;
  worksheet.getColumn(2).width = 10;
  worksheet.getColumn(3).width = 10;
  worksheet.getColumn(4).width = 20;
  worksheet.getColumn(5).width = 20;
  worksheet.getColumn(6).width = 15;
  worksheet.getColumn(7).width = 10;
  worksheet.getColumn(8).width = 20;
  worksheet.getColumn(9).width = 20;
  worksheet.getColumn(10).width = 20;
  worksheet.getColumn(11).width = 20;
  worksheet.getColumn(12).width = 20;

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `designations-hebdomadaires-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

const parseISO = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const generateBulkDesignationsExcel = async (
  selectedDesignations: Designation[],
  referees: Referee[],
  categories: Category[]
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Désignations Sélectionnées');

  const totalCols = 12;
  let currentRow = 1;

  // --- FEDERATION HEADER ---
  worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
  const titleCell = worksheet.getCell(currentRow, 1);
  titleCell.value = 'FEDERATION DJIBOUTIENNE DE FOOTBALL';
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };
  currentRow++;

  worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
  const contactCell = worksheet.getCell(currentRow, 1);
  contactCell.value = 'COMMISSION CENTRALE DES ARBITRES';
  contactCell.font = { bold: true, size: 12, underline: true };
  contactCell.alignment = { horizontal: 'center' };
  currentRow += 2;

  // Group by category
  const grouped = selectedDesignations.reduce((acc, d) => {
    const catId = d.categoryId;
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(d);
    return acc;
  }, {} as Record<string, Designation[]>);

  const entries = Object.entries(grouped);
  if (entries.length === 0) return;

  for (const [catId, catDesigs] of entries) {
    const cat = categories.find(c => c.id === catId);
    const sortedDesigs = catDesigs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Category Header
    worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
    const catCell = worksheet.getCell(currentRow, 1);
    catCell.value = (cat?.name || 'Catégorie Inconnue').toUpperCase();
    catCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    catCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E7D32' }
    };
    catCell.alignment = { horizontal: 'center' };
    currentRow += 1;

    // Table Headers
    const headerRow = worksheet.getRow(currentRow);
    headerRow.values = [
      'Date', 'JOUR', 'HEURE', 'Equipe A', 'Equipe B', 'TERRAIN', 'MATC N°', 
      'Arbitre', 'Assisstant 1', 'Assisstant 2', '4eme officiel', 'ASSESSEUR'
    ];
    headerRow.font = { bold: true, size: 10 };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    
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
        fgColor: { argb: 'FFC6EFCE' }
      };
    }
    currentRow += 1;

    // Data Rows
    sortedDesigs.forEach(d => {
      const row = worksheet.getRow(currentRow);
      const refereeName = (id: string) => referees.find(r => r.id === id)?.name || '';
      const dayName = d.date ? format(parseISO(d.date), 'EEEE', { locale: fr }).toUpperCase() : '';

      row.values = [
        d.date || '',
        dayName,
        d.startTime || '',
        d.teamA || '',
        d.teamB || '',
        d.terrain || '',
        d.matchNumber || '',
        refereeName(d.centralId),
        refereeName(d.assistant1Id),
        refereeName(d.assistant2Id),
        refereeName(d.fourthId),
        d.assessor || ''
      ];

      for (let i = 1; i <= totalCols; i++) {
        const cell = row.getCell(i);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.font = { size: 9 };
      }
      currentRow += 1;
    });

    currentRow += 2; // Extra space after category
  }

  // Column Widths
  worksheet.getColumn(1).width = 12;
  worksheet.getColumn(2).width = 10;
  worksheet.getColumn(3).width = 10;
  worksheet.getColumn(4).width = 20;
  worksheet.getColumn(5).width = 20;
  worksheet.getColumn(6).width = 15;
  worksheet.getColumn(7).width = 10;
  worksheet.getColumn(8).width = 20;
  worksheet.getColumn(9).width = 20;
  worksheet.getColumn(10).width = 20;
  worksheet.getColumn(11).width = 20;
  worksheet.getColumn(12).width = 20;

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `designations-selection-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
