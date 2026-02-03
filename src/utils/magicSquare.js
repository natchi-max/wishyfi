/**
 * Ramanujan Magic Square Generator - Based on the exact formula from the image
 * 
 * Input: Date in DD/MM/YYYY format (e.g., 22/12/1887)
 * Output: 4x4 magic square where first row is [DD, MM, CC, YY]
 * 
 * Formula from the image:
 * Row 1: [DD,    MM,    CC,    YY   ]
 * Row 2: [YY+1,  CC-1,  MM-3,  DD+3 ]
 * Row 3: [MM-2,  DD+2,  YY+2,  CC-2 ]
 * Row 4: [CC+1,  YY-1,  DD+1,  MM-1 ]
 */

export function parseDateComponents(dateString) {
  const parts = dateString.split('/');
  if (parts.length !== 3) throw new Error('Invalid format');
  const DD = parseInt(parts[0], 10);
  const MM = parseInt(parts[1], 10);
  const YYYY = parseInt(parts[2], 10);
  const CC = Math.floor(YYYY / 100); // Century (first 2 digits)
  const YY = YYYY % 100;             // Year (last 2 digits)
  return { DD, MM, CC, YY };
}

/**
 * Generate Ramanujan Magic Square using the EXACT formula from the image
 */
export function generateDateEchoSquare(DD, MM, CC, YY) {
  // Base magic constant = sum of the first row
  const baseSum = DD + MM + CC + YY;

  // Generate the square using EXACT Ramanujan formula from image
  let square = [
    [DD,     MM,     CC,     YY    ],  // Row 1: DD, MM, CC, YY
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
    offset = Math.abs(minVal);
    square = square.map(row => row.map(val => val + offset));
  }

  // New magic constant = baseSum + 4 × offset
  const magicConstant = baseSum + (4 * offset);

  const reveals = [
    { type: 'row', index: 0, label: 'The Special Date' },
    { type: 'sum', index: 0, label: 'Magic Sum' },
    { type: 'full', index: 0, label: 'Everything Connects' }
  ];

  return {
    square,
    magicConstant,
    reveals
  };
}