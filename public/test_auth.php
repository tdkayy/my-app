<?php
header('Content-Type: application/json');

$payload = [
    'command'           => 'Authenticate',
    'partnerName'       => 'applicant',
    'partnerPassword'   => 'd7c3119c6cdab02d68d9',
    'partnerUserID'     => 'expensifytest@mailinator.com ',
    'partnerUserSecret' => 'hire_me',
];

$ch = curl_init('https://www.expensify.com/api');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => http_build_query($payload),
]);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
