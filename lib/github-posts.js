const OWNER = 'serdal-aydogmus';
const REPO = 'nextjs-blog-theme';
const BRANCH = 'main';
const BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents/posts`;

function headers() {
  return {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.v3+json',
  };
}

export async function ghGetFile(slug) {
  const resp = await fetch(`${BASE}/${slug}.mdx?ref=${BRANCH}`, { headers: headers() });
  if (!resp.ok) return null;
  return resp.json();
}

export async function ghListFiles() {
  const resp = await fetch(`${BASE}?ref=${BRANCH}`, { headers: headers() });
  if (!resp.ok) return [];
  return resp.json();
}

export async function ghCreateFile(slug, content) {
  const resp = await fetch(`${BASE}/${slug}.mdx`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({
      message: `Add post: ${slug}`,
      content: Buffer.from(content).toString('base64'),
      branch: BRANCH,
    }),
  });
  return resp;
}

export async function ghUpdateFile(slug, content, sha) {
  const resp = await fetch(`${BASE}/${slug}.mdx`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({
      message: `Update post: ${slug}`,
      content: Buffer.from(content).toString('base64'),
      sha,
      branch: BRANCH,
    }),
  });
  return resp;
}

export async function ghDeleteFile(slug, sha) {
  const resp = await fetch(`${BASE}/${slug}.mdx`, {
    method: 'DELETE',
    headers: headers(),
    body: JSON.stringify({
      message: `Delete post: ${slug}`,
      sha,
      branch: BRANCH,
    }),
  });
  return resp;
}
