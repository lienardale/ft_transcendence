import fetchParams from "./helperFetch";
import responseHandler from "./response-handler";

async function fetchPatch(
    url: string, fetch_params
) {
    const params = await fetchParams('PATCH', fetch_params);
    if (params !== null) {
        return await fetch(url, params)
        .then(response => responseHandler(response))
        .then(response => { return response })
        .catch(_error => { return undefined });
    } else {
        return undefined;
    }
}

export default fetchPatch;
