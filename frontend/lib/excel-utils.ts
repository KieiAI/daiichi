import { RiskAssessment } from '@/types/risk-assessment';

// Excelファイルからデータをインポート
export function importFromExcel(file: File): Promise<RiskAssessment[]> {
  return new Promise(async (resolve, reject) => {
    try {
      // Dynamic import to avoid SSR issues
      const XLSX = await import('xlsx');
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // ワークシートをJSONに変換
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length < 2) {
            throw new Error('データが不足しています');
          }

          // ヘッダー行を取得
          const headers = jsonData[0];
          
          // データ行を処理
          const riskAssessments: RiskAssessment[] = [];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length === 0 || !row[0]) continue; // 空行をスキップ
            
            const assessment: RiskAssessment = {
              id: row[0] || riskAssessments.length + 1,
              work: row[1] || '',
              workElement: row[2] || '',
              knowledgeFile: row[3] || '',
              reference: row[4] || '',
              hazard: row[5] || '',
              riskReduction: row[6] || '',
              measureType: row[7] || '管理的対策',
              severity: Number(row[8]) || 1,
              probability: Number(row[9]) || 1,
              exposure: Number(row[10]) || 1,
              riskScore: Number(row[11]) || 3,
              riskLevel: row[12] || 'I',
              severityAfter: Number(row[13]) || 1,
              probabilityAfter: Number(row[14]) || 1,
              exposureAfter: Number(row[15]) || 1,
              riskScoreAfter: Number(row[16]) || 3,
              riskLevelAfter: row[17] || 'I',
              createdAt: row[18] || new Date().toISOString().split('T')[0],
              updatedAt: row[19] || new Date().toISOString().split('T')[0],
            };
            
            riskAssessments.push(assessment);
          }
          
          resolve(riskAssessments);
        } catch (error) {
          reject(new Error(`Excelファイルの読み込みに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('ファイルの読み込みに失敗しました'));
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      reject(new Error(`XLSXライブラリの読み込みに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}

// データをExcelファイルにエクスポート
export async function exportToExcel(data: RiskAssessment[], filename: string = 'risk-assessment.xlsx') {
  try {
    // Dynamic import to avoid SSR issues
    const XLSX = await import('xlsx');
    
    // ヘッダー行を定義
    const headers = [
      'ID',
      '作業',
      '作業要素',
      '使用ナレッジファイル名',
      '参照',
      '危険性・有害性',
      'リスク低減措置',
      '対策分類',
      '重篤度',
      '発生確率',
      '暴露頻度',
      'リスク点数',
      'リスクレベル',
      '低減後重篤度',
      '低減後発生確率',
      '低減後暴露頻度',
      '低減後リスク点数',
      '低減後リスクレベル',
      '作成日',
      '更新日'
    ];

    // データを2次元配列に変換
    const worksheetData = [
      headers,
      ...data.map(item => [
        item.id,
        item.work,
        item.workElement,
        item.knowledgeFile,
        item.reference,
        item.hazard,
        item.riskReduction,
        item.measureType,
        item.severity,
        item.probability,
        item.exposure,
        item.riskScore,
        item.riskLevel,
        item.severityAfter,
        item.probabilityAfter,
        item.exposureAfter,
        item.riskScoreAfter,
        item.riskLevelAfter,
        item.createdAt,
        item.updatedAt
      ])
    ];

    // ワークシートを作成
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // 列幅を自動調整
    const colWidths = headers.map((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...data.map(item => {
          const value = worksheetData[data.indexOf(item) + 1][index];
          return String(value || '').length;
        })
      );
      return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
    });
    
    worksheet['!cols'] = colWidths;

    // ヘッダー行のスタイルを設定
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4F46E5' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }

    // ワークブックを作成
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'リスクアセスメント');

    // ファイルをダウンロード
    XLSX.writeFile(workbook, filename);
    
    return true;
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error(`Excelファイルのエクスポートに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// CSVファイルからデータをインポート
export function importFromCSV(file: File): Promise<RiskAssessment[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('データが不足しています');
        }

        // ヘッダー行をスキップしてデータを処理
        const riskAssessments: RiskAssessment[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(val => val.trim().replace(/^"|"$/g, ''));
          if (values.length === 0 || !values[0]) continue;
          
          const assessment: RiskAssessment = {
            id: Number(values[0]) || riskAssessments.length + 1,
            work: values[1] || '',
            workElement: values[2] || '',
            knowledgeFile: values[3] || '',
            reference: values[4] || '',
            hazard: values[5] || '',
            riskReduction: values[6] || '',
            measureType: values[7] || '管理的対策',
            severity: Number(values[8]) || 1,
            probability: Number(values[9]) || 1,
            exposure: Number(values[10]) || 1,
            riskScore: Number(values[11]) || 3,
            riskLevel: values[12] || 'I',
            severityAfter: Number(values[13]) || 1,
            probabilityAfter: Number(values[14]) || 1,
            exposureAfter: Number(values[15]) || 1,
            riskScoreAfter: Number(values[16]) || 3,
            riskLevelAfter: values[17] || 'I',
            createdAt: values[18] || new Date().toISOString().split('T')[0],
            updatedAt: values[19] || new Date().toISOString().split('T')[0],
          };
          
          riskAssessments.push(assessment);
        }
        
        resolve(riskAssessments);
      } catch (error) {
        reject(new Error(`CSVファイルの読み込みに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
}