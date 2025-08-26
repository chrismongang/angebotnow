// Test script to verify calculations
const testData = [
  {
    id: 'test1',
    positions: [
      { qty: 15, price: 20, title: 'Fliesen entfernen' },
      { qty: 15, price: 45, title: 'Neue Fliesen' },
      { qty: 2, price: 30, title: 'Fugmaterial' },
      { qty: 10, price: 50, title: 'Arbeitsstunden' },
      { qty: 1, price: 250, title: 'Toilette' },
      { qty: 1, price: 200, title: 'Waschbecken' },
      { qty: 5, price: 60, title: 'Sanitär' }
    ]
  }
];

function calculateTotal(positions) {
  return positions.reduce((sum, pos) => sum + (pos.qty * pos.price), 0);
}

function calculateTotalWithVAT(total, vatRate = 0.19) {
  return total * (1 + vatRate);
}

testData.forEach((data, index) => {
  const subtotal = calculateTotal(data.positions);
  const total = calculateTotalWithVAT(subtotal);
  
  console.log(`Test ${index + 1}:`);
  console.log(`Subtotal: ${subtotal.toFixed(2)} EUR`);
  console.log(`VAT (19%): ${(subtotal * 0.19).toFixed(2)} EUR`);
  console.log(`Total: ${total.toFixed(2)} EUR`);
  console.log('---');
});
