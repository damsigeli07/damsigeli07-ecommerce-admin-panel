const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:5000';

async function main() {
  const results = [];
  results.push(await checkJson(`${baseUrl}/health`));
  results.push(await checkStatus(`${baseUrl}/admin`, 302));

  const login = await postJson(`${baseUrl}/api/login`, {
    email: 'admin@example.com',
    password: 'admin123',
  });
  results.push({ url: `${baseUrl}/api/login`, ok: login?.success === true });

  const token = login?.data?.token;
  if (token) {
    const me = await fetch(`${baseUrl}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json());
    results.push({ url: `${baseUrl}/api/me`, ok: me?.success === true });
  } else {
    results.push({ url: `${baseUrl}/api/me`, ok: false });
  }

  const failed = results.filter((r) => !r.ok);
  for (const r of results) console.log(`${r.ok ? 'OK' : 'FAIL'} ${r.url}`);
  if (failed.length) process.exit(1);
}

async function checkJson(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return { url, ok: res.ok && typeof data === 'object' };
  } catch {
    return { url, ok: false };
  }
}

async function checkStatus(url, expected) {
  try {
    const res = await fetch(url, { redirect: 'manual' });
    return { url, ok: res.status === expected };
  } catch {
    return { url, ok: false };
  }
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return await res.json();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

