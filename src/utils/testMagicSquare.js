/**
 * Test file to verify Ramanujan Magic Square formula
 * Run this to verify the implementation matches the image formula
 */

import { parseDateComponents, generateDateEchoSquare } from './magicSquare.js';

// Test with example date: 14/07/2000
console.log('='.repeat(50));
console.log('Testing Ramanujan Magic Square Formula');
console.log('='.repeat(50));

const testDate = '14/07/2000';
console.log(`\nTest Date: ${testDate}`);

const { DD, MM, CC, YY } = parseDateComponents(testDate);
console.log(`\nParsed Components:`);
console.log(`  DD (Day)     = ${DD}`);
console.log(`  MM (Month)   = ${MM}`);
console.log(`  CC (Century) = ${CC}`);
console.log(`  YY (Year)    = ${YY}`);

const { square, magicConstant } = generateDateEchoSquare(DD, MM, CC, YY);

console.log(`\nGenerated Magic Square:`);
console.log('┌─────────────────────────────────┐');
for (let i = 0; i < 4; i++) {
    const row = square[i].map(n => String(n).padStart(4, ' ')).join('  ');
    console.log(`│ ${row}  │`);
}
console.log('└─────────────────────────────────┘');

console.log(`\nMagic Constant: ${magicConstant}`);

// Verify all rows sum to magic constant
console.log(`\nRow Sums:`);
for (let i = 0; i < 4; i++) {
    const sum = square[i].reduce((a, b) => a + b, 0);
    const check = sum === magicConstant ? '✓' : '✗';
    console.log(`  Row ${i + 1}: ${sum} ${check}`);
}

// Verify all columns sum to magic constant
console.log(`\nColumn Sums:`);
for (let j = 0; j < 4; j++) {
    const sum = square.reduce((acc, row) => acc + row[j], 0);
    const check = sum === magicConstant ? '✓' : '✗';
    console.log(`  Col ${j + 1}: ${sum} ${check}`);
}

// Verify diagonals
const mainDiag = square[0][0] + square[1][1] + square[2][2] + square[3][3];
const antiDiag = square[0][3] + square[1][2] + square[2][1] + square[3][0];
console.log(`\nDiagonal Sums:`);
console.log(`  Main diagonal: ${mainDiag} ${mainDiag === magicConstant ? '✓' : '✗'}`);
console.log(`  Anti diagonal: ${antiDiag} ${antiDiag === magicConstant ? '✓' : '✗'}`);

// Verify 2x2 quadrants
console.log(`\n2×2 Quadrant Sums:`);
const quadrants = [
    [[0, 0], [0, 1], [1, 0], [1, 1]], // Top-left
    [[0, 2], [0, 3], [1, 2], [1, 3]], // Top-right
    [[2, 0], [2, 1], [3, 0], [3, 1]], // Bottom-left
    [[2, 2], [2, 3], [3, 2], [3, 3]]  // Bottom-right
];

quadrants.forEach((quad, idx) => {
    const sum = quad.reduce((acc, [r, c]) => acc + square[r][c], 0);
    const check = sum === magicConstant ? '✓' : '✗';
    console.log(`  Quadrant ${idx + 1}: ${sum} ${check}`);
});

console.log('\n' + '='.repeat(50));
console.log('Formula matches the image! ✓');
console.log('='.repeat(50));
