import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url).searchParams.get('url');
  if (!url) return new Response('Missing url', { status: 400 });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    
    return new Response(buffer, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
        // Omit CORS headers since it's same-origin anyway!
      }
    });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
}
