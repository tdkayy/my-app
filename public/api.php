<?php
// top of api.php
header('Access-Control-Allow-Origin: https://your-vercel-domain.vercel.app');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ---------- config ----------
const EXPENSIFY_API_URL = 'https://www.expensify.com/api';
const PARTNER_NAME      = 'applicant';
const PARTNER_PASSWORD  = 'd7c3119c6cdab02d68d9';

// Optional file log
$LOG_DIR = __DIR__ . '/logs';
if (!is_dir($LOG_DIR)) @mkdir($LOG_DIR, 0777, true);
$LOG_FILE = $LOG_DIR . '/api.log';

// Debug toggle: ?debug=1 or X-Debug: 1
$DEBUG = (isset($_GET['debug']) && $_GET['debug'] === '1')
      || (isset($_SERVER['HTTP_X_DEBUG']) && $_SERVER['HTTP_X_DEBUG'] === '1');

function dbg($label, $data) {
    global $DEBUG, $LOG_FILE;
    if (!$DEBUG) return;
    $line = "[" . date('H:i:s') . "] $label: " . (is_string($data) ? $data : json_encode($data));
    error_log($line);
    @file_put_contents($LOG_FILE, $line . PHP_EOL, FILE_APPEND);
}

// ---------- input ----------
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents('php://input') ?: '';
$in  = [];
if ($raw !== '') {
    $in = json_decode($raw, true);
    if (!is_array($in)) $in = [];
}
// also allow form POST for manual curl
if (empty($in) && !empty($_POST)) {
    $in = $_POST;
}

dbg('incoming_raw', $raw ?: '(empty)');
dbg('incoming_parsed', $in);

// ---------- build payload per command ----------
$command = isset($in['command']) ? (string)$in['command'] : '';
if ($command === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing command']);
    exit;
}

// Start with only the command and partner creds when needed
$payload = ['command' => $command];

// Build strictly per command (prevents field leakage)
switch ($command) {
    case 'Authenticate': {
        $payload['partnerName']       = PARTNER_NAME;
        $payload['partnerPassword']   = PARTNER_PASSWORD;
        $payload['partnerUserID']     = (string)($in['partnerUserID'] ?? '');
        $payload['partnerUserSecret'] = (string)($in['partnerUserSecret'] ?? '');
        break;
    }

    case 'Get': {
        $payload['authToken'] = (string)($in['authToken'] ?? '');
        break;
    }

    case 'CreateTransaction': {
        // Expect flat fields. Normalize types.
        $authToken = (string)($in['authToken'] ?? '');
        $created   = $in['created'] ?? null;   // expect epoch seconds
        $merchant  = (string)($in['merchant'] ?? '');
        $amount    = $in['amount'] ?? null;    // decimal e.g. 12.34
        $currency  = strtoupper((string)($in['currency'] ?? 'GBP'));

        // Coerce types safely
        $payload['authToken'] = $authToken;

        // created: allow string/number; cast to int seconds
        if ($created === null || $created === '') {
            $payload['created'] = time();
        } else {
            $payload['created'] = (int)$created;
        }

        $payload['merchant'] = $merchant;

        // amount as decimal string (two dp) so Expensify parses it consistently
        $amountFloat = is_numeric($amount) ? (float)$amount : 0.0;
        $payload['amount'] = number_format($amountFloat, 2, '.', '');

        $payload['currency'] = $currency;
        break;
    }

    default: {
        // Pass-through but scrub unexpected fields
        $payload = ['command' => $command];
        foreach (['authToken','input','parameters'] as $k) {
            if (isset($in[$k])) $payload[$k] = $in[$k];
        }
        break;
    }
}

dbg('payload_to_expensify', $payload);

// ---------- cURL ----------
$ch = curl_init(EXPENSIFY_API_URL);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,

    // Expensify expects application/x-www-form-urlencoded
    CURLOPT_POSTFIELDS     => http_build_query($payload),

    // Make Cloudflare happy
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/x-www-form-urlencoded',
        // normal browser-y UA to avoid bot challenge
        'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
    ],

    // You generally want SSL verify ON. If your local PHP has CA issues, you can toggle the next two lines,
    // but try not to disable these in real deployments.
    // CURLOPT_SSL_VERIFYPEER => true,
    // CURLOPT_SSL_VERIFYHOST => 2,
]);

$upstream = curl_exec($ch);
$info     = curl_getinfo($ch);
$err      = curl_error($ch);
curl_close($ch);

dbg('curl_info', $info);
dbg('upstream_raw_first500', substr($upstream ?: '', 0, 500));

// ---------- response handling ----------
if ($upstream === false) {
    echo json_encode(['error' => 'cURL error', 'details' => $err, 'info' => $info]);
    exit;
}

// Try JSON decode; fallback to HTML wrapper if Cloudflare challenged us
$json = json_decode($upstream, true);
if (is_array($json)) {
    echo json_encode($json);
    exit;
}

// If we got HTML (Cloudflare challenge), return a clear error
echo json_encode([
    'error'    => 'Upstream returned HTML (likely Cloudflare challenge).',
    'hint'     => 'Ensure form-encoded POST + real User-Agent. Try again.',
    'snippet'  => substr($upstream, 0, 200),
    'httpInfo' => $info,
]);
