/* global console, fetch, process, setTimeout, URL */

const baseUrl = new URL(process.argv[2] ?? 'https://idanbot.me/');
const attempts = Number(process.env.SMOKE_ATTEMPTS ?? 10);
const retryDelayMs = Number(process.env.SMOKE_RETRY_DELAY_MS ?? 5000);

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function extractAttribute(html, tagPattern, attribute) {
  const tag = html.match(tagPattern)?.[0];
  return tag?.match(new RegExp(`${attribute}=["']([^"']+)["']`, 'i'))?.[1];
}

async function checkDeployment() {
  const pageResponse = await fetch(baseUrl, {
    headers: { Accept: 'text/html', 'Cache-Control': 'no-cache' },
    redirect: 'follow',
  });
  if (!pageResponse.ok) throw new Error(`page returned HTTP ${pageResponse.status}`);
  const pageType = pageResponse.headers.get('content-type') ?? '';
  if (!pageType.includes('text/html')) throw new Error(`page returned ${pageType || 'no Content-Type'}`);

  const html = await pageResponse.text();
  if (html.includes('/src/main.tsx')) throw new Error('deployed HTML still references /src/main.tsx');
  if (!/<div id=["']root["']>\s*<[^/]/i.test(html)) throw new Error('deployed root is not prerendered');

  const scriptSource = extractAttribute(
    html,
    /<script\b(?=[^>]*\btype=["']module["'])[^>]*>/i,
    'src'
  );
  if (!scriptSource?.startsWith('/assets/')) throw new Error('deployed module entry is missing');

  const scriptUrl = new URL(scriptSource, pageResponse.url);
  scriptUrl.searchParams.set('smoke', Date.now().toString());
  const scriptResponse = await fetch(scriptUrl, {
    headers: { Accept: 'text/javascript, application/javascript', 'Cache-Control': 'no-cache' },
  });
  if (!scriptResponse.ok) throw new Error(`module returned HTTP ${scriptResponse.status}`);
  const scriptType = scriptResponse.headers.get('content-type')?.split(';', 1)[0].trim() ?? '';
  const allowedScriptTypes = [
    'application/javascript',
    'text/javascript',
    'application/ecmascript',
    'text/ecmascript',
  ];
  if (!allowedScriptTypes.includes(scriptType)) {
    throw new Error(`module returned disallowed MIME type ${scriptType || '(missing)'}`);
  }

  const stylesheetSource =
    extractAttribute(html, /<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*>/i, 'href') ??
    extractAttribute(
      html,
      /<style\b(?=[^>]*\bdata-inlined-css=["'])[^>]*>/i,
      'data-inlined-css'
    );
  if (!stylesheetSource) throw new Error('deployed stylesheet is missing');
  const stylesheetResponse = await fetch(new URL(stylesheetSource, pageResponse.url));
  const stylesheetType = stylesheetResponse.headers.get('content-type')?.split(';', 1)[0].trim();
  if (!stylesheetResponse.ok || stylesheetType !== 'text/css') {
    throw new Error(`stylesheet returned HTTP ${stylesheetResponse.status} with ${stylesheetType}`);
  }

  return { pageUrl: pageResponse.url, scriptUrl: scriptUrl.href, scriptType };
}

let lastError;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const result = await checkDeployment();
    console.log(`Deployment smoke test passed: ${result.pageUrl}`);
    console.log(`Module MIME type: ${result.scriptType} (${result.scriptUrl})`);
    lastError = undefined;
    break;
  } catch (error) {
    lastError = error;
    console.warn(`Deployment check ${attempt}/${attempts} failed: ${error.message}`);
    if (attempt < attempts) await delay(retryDelayMs);
  }
}

if (lastError) {
  console.error(`Deployment smoke test failed: ${lastError.message}`);
  process.exitCode = 1;
}
