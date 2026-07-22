import { Platform } from 'react-native';

const LOCAL_IP = '172.20.10.3'; 

export const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8000/api'
    : `http://${LOCAL_IP}:8000/api`;

export default API_BASE_URL;