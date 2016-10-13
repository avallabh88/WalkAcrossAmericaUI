import constants from './constants'

// Define the endpoint names
const endpoints = {
  SystemInfo: 'system-info',
  ToolsInfo: 'tools'
};

// Update the endpoints to start with the hostname and port
Object.keys(endpoints).forEach(key => {
  endpoints[key] = `${constants.host}:${constants.port}/${endpoints[key]}`;
});

export default endpoints;