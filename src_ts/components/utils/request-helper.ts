import '@polymer/iron-ajax/iron-request.js';

class RequestError {
  constructor(error, statusCode, statusText, response) {
    this.error = error;
    this.status = statusCode;
    this.statusText = statusText;
    this.response = this._prepareResponse(response);
  }

  _prepareResponse(response) {
    try {
      return JSON.parse(response);
    } catch (e) {
      return response;
    }
  }
}

const createIronRequestElement = () => {
  let ironRequestElem = document.createElement('iron-request');
  return ironRequestElem;
};

const generateRequestConfigOptions = (endpoint, data) => {
  let config = {
      url: endpoint.url,
      method: endpoint.method || 'GET',
      handleAs: endpoint.handleAs || 'json',
      headers: _getRequestHeaders({}),
      body: data,
  };
  return config;
};

export const makeRequest = (endpoint, data = {}) => {

  let reqConfig = generateRequestConfigOptions(endpoint, data);
  let requestElem = createIronRequestElement();

  requestElem.send(reqConfig);
  return requestElem!.completes!.then((result) => {
    return result.response;
  }).catch((error) => {
    throw new RequestError(error, requestElem.xhr.status, requestElem.xhr.statusText, requestElem.xhr.response);
  });
};

const _getCSRFCookie = () => {
  // check for a csrftoken cookie and return its value
  let csrfCookieName = 'csrftoken';
  let csrfToken = null;
  if (document.cookie && document.cookie !== '') {
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, csrfCookieName.length + 1) === (csrfCookieName + '=')) {
        csrfToken = decodeURIComponent(cookie.substring(csrfCookieName.length + 1));
        break;
      }
    }
  }
  return csrfToken;
};

const _getCsrfHeader = (csrfCheck: any) => {
  let csrfHeaders: any = {};
  if (csrfCheck !== 'disabled') {
    let csrfToken = _getCSRFCookie();

    if (csrfToken) {
      csrfHeaders['x-csrftoken'] = csrfToken;
    }
  }
  return csrfHeaders;
};


const _getRequestHeaders = (reqConfig: any) => {
  let headers: any = {};

  headers['content-type'] = 'application/json';

  let clientConfiguredHeaders = _getClientConfiguredHeaders(reqConfig.headers);

  let csrfHeaders = {};
  if (!_csrfSafeMethod(reqConfig.method)) {
    csrfHeaders = _getCsrfHeader(reqConfig.csrfCheck);
  }

  headers = Object.assign({}, headers, clientConfiguredHeaders, csrfHeaders);

  return headers;
};

const _getClientConfiguredHeaders = (additionalHeaders: any) => {
  let header;
  let clientHeaders: any = {};
  if (additionalHeaders && additionalHeaders instanceof Object) {
    /* eslint-disable guard-for-in */
    for (header in additionalHeaders) {
      clientHeaders[header] = additionalHeaders[header].toString();
    }
    /* eslint-enable guard-for-in */
  }
  return clientHeaders;
};


const _csrfSafeMethod = (method) => {
  // these HTTP methods do not require CSRF protection
  return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
};

