export default function authParams(method: string, bodyParam?: any) {
  var customHeaders;
  var fetchParams;

  const user = localStorage.getItem('currentUser');
  if (user === null) {
    return null
  }

  if (method === 'GET') {
    if (user) {
      customHeaders = new Headers({
        'Authorization': 'Bearer ' + user
      });
    } else {
      console.error('error while setting the request\'s header')
    }

    fetchParams = { headers: customHeaders };
  } else if (method === 'POST') {
    if (user) {
      customHeaders = new Headers({
        'Authorization': 'Bearer ' + user,
        'Content-Type': 'application/json'
      });
    } else {
      console.error('error while setting the request\'s header')
    }
    fetchParams = { 
      method: 'POST',
      body: JSON.stringify(bodyParam),
      headers: customHeaders,
    };
  } else if (method === 'PATCH') {
    if (user) {
      customHeaders = new Headers({
        'Authorization': 'Bearer ' + user,
        'Content-Type': 'application/json'
      });
    } else {
      console.error('error while setting the request\'s header')
    }
    fetchParams = { 
      method: 'PATCH',
      body: JSON.stringify(bodyParam),
      headers: customHeaders,
    };
  } else if (method === 'PUT') {
    if (user) {
      customHeaders = new Headers({
        'Authorization': 'Bearer ' + user,
      });
    } else {
      console.error('error while setting the request\'s header')
    }
    fetchParams = { 
      method: 'PUT',
      body: bodyParam,
      headers: customHeaders,
    };
  } else if (method === 'DELETE') {
    if (user) {
      customHeaders = new Headers({
        'Authorization': 'Bearer ' + user
      });
    } else {
      console.error('error while setting the request\'s header')
    }
    fetchParams = { 
      method: 'DELETE',
      headers: customHeaders,
    };
  }
  return fetchParams;
}
