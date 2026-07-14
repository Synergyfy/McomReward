import papaparse from 'papaparse';

export function exportToCsv(data: Record<string, string | number | boolean>[], filename: string) {
  const csv = papaparse.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.href) {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
