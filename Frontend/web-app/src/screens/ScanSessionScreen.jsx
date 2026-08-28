import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCustomerSession } from '../context/CustomerSessionContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import './ScanSession.css';

export default function ScanSessionScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { scanSession, status, loading, error } = useCustomerSession();
  const [qrData, setQrData] = useState('');
  const [manualInput, setManualInput] = useState(false);
  const [restaurantId, setRestaurantId] = useState('');
  const [tableId, setTableId] = useState('');
  const [signature, setSignature] = useState('');
  const [expiry, setExpiry] = useState('');
  const [nonce, setNonce] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const qrParam = searchParams.get('qr');
    if (qrParam) {
      try {
        const decoded = JSON.parse(atob(qrParam));
        setQrData(qrParam);
        setRestaurantId(decoded.restaurantId || '');
        setTableId(decoded.tableId || '');
        setSignature(decoded.signature || '');
        setExpiry(decoded.expiry || '');
        setNonce(decoded.nonce || '');
      } catch {
        // ignore invalid QR param
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'active') {
      navigate('/menu', { replace: true });
    }
  }, [status, navigate]);

  const handleScan = async () => {
    if (!restaurantId || !tableId || !signature) {
      return;
    }
    try {
      await scanSession({
        restaurantId,
        tableId,
        signature,
        expiry: expiry || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        nonce: nonce || `nonce-${Date.now()}`,
      });
      navigate('/menu', { replace: true });
    } catch {
      // error handled by context
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const decoded = JSON.parse(event.target.result);
        setQrData(event.target.result);
        setRestaurantId(decoded.restaurantId || '');
        setTableId(decoded.tableId || '');
        setSignature(decoded.signature || '');
        setExpiry(decoded.expiry || '');
        setNonce(decoded.nonce || '');
        setManualInput(true);
      } catch {
        // not a valid QR JSON
      }
    };
    reader.readAsText(file);
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text');
    try {
      const decoded = JSON.parse(text);
      setQrData(text);
      setRestaurantId(decoded.restaurantId || '');
      setTableId(decoded.tableId || '');
      setSignature(decoded.signature || '');
      setExpiry(decoded.expiry || '');
      setNonce(decoded.nonce || '');
      setManualInput(true);
    } catch {
      // not valid JSON
    }
  };

  return (
    <div className="scan-screen" onPaste={handlePaste}>
      <div className="scan-header">
        <h1>Scan QR Code</h1>
        <p>Point your camera at the table QR code or enter details manually</p>
      </div>

      <div className="scan-options">
        <button
          type="button"
          className={`scan-option ${!manualInput ? 'active' : ''}`}
          onClick={() => setManualInput(false)}
        >
          <span className="scan-option-icon">📷</span>
          <span>Camera Scan</span>
        </button>
        <button
          type="button"
          className={`scan-option ${manualInput ? 'active' : ''}`}
          onClick={() => setManualInput(true)}
        >
          <span className="scan-option-icon">⌨️</span>
          <span>Manual Entry</span>
        </button>
      </div>

      {!manualInput ? (
        <div className="camera-section">
          <video ref={(el) => { window.scannerVideo = el; }} className="camera-video" playsInline muted />
          <div className="camera-overlay">
            <div className="scan-frame" />
            <p className="scan-hint">Align QR code within the frame</p>
          </div>
          <div className="camera-actions">
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              Upload QR Image
            </Button>
            <Button onClick={handleScan} loading={loading} disabled={!restaurantId || !tableId || !signature}>
              Start Session
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
          />
        </div>
      ) : (
        <Card className="manual-form">
          <div className="form-group">
            <label>Restaurant ID</label>
            <Input
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              placeholder="Enter restaurant ID"
            />
          </div>
          <div className="form-group">
            <label>Table ID</label>
            <Input
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              placeholder="Enter table ID"
            />
          </div>
          <div className="form-group">
            <label>QR Signature</label>
            <Input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Enter QR signature"
            />
          </div>
          <div className="form-group">
            <label>Expiry (ISO 8601)</label>
            <Input
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}
            />
          </div>
          <div className="form-group">
            <label>Nonce</label>
            <Input
              value={nonce}
              onChange={(e) => setNonce(e.target.value)}
              placeholder={`nonce-${Date.now()}`}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <Button onClick={handleScan} loading={loading} className="submit-btn">
            Start Session
          </Button>
        </Card>
      )}

      {qrData && (
        <details className="debug-section">
          <summary>Debug: Raw QR Data</summary>
          <div className="debug-content">
            <pre>{qrData}</pre>
          </div>
        </details>
      )}

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const video = document.querySelector('.camera-video');
              if (!video || !navigator.mediaDevices) return;
              
              navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(stream => {
                  video.srcObject = stream;
                  video.play();
                })
                .catch(() => {
                  video.style.display = 'none';
                  document.querySelector('.camera-overlay')?.remove();
                });
            })();
          `,
        }}
      />
    </div>
  );
}