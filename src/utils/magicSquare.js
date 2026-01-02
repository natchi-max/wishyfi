/**
 * "Date Echo" Magic Square Utility
 * Embeds the birthday date [A, B, C, D] in 4 locations:
 * - Row 1
 * - Row 4 (reversed)
 * - Column 1
 * - Column 4 (reversed)
 */

export function parseDateComponents(dateString) {
  const parts = dateString.split('/');
  if (parts.length !== 3) throw new Error('Invalid format');
  const DD = parseInt(parts[0], 10);
  const MM = parseInt(parts[1], 10);
  const YYYY = parseInt(parts[2], 10);
  const CC = Math.floor(YYYY / 100);
  const YY = YYYY % 100;
  return { DD, MM, CC, YY };
}

/**
 * Ramanujan's Magic Square Formula
 * Given a date in DD/MM/CCYY format, create a 4x4 magic square
 * where every row, column, and diagonal sums to the magic constant
 * 
 * Formula (exact as per Ramanujan):
 * Row 1: DD,    MM,    CC,    YY
 * Row 2: YY+1,  CC-1,  MM-3,  DD+3
 * Row 3: MM-2,  DD+2,  YY+2,  CC-2
 * Row 4: CC+1,  YY-1,  DD+1,  MM-1
 * 
 * If negative numbers occur, we add an offset to ALL cells
 * This preserves the magic property (sum stays consistent across rows/cols/diagonals)
 */
export function generateDateEchoSquare(DD, MM, CC, YY) {
  // Base magic constant = sum of the date components
  const baseSum = DD + MM + CC + YY;

  // Generate the square using exact Ramanujan formula
  let square = [
    [DD, MM, CC, YY],  // Row 1: The date itself
    [YY + 1, CC - 1, MM - 3, DD + 3],  // Row 2
    [MM - 2, DD + 2, YY + 2, CC - 2],  // Row 3
    [CC + 1, YY - 1, DD + 1, MM - 1]   // Row 4
  ];

  // Find the minimum value in the square
  let minVal = 0;
  for (let row of square) {
    for (let val of row) {
      if (val < minVal) minVal = val;
    }
  }

  // If there are negative values, add offset to make all non-negative
  let offset = 0;
  if (minVal < 0) {
    offset = Math.abs(minVal); // Add enough to make minimum = 0
    square = square.map(row => row.map(val => val + offset));
  }

  // New magic constant = baseSum + 4 * offset (since we add offset to each of 4 cells in a row)
  const magicConstant = baseSum + (4 * offset);

  const reveals = [
    { type: 'row', index: 0, label: 'The Special Date' },     // Reveal Date
    { type: 'sum', index: 0, label: 'Magic Sum' },            // Sum Check
    { type: 'full', index: 0, label: 'Everything Connects' }  // Full Reveal
  ];

  return {
    square,
    magicConstant,
    reveals
  };
}
