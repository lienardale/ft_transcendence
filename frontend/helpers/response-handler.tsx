function responseHandler(response: any) {
    if (response.ok) {
        return response.json();
    }
    return response.json().then(data => {
        throw new Error(data.message || 'Something went wrong!');
    });
}

export default responseHandler;