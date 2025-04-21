"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";

import { IoChevronBackOutline } from "react-icons/io5";
import { IoIosCloseCircle } from "react-icons/io";

import en from "../../../public/locales/english/common.json";
import pt from "../../../public/locales/portuguesePT/common.json";

import "./style.css";

const translations = { en, pt };

export default function Signature() {
    const router = useRouter();
    const sigCanvas = useRef(null);
    const [signature, setSignature] = useState(null);

    const [locale, setLocale] = useState("en"); // Idioma padrão

    useEffect(() => {
        // Verifica o idioma armazenado no localStorage ao carregar a página
        const storedLang = localStorage.getItem("lang");
        if (storedLang) {
            setLocale(storedLang);
        }
    }, []);

    const t = translations[locale];

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
            <div className="bg-[#8F857D] flex flex-row items-center h-12 pl-64 pr-64 header">
                <IoChevronBackOutline
                    size={20}
                    color="white"
                    className="cursor-pointer"
                    onClick={() => router.push("./prepare-check-in")}
                />
                <p className="font-bold text-white flex-grow text-center">{t.AddSignature.Title}</p>
            </div>
            <div className="flex flex-col pl-92 pr-92 mt-4 main-page">
                <h2 className="text-xl font-bold mb-4">{t.AddSignature.SignBelow}</h2>
                <div className="border-2 border-gray-300 h-48">
                    <SignatureCanvas
                        ref={sigCanvas}
                        canvasProps={{ className: "w-full h-full" }}
                    />
                </div>
                <div className="flex gap-4 mt-4">
                    <div className="flex flex-row items-center gap-2 text-red-500">
                        <IoIosCloseCircle onClick={clearSignature} size={20} color="red" />
                        <p>{t.AddSignature.Clear}</p>
                    </div>
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        onClick={saveSignature}
                    >
                        {t.AddSignature.Save}
                    </button>
                </div>
                {signature && (
                    <div className="mt-4">
                        <p>{t.AddSignature.SignatureSaved}</p>
                    </div>
                )}
            </div>
        </main>
    );
}
