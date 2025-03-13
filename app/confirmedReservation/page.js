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
                console.log(response.data);
                setData(JSON.parse(response.data.requestBody));
            } catch (err) {
                setError("Erro ao buscar os dados da reserva");
            }
        };

        fetchData();
    }, [token, router]);

    // Função para converter a string de data para um formato correto
    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split(" ")[0].split("/");
        return new Date(`${year}-${month}-${day}T00:00:00`);
    };

    // Se os dados foram carregados, processamos as datas corretamente
    const checkInDate = data ? parseDate(data.protelValidFrom) : null;
    const checkOutDate = data ? parseDate(data.protelValidUntil) : null;

    // Calcula o número de noites corretamente
    const numNights = checkInDate && checkOutDate
        ? Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
        : 0;

    // Formatar data dinamicamente
    const formatDate = (date) => {
        if (!date) return { day: "??", weekDay: "???", month: "???" };
        return {
            day: date.getDate(),
            weekDay: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
            month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        };
    };

    const checkIn = formatDate(checkInDate);
    const checkOut = formatDate(checkOutDate);

    return (
        <main className="bg-[#F7F0F5] h-screen">
            {error ? (
                <p className="text-red-500">{error}</p>
            ) : data ? (
                <>
                    <div className="bg-[#8F857D] flex flex-row justify-between items-center h-12 pl-64 pr-64">
                        <IoChevronBackOutline size={20} color="white" />
                        <p className="font-bold text-white">Reservation {data.protelReservationID}</p>
                        <IoMdRefresh size={20} color="white" onClick={() => window.location.reload()} />
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <h1 className="text-2xl font-bold flex justify-center mt-4">{data.protelGuestName}</h1>
                        <div className="flex flex-row gap-4 items-center mt-4">
                            <div className="flex flex-row items-center font-bold">
                                <p className="text-5xl">{checkIn.day}</p>
                                <div>
                                    <p>{checkIn.weekDay}</p>
                                    <p>{checkIn.month}</p>
                                </div>
                            </div>
                            <p>{numNights} Night(s)</p>
                            <div className="flex flex-row items-center font-bold">
                                <div>
                                    <p>{checkOut.weekDay}</p>
                                    <p>{checkOut.month}</p>
                                </div>
                                <p className="text-5xl">{checkOut.day}</p>
                            </div>
                        </div>
                        <div className="flex flex-row gap-2 items-center text-[#8F857D] mt-4">
                            <MdEmail />
                            <p className="font-bold">Contact us</p>
                            <MdEmail />
                        </div>
                        <div className="flex justify-center mt-4">
                            <div className="flex flex-row gap-6">
                                <div className="flex flex-col items-center justify-center gap-4 border border-gray-800 p-6 rounded-lg bg-[#DECBB7] w-48 h-48 text-center text-sm">
                                    <FaCalendarAlt size={35} />
                                    <p className="uppercase">Reservation</p>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-4 border border-gray-800 p-6 rounded-lg bg-[#DECBB7] w-48 h-48 text-center text-sm">
                                    <FaRegCalendarCheck size={35} />
                                    <p className="uppercase">Prepare check-in</p>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-4 border border-gray-800 p-6 rounded-lg bg-[#8F857D] w-48 h-48 text-center font-bold text-sm text-white">
                                    <p className="uppercase">Check-in and discover all features</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <p>Carregando...</p>
            )}
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
