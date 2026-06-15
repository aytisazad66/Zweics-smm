const KV_HEADERS = {
  'X-Requested-With': 'XMLHttpRequest',
};

export async function kvGet(key: string): Promise<any> {
  const res = await fetch(`/api/kv/${key}`, { headers: KV_HEADERS });
  if (!res.ok) return { value: null };
  return res.json();
}

export async function kvPost(key: string, body: object): Promise<void> {
  await fetch(`/api/kv/${key}`, {
    method: 'POST',
    headers: { ...KV_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {});
}
