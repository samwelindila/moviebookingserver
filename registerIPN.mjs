const getToken = async () => {
    const res = await fetch('https://pay.pesapal.com/v3/api/Auth/RequestToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
            consumer_key: '3kVMONSUxYmLzBdSvnZobGbOlFnNtIBq',
            consumer_secret: 'Ka2obHesOkP/zkYKZicMy0Skoa0='
        })
    });
    const data = await res.json();
    return data.token;
};

const run = async () => {
    const token = await getToken();
    const res = await fetch('https://pay.pesapal.com/v3/api/URLSetup/RegisterIPN', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            url: 'https://moviebookingserver-eight.vercel.app/api/booking/ipn',
            ipn_notification_type: 'GET'
        })
    });
    const data = await res.json();
    console.log('IPN ID:', data.ipn_id);
    console.log('Full response:', JSON.stringify(data, null, 2));
};

run();
