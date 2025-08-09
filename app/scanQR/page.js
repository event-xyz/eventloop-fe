import { useState, useRef } from "react";
import { Button, Input, Card, CardContent, CardHeader } from "shadcn";
import { BarcodeScanner } from "@zxing/library";

const QRScannerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const videoRef = useRef(null); // Reference for video stream
  const [scanner, setScanner] = useState(null);

  // Start QR code scanning
  const startScanning = () => {
    if (scanner) return; // If scanner already initialized, don't reinit
    const codeReader = new BarcodeScanner();

    // Set up video feed
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Start scanning the video feed
    codeReader
      .decodeFromVideoDevice(null, videoElement, (result, err) => {
        if (result) {
          // If QR code is scanned successfully
          setScanResult(result.getText());
          setErrorMessage("");
          codeReader.reset(); // Stop scanning once QR is decoded
          (scanResult) => {
            // For example, send the data to your backend to verify it
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/verifyQR`, {
              method: "POST",
              body: JSON.stringify({ qr_string: scanResult }),
              headers: { "Content-Type": "application/json" },
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  alert("QR Data verified successfully");
                } else {
                  alert("Invalid QR Data");
                }
              });
          };
        }
        if (err && !result) {
          setErrorMessage("Error scanning QR code. Please try again.");
        }
      })
      .then(() => {
        setScanner(codeReader);
      })
      .catch((err) => {
        setErrorMessage("Unable to start QR scanner: " + err.message);
      });
  };

  // Stop the scanning process
  const stopScanning = () => {
    if (scanner) {
      scanner.reset();
      setScanner(null);
      setScanResult(null);
      setErrorMessage("");
    }
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
            <video
              ref={videoRef}
              width="100%"
              height="auto"
              style={{
                borderRadius: "8px",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
              }}
              autoPlay
              muted
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
            <Button onClick={startScanning} disabled={scanner}>
              Start Scanning
            </Button>
            <Button onClick={stopScanning} disabled={!scanner}>
              Stop Scanning
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRScannerPage;
