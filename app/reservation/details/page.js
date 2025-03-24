"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // Importação do Axios

import { IoChevronBackOutline } from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";
import { FaUsers, FaBed } from "react-icons/fa";
import { MdArrowForwardIos } from "react-icons/md";
import { TiDocumentAdd } from "react-icons/ti";
import { MdQrCode2 } from "react-icons/md";

import { QRCodeCanvas } from "qrcode.react";

import "./style.css";

export default function ReservationInfo() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter();
    const [showQRCode, setShowQRCode] = useState(false);

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

    // Função para verificar se é o "Unknown guest" ou o nome real
    const handleGuestClick = (guestName) => {
        // Armazena o nome do hóspede ou "Unknown guest" no sessionStorage
        sessionStorage.setItem("selectedGuestName", guestName);
        router.push("./guest-profile");
    };

    const handleQRCodeClick = () => {
        setShowQRCode(true);
    };

    return (
        <main>
            {error ? (
                <p className="text-red-500">{error}</p>
            ) : data ? (
                <>
                    <div className="bg-[#8F857D] flex flex-row justify-between items-center h-12 pl-64 pr-64 header">
                        <IoChevronBackOutline
                            size={20}
                            color="white"
                            className="cursor-pointer"
                            onClick={() => router.push("./reservation")}
                        />
                        <p className="font-bold text-white">Reservation {data.protelBookingID}</p>
                        <IoMdRefresh size={20} color="white" onClick={() => window.location.reload()} />
                    </div>
                    <div className="flex flex-col pl-92 pr-92 main-page">
                        <div className="flex flex-col justify-center items-center">
                            <h1 className="text-2xl font-bold flex justify-center mt-4">{data.protelGuestName}</h1>
                            <div className="flex flex-row gap-4 items-center mt-4">
                                <div className="flex flex-row items-center font-bold">
                                    <p className="text-5xl">{checkIn.day}</p>
                                    <div className="text-left">
                                        <p>{checkIn.weekDay}</p>
                                        <p>{checkIn.month}</p>
                                    </div>
                                </div>
                                <p>{numNights} Night(s)</p>
                                <div className="flex flex-row items-center font-bold">
                                    <div className="text-right">
                                        <p>{checkOut.weekDay}</p>
                                        <p>{checkOut.month}</p>
                                    </div>
                                    <p className="text-5xl">{checkOut.day}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            {/* GUESTS */}
                            <div className="flex flex-row items-center gap-2">
                                <FaUsers size={30} color="#e6ac27" />
                                <p className="font-bold text-xl text-[#e6ac27]">Guests</p>
                            </div>
                            <p>Select a guest name to view guest information.</p>

                            {/* Verificação de quantos adultos e crianças existem */}
                            {(parseInt(data.adult) + parseInt(data.child)) === 1 ? (
                                <div className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 mt-4">
                                    <p>{data.protelGuestName}</p>
                                    <MdArrowForwardIos onClick={() => handleGuestClick(data.protelGuestName)} />
                                </div>
                            ) : (
                                <div>
                                    <div className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 border-b-2 border-white">
                                        <p>{data.protelGuestName}</p>
                                        <MdArrowForwardIos onClick={() => handleGuestClick(data.protelGuestName)} />
                                    </div>

                                    {[...Array(parseInt(data.adult) + parseInt(data.child) - 1)].map((_, index) => (
                                        <div key={index} className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 border-b-2 border-white">
                                            <p>Unknown guest</p>
                                            <MdArrowForwardIos onClick={() => handleGuestClick("Unknown guest")} />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* EXTRAS */}
                            <div className="flex flex-row items-center gap-2 mt-6">
                                <TiDocumentAdd size={30} color="#e6ac27" />
                                <p className="font-bold text-xl text-[#e6ac27]">Extras</p>
                            </div>
                            <p>Just go for that little extra something. Here is what we have got on offer for you.</p>
                            <div className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 mt-4">
                                <p>Available Extras</p>
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <p className="p-1 bg-white rounded-sm">0</p>
                                    <MdArrowForwardIos />
                                </div>
                            </div>
                            {/* ROOM */}
                            <div className="flex flex-row items-center gap-2 mt-6">
                                <FaBed size={26} color="#e6ac27" />
                                <p className="font-bold text-xl text-[#e6ac27]">My room</p>
                            </div>
                            <div className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 mt-4">
                                <p>Not yet assigned.</p>
                            </div>
                            {/* QR CODE */}
                            <div className="flex flex-row items-center gap-2 mt-6">
                                <MdQrCode2 size={26} color="#e6ac27" />
                                <p className="font-bold text-xl text-[#e6ac27]">QR code</p>
                            </div>
                            <p>Create a QR code containing your reservation information.</p>
                            <p>Speed up your check in by having it scanned it at the reception desk.</p>
                            <div className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 mt-4" onClick={handleQRCodeClick}>
                                <p>Show QR code</p>
                                <MdArrowForwardIos />
                            </div>
                        </div>

                        {/* Exibe o QR Code se showQRCode for true */}
                        {showQRCode && (
                            <div className="flex justify-center mt-4">
                                <QRCodeCanvas
                                    value={JSON.stringify({
                                        reservationId: data.protelReservationID,
                                        confirmationId: data.protelBookingID,
                                        guestId: data.protelGuestID,
                                    })}
                                    size={128} // Tamanho do QR Code
                                />
                            </div>
                        )}

                    </div>
                </>
            ) : (
                <p>Carregando...</p>
            )}
        </main>
    );
}
