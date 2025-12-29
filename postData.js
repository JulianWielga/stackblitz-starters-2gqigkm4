import {POST_URL} from "./env.js";

let possibleCors = false;

export function postData(id, {lat, lng}, kph) {
    if (possibleCors) throw "Possible CORS error before";
    return fetch(POST_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id, lng, lat, kph})
    }).catch(error => {
        possibleCors = true;
        throw "Possible CORS error";
    });
}
