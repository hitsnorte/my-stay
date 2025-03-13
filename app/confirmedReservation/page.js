"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

// importação de icons
import { IoChevronBackOutline } from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";
import { FaCalendarAlt, FaRegCalendarCheck } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

function ReservationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
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
    }, [token, router]);

    return (
        <main className="bg-[#F7F0F5] h-screen">
            <div className="bg-[#8F857D] flex flex-row justify-between items-center h-12 pl-64 pr-64">
                <IoChevronBackOutline size={20} color="white" />
                <IoMdRefresh size={20} color="white" onClick={() => window.location.reload()} />
            </div>
            <div className="flex flex-col justify-center items-center">
                <h1 className="text-2xl font-bold flex justify-center mt-4">nome_hospede</h1>
                <div className="flex flex-row gap-4 items-center mt-4">
                    <div className="flex flex-row items-center font-bold">
                        <p className="text-5xl">05</p>
                        <div>
                            <p>WED</p>
                            <p>MAR</p>
                        </div>
                    </div>
                    <p>nrm_noites</p>
                    <div className="flex flex-row items-center font-bold">
                        <div>
                            <p>THU</p>
                            <p>MAR</p>
                        </div>
                        <p className="text-5xl">06</p>
                    </div>
                </div>
                <div className="flex flex-row gap-2 items-center text-[#8F857D] mt-4">
                    <MdEmail />
                    <p className="font-bold">Contact us</p>
                    <MdEmail />
                </div>
                {error ? (
                    <p className="text-red-500">{error}</p>
                ) : data ? (
                    <div className="flex justify-center mt-4">
                        <div className="flex flex-row gap-6">
                            {/* Card 1 */}
                            <div className="flex flex-col items-center justify-center gap-4 border border-gray-800 p-6 rounded-lg bg-[#DECBB7] w-48 h-48 text-center text-sm">
                                <FaCalendarAlt size={35} />
                                <p className="uppercase">Reservation</p>
                            </div>
                            {/* Card 2 */}
                            <div className="flex flex-col items-center justify-center gap-4 border border-gray-800 p-6 rounded-lg bg-[#DECBB7] w-48 h-48 text-center text-sm">
                                <FaRegCalendarCheck size={35} />
                                <p className="uppercase">Prepare check-in</p>
                            </div>
                            {/* Card 3 (sem ícone) */}
                            <div className="flex flex-col items-center justify-center gap-4 border border-gray-800 p-6 rounded-lg bg-[#8F857D] w-48 h-48 text-center font-bold text-sm">
                                <p className="uppercase">Check-in and discover all features</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Carregando...</p>
                )}
            </div>
        </main>
    );
}

export default function ConfirmedReservation() {
    return (
        <Suspense fallback={<p>Carregando...</p>}>
            <ReservationContent />
        </Suspense>
    );
}
