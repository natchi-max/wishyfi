/**
 * Enhanced Magic Square Generator
 * 
 * Uses a robust diagonal magic square construction where the first row is the date.
 * This version is safer for all dates (even early months) as it only uses +/-1 offsets.
 * 
 * Formula:
 * Row 1: [a,    b,    c,    d   ] (Date: DD, MM, CC, YY)
 * Row 2: [d+1,  c-1,  b-1,  a+1 ]
 * Row 3: [b-1,  a+1,  d+1,  c-1 ]
 * Row 4: [c,    d,    a,    b   ]
 */

export function parseDateComponents(dateString) {
  const parts = dateString.split('/');
  if (parts.length !== 3) throw new Error('Invalid format');
  const DD = parseInt(parts[0], 10);
  const MM = parseInt(parts[1], 10);
  const YYYY = parseInt(parts[2], 10);
  const CC = Math.floor(YYYY / 100); // Century
  const YY = YYYY % 100;             // Year
  return { DD, MM, CC, YY };
}

export function generateDateEchoSquare(DD, MM, CC, YY) {
  const magicConstant = DD + MM + CC + YY;

  // Use the robust +/-1 formula to keep Row 1 matching the date exactly
  const square = [
    [DD, MM, CC, YY],
    [YY + 1, CC - 1, MM - 1, DD + 1],
    [MM - 1, DD + 1, YY + 1, CC - 1],
    [CC, YY, DD, MM]
  ];

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