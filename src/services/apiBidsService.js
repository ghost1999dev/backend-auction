const BASE_URL = process.env.BIDS_BASE_URL
const API_KEY = process.env.BIDS_API_KEY

async function createBidApi(bid){
    console.log(`PAYLOAD BID ${bid}`);
    
    const res = await fetch(`${BASE_URL}/api/bids`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        },
        body: JSON.stringify(bid)
    })
    console.log('*******RESULT FROM CREATEDBID******');
    const json = await res.json()
    console.log('RESPONSE FROM MICROSERVICE:', json);
    if (!res.ok || !json.success) throw new Error(json.message || `HTTP ${res.status}`)
    return json.data
}

export default createBidApi