"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Loading } from "@/components/ui/loading";

// Custom hook to handle QR scanning logic
const useQRCodeScanner = (videoRef, scanResult, setScanResult, setErrorMessage, setFetching) => {
  const handleScan = useCallback(async (qrString) => {
    if (qrString && qrString !== scanResult) {
      setScanResult(qrString); // Update scan result to prevent re-scanning same QR
      setErrorMessage(""); // Clear previous errors

      setFetching(true);
      try {
        const backendScanData = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/verifyQR`, {
          method: "POST",
          body: JSON.stringify({ qr_string: qrString }),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const backendData = await backendScanData.json();
        if (backendScanData.ok) {
          setScanResult(JSON.stringify(backendData));
        } else {
          setErrorMessage("Failed to authenticate QR.");
        }
      } catch (error) {
        setErrorMessage("Something went wrong!");
      } finally {
        setFetching(false);
      }
    }
  }, [scanResult, setScanResult, setErrorMessage, setFetching]);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    // Define the scanning function
    const scanQRCode = (result, err) => {
      if (err) {
        setErrorMessage("Error scanning QR code: " + err.message);
        return;
      }

      if (result && result.getText() !== scanResult) {
        handleScan(result.getText()); // Proceed only if the QR string is new
      }
    };

    const intervalId = setInterval(() => {
      if (videoRef.current) {
        codeReader.decodeFromVideoDevice(null, videoRef.current, scanQRCode)
          .catch((err) => setErrorMessage("Error reading QR: " + err));
      }
    }, 500); // Check QR code every 500ms

    return () => {
      clearInterval(intervalId); // Clean up interval
      codeReader.reset(); // Reset the scanner
    };
  }, [scanResult, videoRef, handleScan, setErrorMessage]);

};

const QRScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [fetching, setFetching] = useState(false);
  const videoRef = useRef(null);

  // Use custom hook to handle QR scanning logic
  useQRCodeScanner(videoRef, scanResult, setScanResult, setErrorMessage, setFetching);

  if (fetching) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-6 flex flex-col items-center">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <header className="mb-4">
          <h2 className="text-xl font-semibold">Scan Your QR Code</h2>
        </header>

        {/* Video feed for QR scanning */}
        <div className="mb-4">
          <video ref={videoRef} width="100%" style={{ borderRadius: "8px" }} />
        </div>

        {/* Display scan result */}
        {scanResult && (
          <div className="mt-4 text-green-600 font-semibold">
            <p>Scanned Data: {scanResult}</p>
            {/* Assuming scanResult contains a valid object with `user` and `message` */}
            <p>User: {scanResult?.user || "Unknown"}</p>
            <p>Message: {scanResult?.message || "No message"}</p>
          </div>
        )}

        {/* Display error message */}
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
