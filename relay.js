async function getFileInfo({ owner, repo, path }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
  if (!res.ok) throw new Error('Cannot fetch file info');
  return res.json(); // contains sha
}

async function updateAnnouncement(config, token, text) {
  const { owner, repo, path, branch } = config;

  // Get current file info to obtain latest SHA
  const info = await getFileInfo(config);
  const sha = info.sha;

  const payload = {
    message: `Update announcement: ${new Date().toISOString()}`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify({ latest: text })))),
    sha,
    branch
  };

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error (${res.status})`);
  }
  return res.json();
}
