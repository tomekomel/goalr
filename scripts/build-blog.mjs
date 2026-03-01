import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

// --- Read all markdown posts ---
const contentDir = path.join(ROOT, 'content', 'blog');
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));

const posts = files.map(file => {
  const raw = fs.readFileSync(path.join(contentDir, file), 'utf-8');
  const { data, content } = matter(raw);
  return {
    ...data,
    html: md.render(content),
  };
}).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

console.log(`[blog] Found ${posts.length} posts`);

// --- Helpers ---
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function renderPostCard(post) {
  return `
        <a href="/blog/${post.slug}/" class="landing-animate blog-card group rounded-2xl p-6 block transition-all" style="background:#141513;border:1px solid rgba(255,255,255,0.08)">
          <span class="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold mb-4 block" style="color:#22c55e;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.14)">${post.category}</span>
          <h3 class="text-base font-bold mb-2 leading-snug" style="color:#ece9e0">${post.title}</h3>
          <p class="text-sm leading-relaxed mb-4 line-clamp-2" style="color:#585552">${post.excerpt}</p>
          <div class="flex items-center gap-2 text-xs" style="color:#585552">
            <span>${formatDate(post.date)}</span>
            <span>&middot;</span>
            <span>${post.readTime} min read</span>
          </div>
        </a>`;
}

// --- Read templates ---
const listingTemplate = fs.readFileSync(path.join(ROOT, 'src', 'blog', 'template-listing.html'), 'utf-8');
const postTemplate = fs.readFileSync(path.join(ROOT, 'src', 'blog', 'template-post.html'), 'utf-8');

// --- Generate blog/index.html ---
const postsGrid = posts.map(renderPostCard).join('\n');
const listingHtml = listingTemplate.replace('{{POSTS_GRID}}', postsGrid);

const blogDir = path.join(ROOT, 'blog');
fs.mkdirSync(blogDir, { recursive: true });
fs.writeFileSync(path.join(blogDir, 'index.html'), listingHtml);
console.log(`[blog] Generated blog/index.html`);

// --- Generate blog/[slug]/index.html ---
posts.forEach((post, index) => {
  // Related posts: all others except current
  const relatedPosts = posts.filter((_, i) => i !== index).slice(0, 3);
  const relatedHtml = relatedPosts.map(renderPostCard).join('\n');

  let html = postTemplate
    .replaceAll('{{TITLE}}', post.title)
    .replaceAll('{{SLUG}}', post.slug)
    .replaceAll('{{EXCERPT}}', post.excerpt)
    .replaceAll('{{DATE}}', post.date)
    .replaceAll('{{DATE_FORMATTED}}', formatDate(post.date))
    .replaceAll('{{CATEGORY}}', post.category)
    .replaceAll('{{READ_TIME}}', String(post.readTime))
    .replace('{{CONTENT}}', post.html)
    .replace('{{RELATED_POSTS}}', relatedHtml);

  const postDir = path.join(blogDir, post.slug);
  fs.mkdirSync(postDir, { recursive: true });
  fs.writeFileSync(path.join(postDir, 'index.html'), html);
  console.log(`[blog] Generated blog/${post.slug}/index.html`);
});

// --- Update landing page blog preview ---
const indexPath = path.join(ROOT, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf-8');

const START_MARKER = '<!-- BLOG_PREVIEW_START -->';
const END_MARKER = '<!-- BLOG_PREVIEW_END -->';

const previewPosts = posts.slice(0, 3);
const previewCards = previewPosts.map(renderPostCard).join('\n');

const blogPreviewSection = `<!-- BLOG_PREVIEW_START -->
  <!-- ========== BLOG PREVIEW ========== -->
  <section class="py-20 md:py-28" style="background:#0e0f0d">
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex items-end justify-between mb-10 gap-6">
        <div>
          <p class="reveal text-xs font-bold uppercase tracking-widest mb-2" style="color:#22c55e" data-i18n="blog.label">The Playbook</p>
          <h2 class="reveal text-2xl md:text-3xl font-black tracking-tight" style="font-family:'Fraunces',Georgia,serif;color:#ece9e0" data-i18n="blog.sectionTitle">From the goal-setting playbook</h2>
        </div>
        <a href="/blog/" class="reveal shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors" style="color:#22c55e" data-i18n="blog.allPosts">Read all posts</a>
      </div>
      <div class="grid md:grid-cols-3 gap-5">
${previewCards}
      </div>
    </div>
  </section>
  <!-- BLOG_PREVIEW_END -->`;

let updatedIndex;
if (indexHtml.includes(START_MARKER)) {
  // Replace existing preview
  const startIdx = indexHtml.indexOf(START_MARKER);
  const endIdx = indexHtml.indexOf(END_MARKER) + END_MARKER.length;
  updatedIndex = indexHtml.slice(0, startIdx) + blogPreviewSection + indexHtml.slice(endIdx);
} else {
  // Insert before FINAL CTA section
  const ctaMarker = '<!-- ========== FINAL CTA ========== -->';
  const ctaIdx = indexHtml.indexOf(ctaMarker);
  if (ctaIdx === -1) {
    console.error('[blog] Could not find FINAL CTA marker in index.html');
    process.exit(1);
  }
  updatedIndex = indexHtml.slice(0, ctaIdx) + blogPreviewSection + '\n\n  ' + indexHtml.slice(ctaIdx);
}

fs.writeFileSync(indexPath, updatedIndex);
console.log(`[blog] Updated index.html with blog preview`);

console.log('[blog] Done!');
