import {POST_URL} from "../env.js";

export async function postData(position, kph) {
    const {lat, lng} = position;
    const response = await fetch(POST_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({lng, lat, kph})
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Request failed: ${response.status} ${errorBody}`);
    }
}
