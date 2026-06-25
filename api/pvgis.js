// /api/pvgis.js - Vercel Serverless Function (Proxy para PVGIS)
export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { lat, lon, peakpower, loss, angle, aspect } = req.query;

  if (!lat || !lon || !peakpower) {
    return res.status(400).json({ error: 'Parâmetros lat, lon e peakpower são obrigatórios' });
  }

  // Monta a URL do PVGIS v5.3
  const pvgisUrl = new URL('https://re.jrc.ec.europa.eu/api/v5_3/PVcalc');
  pvgisUrl.searchParams.set('lat', lat);
  pvgisUrl.searchParams.set('lon', lon);
  pvgisUrl.searchParams.set('peakpower', peakpower);
  pvgisUrl.searchParams.set('loss', loss || 14);
  pvgisUrl.searchParams.set('angle', angle || 20);
  pvgisUrl.searchParams.set('aspect', aspect || 0);
  pvgisUrl.searchParams.set('raddatabase', 'PVGIS-NSRDB');
  pvgisUrl.searchParams.set('outputformat', 'json');

  try {
    const response = await fetch(pvgisUrl.toString());
    
    if (!response.ok) {
      throw new Error(`PVGIS retornou status ${response.status}`);
    }
    
    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Erro ao chamar PVGIS:', error);
    res.status(500).json({ 
      error: 'Erro ao consultar dados solares', 
      details: error.message 
    });
  }
}