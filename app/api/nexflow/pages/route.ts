import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// NexFlow KB · pages query
// Filterable page index. Supports ?repo=<repo>, ?withApis=true, ?search=<str>.
// Same data source as /api/nexflow/manifest, returned in a flatter shape.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const manifestPath = path.join(process.cwd(), 'nexflow.manifest.json');
    if (!fs.existsSync(manifestPath)) {
      return NextResponse.json({ pages: [], note: 'manifest not yet generated' }, { status: 503 });
    }
    const raw = fs.readFileSync(manifestPath, 'utf-8');
    const data = JSON.parse(raw);
    let pages = Array.isArray(data.pages) ? data.pages : [];

    const repo = searchParams.get('repo');
    if (repo) pages = pages.filter((p: any) => p.repo === repo);

    if (searchParams.get('withApis') === 'true') {
      pages = pages.filter((p: any) => Array.isArray(p.apis) && p.apis.length > 0);
    }

    const search = searchParams.get('search');
    if (search) {
      const q = search.toLowerCase();
      pages = pages.filter((p: any) =>
        (p.route || '').toLowerCase().includes(q) ||
        (p.title || '').toLowerCase().includes(q) ||
        (p.file || '').toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      count: pages.length,
      generatedAt: data.generatedAt,
      pages,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'failed to query pages' }, { status: 500 });
  }
}
