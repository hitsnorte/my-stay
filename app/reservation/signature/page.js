"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";

import { IoChevronBackOutline } from "react-icons/io5";
import { IoIosCloseCircle } from "react-icons/io";

export default function Signature() {
    const router = useRouter();
    const sigCanvas = useRef(null);
    const [signature, setSignature] = useState(null);

    const clearSignature = () => {
        sigCanvas.current.clear();
        setSignature(null);
    };

    const saveSignature = () => {
        if (sigCanvas.current.isEmpty()) {
            alert("Please provide a signature before saving.");
            return;
        }
        const signatureData = sigCanvas.current.toDataURL("image/png");
        sessionStorage.setItem("userSignature", signatureData);
        setSignature(signatureData);
        router.push("./prepare-check-in"); // Redireciona de volta após salvar
    };

    return (
        <main>
            <div className="bg-[#8F857D] flex flex-row items-center h-12 pl-64 pr-64">
                <IoChevronBackOutline
                    size={20}
                    color="white"
                    className="cursor-pointer"
                    onClick={() => router.push("./prepare-check-in")}
                />
                <p className="font-bold text-white flex-grow text-center">Signature</p>
            </div>
            <div className="flex flex-col pl-92 pr-92 mt-4">
                <h2 className="text-xl font-bold mb-4">Sign Below</h2>
                <div className="border-2 border-gray-300 h-48">
                    <SignatureCanvas
                        ref={sigCanvas}
                        canvasProps={{ className: "w-full h-full" }}
                    />
                </div>
                <div className="flex gap-4 mt-4">
                    <div className="flex flex-row items-center gap-2 text-red-500">
                    <IoIosCloseCircle onClick={clearSignature} size={20} color="red"/>
                    <p>Clear</p>
                    </div>
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        onClick={saveSignature}
                    >
                        Save
                    </button>
                </div>
                {signature && (
                    <div className="mt-4">
                        <p>Signature saved!</p>
                    </div>
                )}
            </div>
        </main>
    );
}
