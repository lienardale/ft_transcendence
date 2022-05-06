import fetchParams from "./helperFetch";
import responseHandler from "./response-handler";

async function fetchPost(url: string, post_params : any) {
    const params = await fetchParams('POST', post_params);
    if (params !== null) {
        return await fetch(url, params)
        .then(response => responseHandler(response))
        .then(response => { return response })
        .catch(_error => { return undefined });
    } else {
        return undefined;
    }
}

export default fetchPost;
