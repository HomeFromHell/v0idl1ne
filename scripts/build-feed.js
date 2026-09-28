// Regenerates feed.xml and sitemap.xml from posts.js.
// Run after adding or editing entries:  node scripts/build-feed.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SITE = 'https://v0idl1ne.com';

const src = fs.readFileSync(path.join(root, 'posts.js'), 'utf8');
const posts = new Function(src + '\nreturn posts;')();

const slugify = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toDate = d => new Date(d.replace(/\./g, '-') + 'T12:00:00Z');

const sorted = [...posts].sort((a, b) => toDate(b.date) - toDate(a.date));
const latest = sorted.length ? toDate(sorted[0].date) : new Date();

const items = sorted.map(p => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/entries#${slugify(p.title)}</link>
      <guid isPermaLink="false">v0idl1ne-entry-${p.id}</guid>
      <category>${esc(p.cat)}</category>
      <pubDate>${toDate(p.date).toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>
      <content:encoded><![CDATA[${p.body.replace(/]]>/g, ']]]]><![CDATA[>')}]]></content:encoded>
    </item>`).join('\n');

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>V0IDL1NE — Public Record</title>
    <link>${SITE}/</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Knowledge they forgot to give you. No credentials. No paywalls. Just correct.</description>
    <language>en-us</language>
    <lastBuildDate>${latest.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

const lastmod = latest.toISOString().slice(0, 10);
const pages = ['/', '/entries', '/guides'];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url><loc>${SITE}${p}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(root, 'feed.xml'), feed);
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);
console.log(`feed.xml: ${posts.length} entries; sitemap.xml: ${pages.length} pages`);
