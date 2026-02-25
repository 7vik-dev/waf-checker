function normalizeTargetHost(targetUrl: string): string {
	const cleaned = targetUrl.replace(/\{PAYLOAD\}/g, '').trim();
	const withProtocol = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
	return new URL(withProtocol).hostname.toLowerCase();
}

async function fetchSubdomainsFromCrtSh(targetHost: string): Promise<string[]> {
	const endpoint = `https://crt.sh/?q=%25.${encodeURIComponent(targetHost)}&output=json`;
	const response = await fetch(endpoint, {
		headers: { accept: 'application/json' },
	});

	if (!response.ok) return [];

	const text = await response.text();
	if (!text.trim()) return [];

	let records: any[] = [];
	try {
		records = JSON.parse(text);
	} catch {
		return [];
	}

	const unique = new Set<string>();
	for (const record of records) {
		const names = String(record?.name_value || '')
			.split('\n')
			.map((v) => v.trim().toLowerCase())
			.filter(Boolean);

		for (let domain of names) {
			if (domain.startsWith('*.')) domain = domain.slice(2);
			if (domain === targetHost) continue;
			if (domain.endsWith(`.${targetHost}`)) unique.add(domain);
		}
	}

	return Array.from(unique).sort((a, b) => a.localeCompare(b));
}

export async function handleSubdomainLookup(request: Request): Promise<Response> {
	const urlObj = new URL(request.url);
	const rawUrl = urlObj.searchParams.get('url');

	if (!rawUrl) {
		return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
			status: 400,
			headers: { 'content-type': 'application/json; charset=UTF-8' },
		});
	}

	try {
		const targetHost = normalizeTargetHost(rawUrl);
		const subdomains = await fetchSubdomainsFromCrtSh(targetHost);

		return new Response(
			JSON.stringify({
				targetHost,
				count: subdomains.length,
				subdomains,
				source: 'crt.sh',
				timestamp: new Date().toISOString(),
			}),
			{
				headers: { 'content-type': 'application/json; charset=UTF-8' },
			},
		);
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: 'Subdomain lookup failed',
				message: error instanceof Error ? error.message : 'Unknown error',
				subdomains: [],
			}),
			{
				status: 500,
				headers: { 'content-type': 'application/json; charset=UTF-8' },
			},
		);
	}
}
