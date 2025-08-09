"use client";

import { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Loading } from "@/components/ui/loading";

const QRScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [fetching, setFetching] = useState(false);
  const videoRef = useRef(null);

  // Handle successful QR scan
  const handleScan = async (qrString) => {
    if (qrString) {
      setScanResult(qrString);
      setErrorMessage("");

      setFetching(true);
      try {
        const backendScanData = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/verifyQR`,
          {
            method: "POST",
            body: JSON.stringify({ qr_string: qrString }),
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        const backendData = await backendScanData.json();
        setScanResult(JSON.stringify(backendData));
      } catch (error) {
        setErrorMessage("Something went wrong!");
      } finally {
        setFetching(false);
      }

      if (backendData) {
        console.log(backendData);
        setScanResult(JSON.stringify(backendData));
      }
    }
  };

  // Handle scan error
  const handleError = (err) => {
    setErrorMessage("Error scanning QR code: " + err.message);
  };

  // Initialize ZXing QR Reader
  useEffect(() => {
    if (videoRef.current) {
      const codeReader = new BrowserMultiFormatReader();
      codeReader
        .decodeFromVideoDevice(null, videoRef.current, (result, err) => {
          if (result) {
            handleScan(result.getText());
          }
          if (err) {
            handleError(err);
          }
        })
        .catch((err) => handleError(err));
    }
  }, []);

  if (fetching) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-6 flex flex-col items-center">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <header className="mb-4">
          <h2 className="text-xl font-semibold">Scan Your QR Code</h2>
        </header>
        <div className="mb-4">
          {/* Dynamically loaded QR scanner */}
          <video ref={videoRef} width="100%" style={{ borderRadius: "8px" }} />
        </div>

        {/* Scan result */}
        {scanResult && (
          <div className="mt-4 text-green-600 font-semibold">
            <p>Scanned Data: {scanResult}</p>
            <p>User: {scanResult.user ? scanResult.user : "cooked"}</p>
            <p>Message: {scanResult.message}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-4 text-red-600 font-semibold">
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerPage;
