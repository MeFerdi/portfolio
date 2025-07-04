// Health check endpoint for deployment monitoring
export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
