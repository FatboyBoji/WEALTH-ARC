import { format } from 'date-fns';

export interface TransactionForExport {
  date: string;
  type: 'income' | 'expense';
  name: string;
  amount: number;
  category?: string;
}

/**
 * Generate a CSV string from transaction data
 */
export function generateTransactionCSV(transactions: TransactionForExport[], month: string): string {
  // CSV Header
  let csvContent = `Your transactions summary for ${month}:\n`;
  csvContent += 'Date;Type;Name;Amount;Category\n';
  
  // Add rows
  transactions.forEach(transaction => {
    // Format the date
    const formattedDate = format(new Date(transaction.date), 'yyyy-MM-dd');
    
    // Format the row and add it to CSV content
    const row = [
      formattedDate,
      transaction.type,
      transaction.name,
      transaction.amount.toFixed(2),
      transaction.category || ''
    ].join(';');
    
    csvContent += row + '\n';
  });
  
  return csvContent;
}

/**
 * Download content as a file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Create a blob from the CSV string
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Set up the download link
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Add link to document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export transactions for a specific month as CSV
 */
export function exportTransactionsToCSV(
  transactions: TransactionForExport[], 
  month: string, 
  year: number
): void {
  // Generate the CSV content
  const csvContent = generateTransactionCSV(transactions, month);
  
  // Create a filename with the month and year
  const filename = `transactions_${month.toLowerCase()}_${year}.csv`;
  
  // Download the file
  downloadCSV(csvContent, filename);
} 