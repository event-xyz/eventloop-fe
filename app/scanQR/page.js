"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Loading } from "@/components/ui/loading";

const QRScannerPage = () => {
  const [qrText, setQrText] = useState(null);
  const [verified, setVerified] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [fetching, setFetching] = useState(false);
  const [scanning, setScanning] = useState(true); // <--- NEW

  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const controlsRef = useRef(null);

  const handleVerify = useCallback(
    async (text) => {
      if (!text || text === qrText) return;
      setQrText(text);
      setErrorMessage("");
      setVerified(null);
      setFetching(true);
      setScanning(false); // <--- Stop scanning while verifying

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/verifyQR`, {
          method: "POST",
          body: JSON.stringify({ qr_string: text }),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const data = await res.json().catch(() => null);

        if (res.ok) {
          setVerified(data ?? { message: "Verified, but no body returned" });
        } else {
          setErrorMessage(data?.message || "Failed to authenticate QR.");
        }
      } catch (e) {
        setErrorMessage(e?.message || "Something went wrong!");
      } finally {
        setFetching(false);
      }
    },
    [qrText]
  );

  useEffect(() => {
    if (!scanning) return; // <--- Only scan if scanning is true

    const start = async () => {
      try {
        codeReaderRef.current = new BrowserMultiFormatReader();

        // Prefer back camera when available
        const devices = await codeReaderRef.current.listVideoInputDevices();
        let deviceId = undefined;
        if (devices && devices.length) {
          const back = devices.find(d =>
            /back|rear|environment/i.test(d.label || "")
          );
          deviceId = (back || devices[devices.length - 1]).deviceId;
        }

        await codeReaderRef.current.decodeFromVideoDevice(
          deviceId ?? null,
          videoRef.current,
          (result, err, controls) => {
            if (controls && !controlsRef.current) {
              controlsRef.current = controls;
            }
            if (result) {
              handleVerify(result.getText());
              return;
            }
            if (err) {
              const ignorable = [
                "NotFoundException",
                "ChecksumException",
                "FormatException",
              ];
              if (!ignorable.includes(err.name)) {
                setErrorMessage(`Scanner error: ${err.message || String(err)}`);
              }
            }
          }
        );
      } catch (e) {
        setErrorMessage(`Error initializing camera: ${e?.message || String(e)}`);
      }
    };

    start();

    return () => {
      try {
        controlsRef.current?.stop();
      } catch {}
      try {
        codeReaderRef.current?.reset();
      } catch {}
    };
  }, [handleVerify, scanning]); // <--- depend on scanning

  const handleScanAgain = () => {
    setQrText(null);
    setVerified(null);
    setErrorMessage("");
    setScanning(true);
  };

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
          <video
            ref={videoRef}
            width="100%"
            style={{ borderRadius: "8px" }}
            playsInline
            muted
            autoPlay
          />
        </div>

        {verified && (
          <div className="mt-4 text-green-600 font-semibold">
            <p>Scan successful!</p>
            <p>Name: {verified.user?.name || "NA"}</p>
            <p>Email: {verified.user?.email || "NA"}</p>
            <p>Role: {verified.user?.role || "NA"}</p>
            <p>Status: {verified.message || "No message"}</p>
            <button
              className="mt-4 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
              onClick={handleScanAgain}
            >
              Scan Again
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 text-red-600 font-semibold">
            <p>{errorMessage}</p>
            <button
              className="mt-2 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
              onClick={handleScanAgain}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerPage;