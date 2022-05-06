import fetchParams from "./helperFetch";
import responseHandler from "./response-handler";

async function fetchGet(
    url: string,
    controller: AbortController 
) {
    const params = await fetchParams('GET');
    if (params !== null) {
        try{
            return await fetch(url, {...params,
                signal: controller.signal
              })
            .then(response => responseHandler(response))
            .then(response => { return response })
            .catch(_error => { return undefined });
        }
        catch (error) {
            return undefined;
        }
    } else {
        return undefined;
    }
}

export default fetchGet;
