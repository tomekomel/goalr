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
        <a href="/blog/${post.slug}/" class="landing-animate step-card group rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 p-6 transition-all block">
          <div class="flex items-center gap-2 mb-3">
            <span class="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">${post.category}</span>
          </div>
          <h3 class="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">${post.title}</h3>
          <p class="text-sm text-slate-400 line-clamp-2 mb-4">${post.excerpt}</p>
          <div class="flex items-center gap-2 text-xs text-slate-500">
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
  <section class="py-24 md:py-32">
    <div class="max-w-5xl mx-auto px-6">
      <h2 class="landing-animate text-3xl md:text-4xl font-extrabold text-white text-center tracking-tight mb-4" data-i18n="blog.sectionTitle">
        The Goal-Setting Playbook
      </h2>
      <p class="landing-animate text-slate-400 text-center text-lg mb-16 max-w-2xl mx-auto" data-i18n="blog.sectionSubtitle">
        Actionable insights to help you plan smarter and achieve more.
      </p>

      <div class="grid md:grid-cols-3 gap-6">
${previewCards}
      </div>

      <div class="landing-animate text-center mt-10">
        <a href="/blog/" class="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
          <span data-i18n="blog.allPosts">View all posts</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
        </a>
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
