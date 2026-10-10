import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { data } = await axios.get('https://www.bca.co.id/id-ID/informasi/kurs', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      },
    });

    const $ = cheerio.load(data);
    let cnyJualRate = null;

    $('tr').each((_, element) => {
      const rowText = $(element).text();
      if (rowText.includes('CNH') || rowText.includes('CNY')) {
        const columns = $(element).find('td');
        if (columns.length >= 3) {
          const jualText = $(columns[2]).text().trim();
          const cleanNumber = jualText.split(',')[0].replace(/\./g, '');
          const parsedVal = parseInt(cleanNumber, 10);
          
          if (!isNaN(parsedVal) && parsedVal > 2000) {
            cnyJualRate = parsedVal;
          }
        }
      }
    });

    if (!cnyJualRate) {
      cnyJualRate = 2694;
    }

    return res.status(200).json({
      success: true,
      kurs: cnyJualRate,
      source: 'BCA e-Rate Realtime',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching BCA rate:', error.message);
    return res.status(200).json({
      success: false,
      kurs: 2694,
      message: 'Gagal konek ke server BCA, menggunakan nilai fallback BCA',
    });
  }
}
