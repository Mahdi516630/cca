import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Referee, Category, Designation } from '../types';

// Helper to convert date safely
const parseISODate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(y, m, d);
  }
  return new Date(dateStr);
};

// Map day numbers/names in French
const getFrenchDay = (dateStr: string) => {
  try {
    const d = parseISODate(dateStr);
    return format(d, 'EEEE', { locale: fr }).toUpperCase();
  } catch {
    return 'JOUR';
  }
};

// Map date format nicely
const getFrenchDate = (dateStr: string) => {
  try {
    const d = parseISODate(dateStr);
    return format(d, 'dd-MMM', { locale: fr }).toLowerCase();
  } catch {
    return dateStr;
  }
};

/**
 * EXCEL EXPORT: Generates a beautiful, FDF-branded Excel sheet for a specific club's calendar
 */
export const exportClubCalendarToExcel = async (
  clubName: string,
  clubMatches: Designation[],
  categories: Category[],
  referees: Referee[]
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`Calendrier ${clubName.slice(0, 15)}`);

  const totalCols = 7;
  let currentRow = 1;

  // --- TOP MAIN BAR (FDF RED BANNER style) ---
  worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
  const mainBar = worksheet.getCell(currentRow, 1);
  mainBar.value = 'FEDERATION DJIBOUTIENNE DE FOOTBALL';
  mainBar.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  mainBar.alignment = { horizontal: 'center', vertical: 'middle' };
  mainBar.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A365D' } // Deep Royal Blue
  };
  worksheet.getRow(currentRow).height = 25;
  currentRow++;

  // --- SUB SUBTITLE (Yellow accent bar) ---
  worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
  const subBar = worksheet.getCell(currentRow, 1);
  subBar.value = "Commission d'Organisation des Compétitions | Département des Compétitions";
  subBar.font = { bold: true, size: 10, color: { argb: 'FF000000' } };
  subBar.alignment = { horizontal: 'center', vertical: 'middle' };
  subBar.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFD700' } // Gold/Yellow
  };
  worksheet.getRow(currentRow).height = 20;
  currentRow += 2;

  // --- CLUB TITLE BANNER ---
  worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
  const clubBanner = worksheet.getCell(currentRow, 1);
  clubBanner.value = `CALENDRIER OFFICIEL DES RENCONTRES - ${clubName.toUpperCase()}`;
  clubBanner.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  clubBanner.alignment = { horizontal: 'center', vertical: 'middle' };
  clubBanner.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE53E3E' } // FDF Red
  };
  worksheet.getRow(currentRow).height = 28;
  currentRow += 2;

  // --- TABLE HEADERS ---
  const headerRow = worksheet.getRow(currentRow);
  headerRow.values = [
    'DATE', 
    'JOUR', 
    'HEURE', 
    'MATCH RENCONTRE', 
    'TERRAIN', 
    'N° MATCH',
    'CORPS ARBITRAL'
  ];
  headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  
  for (let i = 1; i <= totalCols; i++) {
    const cell = headerRow.getCell(i);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2B6CB0' } // French Blue/Cyan Accent
    };
    cell.border = {
      top: { style: 'medium' },
      left: { style: 'thin' },
      bottom: { style: 'medium' },
      right: { style: 'thin' }
    };
  }
  worksheet.getRow(currentRow).height = 24;
  currentRow++;

  // --- DATA ROWS ---
  const sortedMatches = [...clubMatches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedMatches.forEach((m) => {
    const row = worksheet.getRow(currentRow);
    
    // Referee lookup
    const refCentral = referees.find((r) => r.id === m.centralId)?.name || 'Non désigné';
    const refAss1 = referees.find((r) => r.id === m.assistant1Id)?.name || 'Non désigné';
    const refAss2 = referees.find((r) => r.id === m.assistant2Id)?.name || 'Non désigné';
    const refFourth = referees.find((r) => r.id === m.fourthId)?.name || 'Non désigné';

    const refString = `AC: ${refCentral} | A1: ${refAss1} | A2: ${refAss2}` + (m.fourthId && m.fourthId !== 'none' ? ` | 4e: ${refFourth}` : '');

    row.values = [
      getFrenchDate(m.date),
      getFrenchDay(m.date),
      m.startTime || '',
      `${m.teamA}   VS   ${m.teamB}`,
      m.terrain || 'Non défini',
      m.matchNumber || '-',
      refString
    ];

    // Styling each cell in the data row
    for (let i = 1; i <= totalCols; i++) {
      const cell = row.getCell(i);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Center code columns, make match details beautiful
      if (i === 4) {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.font = { bold: true, size: 10 };
      } else if (i === 7) {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        cell.font = { italic: true, size: 9, color: { argb: 'FF4A5568' } };
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { size: 10 };
      }

      // Add a soft zebra-striping
      if (currentRow % 2 === 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF7FAFC' }
        };
      }
    }
    
    worksheet.getRow(currentRow).height = 30; // Spacious row heights
    currentRow++;
  });

  // --- FOOTER & SIGNATURE SECTION ---
  currentRow += 2;
  worksheet.mergeCells(currentRow, 4, currentRow, 7);
  const signatureTile = worksheet.getCell(currentRow, 4);
  signatureTile.value = "Le Département des Compétitions F.D.F";
  signatureTile.font = { bold: true, size: 11, underline: true };
  signatureTile.alignment = { horizontal: 'center' };

  // Set proper column widths
  worksheet.getColumn(1).width = 12; // Date
  worksheet.getColumn(2).width = 12; // Day
  worksheet.getColumn(3).width = 11; // Time
  worksheet.getColumn(4).width = 38; // Encounter (VS)
  worksheet.getColumn(5).width = 18; // Ground/Terrain
  worksheet.getColumn(6).width = 12; // Match Num
  worksheet.getColumn(7).width = 50; // Referees

  // Output buffer
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `calendrier-${clubName.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
};

/**
 * PDF EXPORT: Generates a high-quality, beautifully custom PDF calendar for the selected club
 * fully stylized with the Federation colors (red/blue/gold header blocks, logos, stamp placeholders, official styling)
 */
export const exportClubCalendarToPDF = (
  clubName: string,
  clubMatches: Designation[],
  categories: Category[],
  referees: Referee[]
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const sortedMatches = [...clubMatches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Colors & Margins
  const primaryColor = [26, 54, 93]; // Deep Royal Blue
  const goldColor = [255, 215, 0];   // Gold
  const redColor = [229, 62, 62];    // FDF Red
  const slateColor = [74, 85, 104];  // text color

  // Draw Header Decoration Blocks
  // Top left national stripe
  doc.setFillColor(26, 54, 93);
  doc.rect(10, 10, 277, 4, 'F'); // Top border blue stripe

  // --- LOGO BLOCK METADATA & TEXT ---
  doc.setTextColor(26, 54, 93);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FÉDÉRATION DJIBOUTIENNE DE FOOTBALL', 148, 20, { align: 'center' });
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(113, 128, 150);
  doc.text('Commission d\'Organisation des Compétitions — Département des Compétitions', 148, 25, { align: 'center' });
  doc.text('BP 2694 • Tel: (00253) 21 35 35 99 • fdf@yahoo.fr', 148, 30, { align: 'center' });

  // Draw Gold Ribbon Accent
  doc.setFillColor(255, 215, 0);
  doc.rect(10, 33, 277, 1.5, 'F');

  // Draw RED Banner with white text for Title (Matches FDF image style!)
  doc.setFillColor(229, 62, 62);
  doc.rect(10, 38, 277, 11, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`CALENDRIER OFFICIEL & CONVOCATION DES MATCHS - ${clubName.toUpperCase()}`, 148, 45, { align: 'center' });

  // Build the table rows
  const tableRows = sortedMatches.map((m) => {
    const category = categories.find((c) => c.id === m.categoryId);
    const central = referees.find((r) => r.id === m.centralId)?.name || 'Non désigné';
    const ass1 = referees.find((r) => r.id === m.assistant1Id)?.name || 'Non désigné';
    const ass2 = referees.find((r) => r.id === m.assistant2Id)?.name || 'Non désigné';
    const fourth = referees.find((r) => r.id === m.fourthId)?.name || 'Non désigné';

    const cleanDate = getFrenchDate(m.date);
    const cleanDay = getFrenchDay(m.date);
    const catName = category?.name || 'Inconnue';

    const refString = `AC: ${central}\nA1: ${ass1} | A2: ${ass2}` + 
      (m.fourthId && m.fourthId !== 'none' ? `\n4e: ${fourth}` : '');

    return [
      m.matchNumber || '-',
      catName,
      `${cleanDate}\n(${cleanDay})`,
      m.startTime || '-',
      `${m.teamA}   vs   ${m.teamB}`,
      m.terrain || 'Non défini',
      refString
    ];
  });

  // Call AutoTable
  autoTable(doc, {
    startY: 54,
    margin: { left: 10, right: 10 },
    head: [['N°', 'COMPÉTITION', 'DATE & JOUR', 'HEURE', 'RENCONTRE', 'TERRAIN', 'COPRO DE DÉSIGNATIONS ARBITRALES']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 54, 93],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      valign: 'middle'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'center', cellWidth: 25, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 28 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'center', cellWidth: 70, fontStyle: 'bold' },
      5: { halign: 'center', cellWidth: 32 },
      6: { halign: 'left', cellWidth: 95, fontSize: 8.5 }
    },
    styles: {
      fontSize: 9.5,
      cellPadding: 3,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [247, 250, 252]
    },
    didDrawPage: (data) => {
      // Add a official stamp watermark or footer
      const pageHeight = doc.internal.pageSize.height;
      
      // Stamp Placeholder & Signatures near bottom
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(113, 128, 150);
      doc.text('Avis officiel aux bureaux des Clubs engagés.', 12, pageHeight - 12);
      doc.text('Document certifié conforme par la Commission d\'Organisation des Compétitions FDF.', 12, pageHeight - 8);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(229, 62, 62);
      doc.text('Pour le Secrétariat Général', 242, pageHeight - 14, { align: 'center' });
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(26, 54, 93);
      doc.text('Département des Compétitions - F.D.F', 242, pageHeight - 9, { align: 'center' });
    }
  });

  // Save the PDF doc
  doc.save(`calendrier-${clubName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

/**
 * TEXT GENERATOR: Creates an elegant text summary for copying into WhatsApp/Telegram/Email
 */
export const generateClubMatchesTextMessage = (
  clubName: string,
  clubMatches: Designation[],
  categories: Category[],
  referees: Referee[]
) => {
  const sortedMatches = [...clubMatches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let msg = `🏆 *FEDERATION DJIBOUTIENNE DE FOOTBALL* 🏆\n`;
  msg += `📅 *CALENDRIER DES RENCONTRES - ${clubName.toUpperCase()}*\n`;
  msg += `----------------------------------------------------\n\n`;

  if (sortedMatches.length === 0) {
    msg += `Aucun match planifié actuellement.\n`;
    return msg;
  }

  sortedMatches.forEach((m, idx) => {
    const category = categories.find((c) => c.id === m.categoryId);
    const cleanDate = getFrenchDate(m.date);
    const cleanDay = getFrenchDay(m.date);
    
    // Referee lookup
    const central = referees.find((r) => r.id === m.centralId)?.name || 'Non désigné';
    const ass1 = referees.find((r) => r.id === m.assistant1Id)?.name || 'Non désigné';
    const ass2 = referees.find((r) => r.id === m.assistant2Id)?.name || 'Non désigné';

    msg += `⚽ *Match N°${m.matchNumber || (idx + 1)}* • _${category?.name || 'Compétition'}_ \n`;
    msg += `⚔️ *${m.teamA}*  vs  *${m.teamB}*\n`;
    msg += `📅 Date : *${cleanDay} ${cleanDate}*\n`;
    msg += `⏰ Horaire : *${m.startTime || '-'}* \n`;
    msg += `📍 Terrain : *${m.terrain || 'Non défini'}*\n`;
    msg += `🏁 Arbitre central : _${central}_\n`;
    msg += `🚩 Assistants : _${ass1}_ & _${ass2}_\n`;
    msg += `----------------------------------------------------\n\n`;
  });

  msg += `👉 Pour toute réclamation ou ajustement réglementaire, veuillez contacter le secrétariat de la Commission Centrale au plus tard 48h avant la rencontre.\n`;
  msg += `*Département des Compétitions, FDF*`;

  return msg;
};

export interface JourneeGrouping {
  name: string;
  matches: Designation[];
}

/**
 * Groups and partitions matches into standard football "Journéee" rounds dynamically and chronologically.
 * Each team can play at most once in a single Journée round block.
 */
export const groupMatchesIntoJournees = (matches: Designation[]): JourneeGrouping[] => {
  const sorted = [...matches].sort((a, b) => {
    const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return (a.startTime || '').localeCompare(b.startTime || '');
  });

  const journees: JourneeGrouping[] = [];
  let currentJourneeMatches: Designation[] = [];
  let currentTeams = new Set<string>();

  sorted.forEach((m) => {
    // If either team has already played in the current journee list, we push to start the next round
    if (
      (m.teamA && currentTeams.has(m.teamA)) ||
      (m.teamB && currentTeams.has(m.teamB))
    ) {
      if (currentJourneeMatches.length > 0) {
        journees.push({
          name: '',
          matches: currentJourneeMatches
        });
      }
      currentJourneeMatches = [m];
      currentTeams = new Set<string>();
      if (m.teamA) currentTeams.add(m.teamA);
      if (m.teamB) currentTeams.add(m.teamB);
    } else {
      currentJourneeMatches.push(m);
      if (m.teamA) currentTeams.add(m.teamA);
      if (m.teamB) currentTeams.add(m.teamB);
    }
  });

  if (currentJourneeMatches.length > 0) {
    journees.push({
      name: '',
      matches: currentJourneeMatches
    });
  }

  // Set the clean labels
  return journees.map((j, idx) => {
    const num = idx + 1;
    const name = num === 1 ? '1ère Journée' : `${num}ème Journée`;
    return { name, matches: j.matches };
  });
};

/**
 * EXCEL EXPORT: Generates a complete championship calendar grouped by Journées (like in the user's reference)
 */
export const exportChampionshipCalendarToExcel = async (
  categoryName: string,
  designations: Designation[],
  categories: Category[],
  referees: Referee[]
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`Championnat ${categoryName.slice(0, 15)}`);

  const totalCols = 7;
  let currentRow = 1;

  // --- TOP MAIN BAR (FDF BLUE BANNER style) ---
  worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
  const mainBar = worksheet.getCell(currentRow, 1);
  mainBar.value = 'FEDERATION DJIBOUTIENNE DE FOOTBALL';
  mainBar.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  mainBar.alignment = { horizontal: 'center', vertical: 'middle' };
  mainBar.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A365D' } // Deep Royal Blue
  };
  worksheet.getRow(currentRow).height = 28;
  currentRow++;

  // --- SUB SUBTITLE (Yellow accent bar) ---
  worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
  const subBar = worksheet.getCell(currentRow, 1);
  subBar.value = "Commission d'Organisation des Compétitions | Département des Compétitions";
  subBar.font = { bold: true, size: 10, color: { argb: 'FF000000' } };
  subBar.alignment = { horizontal: 'center', vertical: 'middle' };
  subBar.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFD700' } // Gold/Yellow
  };
  worksheet.getRow(currentRow).height = 20;
  currentRow++;

  // --- CHAMPIONNAT TITLE BANNER (Red banner) ---
  worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
  const titleBanner = worksheet.getCell(currentRow, 1);
  titleBanner.value = `CALENDRIER DU CHAMPIONNAT NATIONAL DE FOOTBALL — SAISON 2025/2026 "${categoryName.toUpperCase()}"`;
  titleBanner.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  titleBanner.alignment = { horizontal: 'center', vertical: 'middle' };
  titleBanner.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE53E3E' } // FDF Red
  };
  worksheet.getRow(currentRow).height = 28;
  currentRow += 2;

  // --- COLS HEADERS ---
  const headerRow = worksheet.getRow(currentRow);
  headerRow.values = [
    'Date', 
    'Jour', 
    'Heure', 
    'RENCONTRES (A vs B)', 
    'Terrain', 
    'N° Match',
    'Corps Arbitral / Convocation'
  ];
  headerRow.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  
  for (let i = 1; i <= totalCols; i++) {
    const cell = headerRow.getCell(i);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2B6CB0' } // Royal Blue
    };
    cell.border = {
      top: { style: 'medium' },
      left: { style: 'thin' },
      bottom: { style: 'medium' },
      right: { style: 'thin' }
    };
  }
  worksheet.getRow(currentRow).height = 24;
  currentRow++;

  // Divide matches into Journees
  const journees = groupMatchesIntoJournees(designations);

  // Print each Journee with a yellow divider row
  journees.forEach((j) => {
    // Merge full width row for Journee Header (e.g. 10ème Journee)
    worksheet.mergeCells(currentRow, 1, currentRow, totalCols);
    const jCell = worksheet.getCell(currentRow, 1);
    jCell.value = j.name.toUpperCase();
    jCell.font = { bold: true, size: 11, color: { argb: 'FF000000' } };
    jCell.alignment = { horizontal: 'center', vertical: 'middle' };
    jCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFD700' } // Bright Yellow / Gold as in the image
    };
    // Border for Journee divider
    for (let c = 1; c <= totalCols; c++) {
      const cell = worksheet.getCell(currentRow, c);
      cell.border = {
        top: { style: 'medium' },
        bottom: { style: 'medium' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
    worksheet.getRow(currentRow).height = 24;
    currentRow++;

    // Print matches under this Journee
    j.matches.forEach((m) => {
      const row = worksheet.getRow(currentRow);

      const refCentral = referees.find((r) => r.id === m.centralId)?.name || 'Non désigné';
      const refAss1 = referees.find((r) => r.id === m.assistant1Id)?.name || 'Non désigné';
      const refAss2 = referees.find((r) => r.id === m.assistant2Id)?.name || 'Non désigné';
      const refFourth = referees.find((r) => r.id === m.fourthId)?.name || 'Non désigné';

      const refString = `AC: ${refCentral} | A1: ${refAss1} | A2: ${refAss2}` + (m.fourthId && m.fourthId !== 'none' ? ` | 4e: ${refFourth}` : '');

      row.values = [
        getFrenchDate(m.date),
        getFrenchDay(m.date),
        m.startTime || '',
        `${m.teamA}   VS   ${m.teamB}`,
        m.terrain || 'Non défini',
        m.matchNumber || '-',
        refString
      ];

      for (let i = 1; i <= totalCols; i++) {
        const cell = row.getCell(i);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (i === 4) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.font = { bold: true, size: 10 };
        } else if (i === 7) {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
          cell.font = { italic: true, size: 9, color: { argb: 'FF4A5568' } };
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.font = { size: 9.5 };
        }
      }
      worksheet.getRow(currentRow).height = 28;
      currentRow++;
    });
  });

  // Footer signing line
  currentRow += 2;
  worksheet.mergeCells(currentRow, 4, currentRow, 7);
  const footerSec = worksheet.getCell(currentRow, 4);
  footerSec.value = "La Commission d'Organisation des Compétitions F.D.F";
  footerSec.font = { bold: true, size: 11, underline: true };
  footerSec.alignment = { horizontal: 'center' };

  // Set widths
  worksheet.getColumn(1).width = 12; // Date
  worksheet.getColumn(2).width = 12; // Day
  worksheet.getColumn(3).width = 11; // Time
  worksheet.getColumn(4).width = 38; // Encounter (VS)
  worksheet.getColumn(5).width = 18; // Ground
  worksheet.getColumn(6).width = 12; // Match Num
  worksheet.getColumn(7).width = 50; // Referees

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `calendrier-general-${categoryName.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
};

/**
 * PDF EXPORT: Generates a gorgeous publication-ready multipage PDF for the whole championship,
 * sorted and grouped with yellow/gold separation banners exactly like the official FDF tournament prints.
 */
export const exportChampionshipCalendarToPDF = (
  categoryName: string,
  designations: Designation[],
  categories: Category[],
  referees: Referee[]
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageHeight = doc.internal.pageSize.height;

  // Header blocks similar to club calendar
  doc.setFillColor(26, 54, 93); // Deep Royal Blue
  doc.rect(10, 10, 277, 4, 'F'); 

  doc.setTextColor(26, 54, 93);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FÉDÉRATION DJIBOUTIENNE DE FOOTBALL', 148, 20, { align: 'center' });
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(113, 128, 150);
  doc.text('Commission d\'Organisation des Compétitions — Département des Compétitions', 148, 25, { align: 'center' });
  doc.text('BP 2694 • Tel: (00253) 21 35 35 99 • fdf@yahoo.fr', 148, 30, { align: 'center' });

  // Draw Gold Ribbon Accent
  doc.setFillColor(255, 215, 0);
  doc.rect(10, 33, 277, 1.5, 'F');

  // Draw RED Banner
  doc.setFillColor(229, 62, 62);
  doc.rect(10, 38, 277, 11, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`CALENDRIER OFFICIEL DES RENCONTRES — SAISON 2025/2026 "${categoryName.toUpperCase()}"`, 148, 45, { align: 'center' });

  // Divide into Journees
  const journees = groupMatchesIntoJournees(designations);

  // Build the unified table body with spanned Journee headers
  const tableRows: any[] = [];

  journees.forEach((j) => {
    // Add Journee Header Row
    tableRows.push([
      {
        content: j.name.toUpperCase(),
        colSpan: 7,
        styles: {
          fillColor: [255, 215, 0], // Bright Yellow / Gold
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 9.5,
          cellPadding: 2.5
        }
      }
    ]);

    // Add match rows
    j.matches.forEach((m) => {
      const central = referees.find((r) => r.id === m.centralId)?.name || 'Non désigné';
      const ass1 = referees.find((r) => r.id === m.assistant1Id)?.name || 'Non désigné';
      const ass2 = referees.find((r) => r.id === m.assistant2Id)?.name || 'Non désigné';
      const fourth = referees.find((r) => r.id === m.fourthId)?.name || 'Non désigné';

      const cleanDate = getFrenchDate(m.date);
      const cleanDay = getFrenchDay(m.date);

      const refString = `AC: ${central}\nA1: ${ass1} | A2: ${ass2}` + 
        (m.fourthId && m.fourthId !== 'none' ? `\n4e: ${fourth}` : '');

      tableRows.push([
        m.matchNumber || '-',
        `${cleanDate}\n(${cleanDay})`,
        m.startTime || '-',
        `${m.teamA}   vs   ${m.teamB}`,
        m.terrain || 'Non défini',
        refString,
        '' // Placeholder score/signatures
      ]);
    });
  });

  autoTable(doc, {
    startY: 54,
    margin: { left: 10, right: 10 },
    head: [['N° MATCH', 'DATE & JOUR', 'HEURE', 'RENCONTRES (DOMICILE VS EXTERIEUR)', 'TERRAIN', 'COPRO DE DÉSIGNATIONS ARBITRALES', 'SCORES']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 54, 93],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      valign: 'middle'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'center', cellWidth: 26 },
      2: { halign: 'center', cellWidth: 16 },
      3: { halign: 'center', cellWidth: 68, fontStyle: 'bold' },
      4: { halign: 'center', cellWidth: 32 },
      5: { halign: 'left', cellWidth: 100, fontSize: 8 },
      6: { halign: 'center', cellWidth: 20 }
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [247, 250, 252]
    },
    didDrawPage: (data) => {
      // Add standard FDF stamp and signatures
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(113, 128, 150);
      doc.text('Championnat National Officiel F.D.F - Calendrier Général.', 12, pageHeight - 12);
      doc.text('Homologué par la COC de la Fédération Djiboutienne de Football.', 12, pageHeight - 8);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(229, 62, 62);
      doc.text('Le Département des Compétitions', 242, pageHeight - 14, { align: 'center' });
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(26, 54, 93);
      doc.text('Délégation Générale - F.D.F', 242, pageHeight - 9, { align: 'center' });
    }
  });

  doc.save(`calendrier-general-${categoryName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

/**
 * CHRONOLOGICAL CHAMPIONSHIP TEXT GENERATOR: Groups by Journée for copying to WhatsApp/Telegram
 */
export const generateChampionshipTextMessage = (
  categoryName: string,
  designations: Designation[],
  categories: Category[],
  referees: Referee[]
) => {
  let msg = `🏆 *FEDERATION DJIBOUTIENNE DE FOOTBALL* 🏆\n`;
  msg += `📅 *CALENDRIER CHAMPIONNAT - ${categoryName.toUpperCase()}*\n`;
  msg += `----------------------------------------------------\n\n`;

  const journees = groupMatchesIntoJournees(designations);

  if (journees.length === 0) {
    msg += `Aucun match planifié actuellement pour ce championnat.\n`;
    return msg;
  }

  journees.forEach((j) => {
    msg += `🌟 *${j.name.toUpperCase()}* 🌟\n`;
    msg += `====================================================\n`;

    j.matches.forEach((m, idx) => {
      const cleanDate = getFrenchDate(m.date);
      const cleanDay = getFrenchDay(m.date);
      
      const central = referees.find((r) => r.id === m.centralId)?.name || 'Non désigné';
      const ass1 = referees.find((r) => r.id === m.assistant1Id)?.name || 'Non désigné';
      const ass2 = referees.find((r) => r.id === m.assistant2Id)?.name || 'Non désigné';

      msg += `⚽ *Match N°${m.matchNumber || (idx + 1)}*\n`;
      msg += `⚔️ *${m.teamA}*  vs  *${m.teamB}*\n`;
      msg += `📅 Date : *${cleanDay} ${cleanDate}*\n`;
      msg += `⏰ Horaire : *${m.startTime || '-'}* \n`;
      msg += `📍 Terrain : *${m.terrain || 'Non défini'}*\n`;
      msg += `🚩 AC: _${central}_ | A1: _${ass1}_ | A2: _${ass2}_\n`;
      msg += `----------------------------------------------------\n`;
    });
    msg += `\n`;
  });

  msg += `👉 Convocations et calendrier général certifiés par la Direction des Compétitions FDF.\n`;
  msg += `*Fédération Djiboutienne de Football*`;

  return msg;
};
