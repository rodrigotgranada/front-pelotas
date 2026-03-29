const hostname = window.location.hostname;
const apiHost = hostname === 'localhost' || hostname === '127.0.0.1' ? 'localhost' : hostname;

export const environment = {
  production: false,
  apiBaseUrl: `http://${apiHost}:3000/api`,
  apiUrl: `http://${apiHost}:3000/api`,
  publicBaseUrl: `http://${hostname}:4200`
};
