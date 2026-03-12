import PocketBase from 'pocketbase';

export async function GET() {
  const PB_URL = import.meta.env.PB_URL;
  const pb = new PocketBase(PB_URL);

  try {
    // const email = import.meta.env.PB_EMAIL;
    // const password = import.meta.env.PB_PASSWORD;

    // if (email && password) {
    //   await pb.admins.authWithPassword(email, password);
    // }

    const records = await pb.collection('cameras').getFullList({
      sort: '-created',
    });

    const geojson = {
      type: 'FeatureCollection',
      features: records.map(cam => ({
        type: 'Feature',
        properties: {
          id: cam.id,
          name: cam.name,
          url: cam.url,
          provider: cam.provider
        },
        geometry: {
          type: 'Point',
          coordinates: [cam.lng, cam.lat]
        }
      }))
    };

    return new Response(JSON.stringify(geojson), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });
  } catch (error) {
    console.error('PocketBase Error:', error);
    const isAuthError = error instanceof Error && error.message.includes('403');
    
    return new Response(JSON.stringify({ 
      error: 'Error al conectar con PocketBase',
      details: error instanceof Error ? error.message : String(error),
      suggestion: isAuthError ? 'permisos error' : undefined
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}