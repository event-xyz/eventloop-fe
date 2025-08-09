"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader } from "shadcn";
import dynamic from "next/dynamic";

// Dynamically import the ReactQrReader component with SSR disabled
const ReactQrReader = dynamic(() => import("react-qr-scanner"), { ssr: false });

const QRScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle successful QR scan
  const handleScan = (data) => {
    if (data) {
      setScanResult(data.text);
      setErrorMessage(""); // Clear any previous error messages
      // Send data to backend to verify the QR
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/verifyQR`, {
        method: "POST",
        body: JSON.stringify({ qr_string: data.text }),
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            alert("QR Data verified successfully");
          } else {
            alert("Invalid QR Data");
          }
        })
        .catch((err) => {
          setErrorMessage("Error verifying QR: " + err.message);
        });
    }
  };

  // Handle scan error
  const handleError = (err) => {
    setErrorMessage("Error scanning QR code: " + err.message);
  };

  return (
    <div className="container mx-auto p-6 flex flex-col items-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h2 className="text-xl font-semibold">Scan Your QR Code</h2>
        </CardHeader>
        <CardContent>
          {/* QR Scan Display Section */}
          <div className="mb-4">
            {/* Dynamically loaded QR scanner */}
            <ReactQrReader
              delay={300}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "8px",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
              }}
              onScan={handleScan}
              onError={handleError}
            />
          </div>

          {/* Scan result */}
          {scanResult && (
            <div className="mt-4 text-green-600 font-semibold">
              <p>Scanned Data: {scanResult}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 text-red-600 font-semibold">
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 space-x-4">
            {/* The scanner works immediately after the camera is loaded */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScannerPage;
