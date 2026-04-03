import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // scale up
    { duration: '1m', target: 20 },  // stable load
    { duration: '30s', target: 0 },  // scale down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], 
    http_req_duration: ['p(95)<500'], 
  },
};

const BASE_URL = __ENV.URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'healthy status': (r) => r.json().status === 'healthy',
  });
  sleep(1);
}
