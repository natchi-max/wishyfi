/**
 * Ramanujan Magic Square Generator
 * Based on the classic Ramanujan birthday magic square formula
 * 
 * Input: Date in DD-MM-CC-YY format (e.g., 14/07/20/00 for July 14, 2000)
 * Output: 4x4 magic square where every row, column, and diagonal sum to the same value
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
 * Ramanujan Magic Square Formula (Exact Formula from Image)
 * 
 * Given a date in DD/MM/CCYY format:
 * 
 * ┌─────────────────────────────────┐
 * │  DD    MM    CC    YY          │  Row 1: The birth date
 * │ YY+1  CC-1  MM-3  DD+3         │  Row 2: Transformations
 * │ MM-2  DD+2  YY+2  CC-2         │  Row 3: More transformations
 * │ CC+1  YY-1  DD+1  MM-1         │  Row 4: Final transformations
 * └─────────────────────────────────┘
 * 
 * Properties:
 * - All rows sum to the magic constant
 * - All columns sum to the magic constant
 * - Both diagonals sum to the magic constant
 * - Each 2x2 quadrant sums to the magic constant
 * 
 * Note: If any cell becomes negative (e.g., YY-1 when YY=0),
 * we add an offset to ALL cells to keep them non-negative.
 * This preserves the magic property.
 */
export function generateDateEchoSquare(DD, MM, CC, YY) {
  // Base magic constant = sum of the date components
  const baseSum = DD + MM + CC + YY;

  // Generate the square using EXACT Ramanujan formula
  let square = [
    [DD, MM, CC, YY],  // Row 1: DD, MM, CC, YY
    [YY + 1, CC - 1, MM - 3, DD + 3],  // Row 2: YY+1, CC-1, MM-3, DD+3
    [MM - 2, DD + 2, YY + 2, CC - 2],  // Row 3: MM-2, DD+2, YY+2, CC-2
    [CC + 1, YY - 1, DD + 1, MM - 1]   // Row 4: CC+1, YY-1, DD+1, MM-1
  ];

  // Find the minimum value in the square
  let minVal = 0;
  for (let row of square) {
    for (let val of row) {
      if (val < minVal) minVal = val;
    }
  }

  // If there are negative values, add offset to make all non-negative
  // This preserves the magic property (all sums increase by 4 × offset)
  let offset = 0;
  if (minVal < 0) {
    offset = Math.abs(minVal); // Add enough to make minimum = 0
    square = square.map(row => row.map(val => val + offset));
  }

  // New magic constant = baseSum + 4 × offset
  // (since we add offset to each of 4 cells in any row/column/diagonal)
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
