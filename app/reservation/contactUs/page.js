"use client"; // Certifica que esse arquivo roda apenas no cliente

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ useRouter de "next/navigation" (para App Router)
import { IoChevronBackOutline } from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";

export default function ContactUs() {
    const router = useRouter(); // ✅ useRouter sempre no topo
    const [email, setEmail] = useState(null);

    useEffect(() => {
        // Aguarde até que o componente seja montado no cliente
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const emailParam = urlParams.get("email");
            if (emailParam) {
                setEmail(emailParam);
            }
        }
    }, []);

    return (
        <main>
            <div className="bg-[#8F857D] flex flex-row justify-between items-center h-12 pl-64 pr-64">
                <IoChevronBackOutline size={20} color="white" onClick={() => router.back()} />
                <p className="font-bold text-white">Contact Us</p>
                <IoMdRefresh size={20} color="white" onClick={() => window.location.reload()} />
            </div>
            <div className="flex flex-col justify-center items-center mt-4">
                {/* Exibe o email quando ele estiver disponível */}
                {email ? <p>Email: {email}</p> : <p>Loading...</p>}
            </div>
        </main>
    );
}
