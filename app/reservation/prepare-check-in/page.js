"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // Importação do Axios

import { IoChevronBackOutline } from "react-icons/io5";
import { MdArrowForwardIos } from "react-icons/md";
import { FaUsers, FaRegCreditCard } from "react-icons/fa";
import { FaFileSignature } from "react-icons/fa6";

export default function PrepareCheckIn() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [signatureExists, setSignatureExists] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Recupera o token do sessionStorage
        const token = sessionStorage.getItem("reservationToken");

        // Se não houver token armazenado, redireciona para a página inicial
        if (!token) {
            router.push("/");
            return;
        }

        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/get_reservation?token=${token}`);
                setData(JSON.parse(response.data.requestBody));
            } catch (err) {
                setError("Erro ao buscar os dados da reserva");
            }
        };

        fetchData();
    }, [router]);

    useEffect(() => {
        // Verifica se há assinatura no sessionStorage
        const savedSignature = sessionStorage.getItem("userSignature");
        setSignatureExists(!!savedSignature); // Define como true se houver assinatura
    }, []);

    return (
        <main>
            {error ? (
                <p className="text-red-500">{error}</p>
            ) : data ? (
                <>
                    <div className="bg-[#8F857D] flex flex-row items-center h-12 pl-64 pr-64">
                        <IoChevronBackOutline
                            size={20}
                            color="white"
                            className="cursor-pointer"
                            onClick={() => router.push("./reservation")}
                        />
                        <p className="font-bold text-white flex-grow text-center">Prepare check-in</p>
                    </div>
                    <div className="flex flex-col pl-92 pr-92 mt-4">
                        <p className="font-bold text-xl text-[#e6ac27]">Your check-in</p>
                        <div className="flex flex-row items-center gap-2 mt-10 mb-2">
                            <FaUsers size={30} color="#e6ac27" />
                            <div className="flex flex-row gap-2 items-center">
                                <p className="font-bold text-xl text-[#e6ac27]">Guests</p>
                                <p className={`text-xs`}>(Incomplete)</p>
                            </div>
                        </div>
                        <p>By entering some of your personal and payment data in advance we will be able to check you in much faster and more comfortably on the day of your arrival.</p>
                        <div>
                            {(parseInt(data.adult) + parseInt(data.child)) === 1 ? (
                                <div className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 mt-4">
                                    <p>{data.salutation} {data.protelGuestName}</p>
                                    <MdArrowForwardIos />
                                </div>
                            ) : (
                                <div>
                                    <div className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 border-b-2 border-white">
                                        <p>{data.salutation} {data.protelGuestName}</p>
                                        <MdArrowForwardIos />
                                    </div>

                                    {[...Array(parseInt(data.adult) + parseInt(data.child) - 1)].map((_, index) => (
                                        <div key={index} className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 border-b-2 border-white">
                                            <p>Unknown guest</p>
                                            <MdArrowForwardIos />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-row items-center gap-2 mt-10">
                            <FaRegCreditCard size={30} color="#e6ac27" />
                            <div className="flex flex-row gap-2 items-center">
                                <p className="font-bold text-xl text-[#e6ac27]">Payment data</p>
                                <p className="text-xs">(Optional)</p>
                            </div>
                        </div>
                        <div className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 mt-4">
                            <p>Add credit card</p>
                            <MdArrowForwardIos />
                        </div>
                        <div className="flex flex-row items-center gap-2 mt-10">
                            <FaFileSignature size={30} color="#e6ac27" />
                            <div className="flex flex-row gap-2 items-center">
                                <p className="font-bold text-xl text-[#e6ac27]">Signature</p>
                                <p className={`text-xs ${signatureExists ? "text-green-500" : "text-red-500"}`}>
                                    {signatureExists ? "(Done)" : "(Missing)"}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 mt-4">
                            <p>Add signature</p>
                            <MdArrowForwardIos onClick={() => router.push("./signature")} className="cursor-pointer" />
                        </div>
                        {/* SAVE */}
                        <button
                            className="bg-[#e6ac27] text-white mt-4 mb-4 p-3"
                        >
                            SAVE
                        </button>
                    </div>
                </>
            ) : (
                <p>Carregando...</p>
            )}
        </main>
    )
}