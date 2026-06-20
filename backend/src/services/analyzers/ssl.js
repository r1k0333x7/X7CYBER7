import tls from 'node:tls';

// SSL/TLS analyzer: connects and inspects certificate + negotiated protocol.
export function analyzeTls(hostname, port = 443) {
  return new Promise((resolve) => {
    const findings = [];
    const socket = tls.connect(
      { host: hostname, port, servername: hostname, rejectUnauthorized: false, timeout: 8000 },
      () => {
        const cert = socket.getPeerCertificate();
        const protocol = socket.getProtocol();
        const info = { protocol, validFrom: cert.valid_from, validTo: cert.valid_to, issuer: cert.issuer?.O };

        if (protocol === 'TLSv1' || protocol === 'TLSv1.1') {
          findings.push({
            category: 'ssl-tls',
            title: `Weak TLS version: ${protocol}`,
            description: 'Outdated TLS protocol negotiated.',
            severity: 'high',
            mitigation: 'Disable TLS 1.0/1.1; require TLS 1.2+.'
          });
        }
        if (cert.valid_to) {
          const daysLeft = Math.round((new Date(cert.valid_to) - Date.now()) / 86400000);
          info.daysLeft = daysLeft;
          if (daysLeft < 0) {
            findings.push({ category: 'ssl-tls', title: 'Certificate expired', description: `Expired on ${cert.valid_to}`, severity: 'critical', mitigation: 'Renew the certificate.' });
          } else if (daysLeft < 21) {
            findings.push({ category: 'ssl-tls', title: 'Certificate expiring soon', description: `${daysLeft} days remaining`, severity: 'medium', mitigation: 'Renew before expiry.' });
          }
        }
        socket.end();
        resolve({ findings, info });
      }
    );
    socket.on('error', (err) => resolve({ findings: [{ category: 'ssl-tls', title: 'TLS connection failed', description: err.message, severity: 'informational' }], info: {} }));
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ findings: [{ category: 'ssl-tls', title: 'TLS timeout', description: 'Handshake timed out', severity: 'informational' }], info: {} });
    });
  });
}
