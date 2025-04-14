"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // Importação do Axios

import { IoChevronBackOutline } from "react-icons/io5";
import { MdArrowForwardIos } from "react-icons/md";
import { FaUsers, FaRegCreditCard } from "react-icons/fa";
import { FaFileSignature } from "react-icons/fa6";

import { jwtDecode } from "jwt-decode";

import "./style.css";

export default function PrepareCheckIn() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [signatureExists, setSignatureExists] = useState(false);
    const router = useRouter();

    const [propertyID, setPropertyID] = useState(null);
    const [profileID, setProfileID] = useState(null);
    const [guestsFetched, setGuestsFetched] = useState(false);
    const [mainGuestData, setMainGuestData] = useState(null);
    const [allGuestData, setAllGuestData] = useState([]);

    useEffect(() => {
        const token = sessionStorage.getItem("reservationToken");

        if (!token) {
            router.push("/");
            return;
        }

        // Decodifica o token e extrai os dados necessários
        let decodedToken = null;
        try {
            decodedToken = jwtDecode(token);
            if (decodedToken?.propertyID && decodedToken?.resNo) {
                setPropertyID(decodedToken.propertyID);
            }
            if (decodedToken?.profileID) {
                setProfileID(decodedToken.profileID);
            }
        } catch (error) {
            console.error("Erro ao decodificar o token:", error);
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
        const savedSignature = sessionStorage.getItem("userSignature");
        setSignatureExists(!!savedSignature);
    }, []);

    const handleSave = async () => {
        if (!signatureExists) {
            alert("Você precisa adicionar a assinatura antes de continuar.");
            return;
        }

        if (!data || !propertyID) return;

        console.log("Dados a serem enviados:", propertyID, data.protelReservationID, data.protelMpeHotel);

        try {
            await axios.post("/api/sysConectorStay/precheckin", {
                protelReservationID: data.protelReservationID,
                protelMpeHotel: data.protelMpeHotel,
                propertyID: propertyID
            });
            alert("Dados enviados com sucesso!");
        } catch (err) {
            console.error("Erro ao enviar dados para o precheckin:", err);
            alert("Ocorreu um erro ao salvar.");
        }
    };

    useEffect(() => {
        const fetchGuestData = async () => {
            try {
                const token = sessionStorage.getItem("reservationToken");

                if (!token || !data?.protelGuestID) {
                    console.warn("Token ou protelGuestID ausente.");
                    return;
                }

                const response = await axios.get(
                    `/api/sysConectorStay/get_guests?reservationToken=${token}&protelGuestID=${data.protelGuestID}`
                );

                const guestData = response.data;

                Object.keys(guestData).forEach((guestID) => {
                    sessionStorage.setItem(guestID, JSON.stringify(guestData[guestID]));
                });

                setGuestsFetched(true);
            } catch (error) {
                console.error("Erro ao buscar dados dos hóspedes:", error);
            }
        };

        if (data?.protelGuestID) {
            fetchGuestData();
        }
    }, [data?.protelGuestID]);

    useEffect(() => {
        if (profileID && guestsFetched) {
            const guestList = [];
            let mainGuestFound = false;

            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                try {
                    const guest = JSON.parse(sessionStorage.getItem(key));
                    if (Array.isArray(guest) && guest.length > 0) {
                        const g = guest[0];
                        guestList.push({ id: key, ...g });

                        if (key === profileID) {
                            setMainGuestData(g);
                            mainGuestFound = true;
                        }
                    }
                } catch (err) {
                    // Não fazer nada, pode ser outro valor
                }
            }

            setAllGuestData(guestList);
            if (!mainGuestFound) {
                console.warn("Hóspede principal não encontrado no sessionStorage.");
            }
        }
    }, [profileID, guestsFetched]);

    const handleGuestClick = (protelGuestID) => {
        const mainGuestID = sessionStorage.getItem("mainGuestID");
    
        if (protelGuestID === "unknown") {
            sessionStorage.removeItem("selectedGuestID");
            sessionStorage.setItem("selectedGuestType", "unknown");
            router.push("./guest-profile");
            return;
        }
    
        sessionStorage.setItem("selectedGuestID", protelGuestID);
    
        if (protelGuestID.toString() === mainGuestID) {
            sessionStorage.setItem("selectedGuestType", "main");
        } else {
            sessionStorage.setItem("selectedGuestType", "additional");
        }
    
        router.push("./guest-profile");
    };    

    const totalGuests = parseInt(data?.adult || 0) + parseInt(data?.child || 0);
    const completedGuests = allGuestData.length;
    const isComplete = completedGuests >= totalGuests;

    return (
        <main>
            {error ? (
                <p className="text-red-500">{error}</p>
            ) : data ? (
                <>
                    <div className="bg-[#8F857D] flex flex-row items-center h-12 pl-64 pr-64 header">
                        <IoChevronBackOutline
                            size={20}
                            color="white"
                            className="cursor-pointer"
                            onClick={() => router.push("./reservation")}
                        />
                        <p className="font-bold text-white flex-grow text-center">Prepare check-in</p>
                    </div>
                    <div className="flex flex-col pl-92 pr-92 mt-4 main-page">
                        <p className="font-bold text-xl text-[#e6ac27]">Your check-in</p>
                        <div className="flex flex-row items-center gap-2 mt-10 mb-2">
    <FaUsers size={30} color="#e6ac27" />
    <div className="flex flex-row gap-2 items-center">
        <p className="font-bold text-xl text-[#e6ac27]">Guests</p>
        <p className="text-xs">({isComplete ? "Complete" : "Incomplete"})</p>
    </div>
</div>

<p>By entering some of your personal and payment data in advance we will be able to check you in much faster and more comfortably on the day of your arrival.</p>

<div className="flex flex-col">
    {/* Hóspede principal */}
{mainGuestData && (
    <div
        className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 border-b-2 border-white cursor-pointer"
        onClick={() => handleGuestClick(mainGuestData.protelGuestID)}
    >
        <p>
            {`${mainGuestData.protelsalutation || ""} ${mainGuestData.protelGuestFirstName || ""} ${mainGuestData.protelGuestLastName || ""}`}
        </p>
        <MdArrowForwardIos />
    </div>
)}

{/* Hóspedes adicionais */}
{allGuestData
    .filter((g) => g.id !== profileID)
    .map((guest, index) => (
        <div
            key={guest.id || index}
            className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 border-b-2 border-white cursor-pointer"
            onClick={() => handleGuestClick(guest.protelGuestID)}
        >
            <p>
                {`${guest.protelsalutation || ""} ${guest.protelGuestFirstName || ""} ${guest.protelGuestLastName || ""}`}
            </p>
            <MdArrowForwardIos />
        </div>
    ))}

{/* Unknown guests */}
{[...Array(totalGuests - allGuestData.length)].map((_, index) => (
    <div
        key={`unknown-${index}`}
        className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 border-b-2 border-white cursor-pointer"
        onClick={() => handleGuestClick("unknown")}
    >
        <p>Unknown guest</p>
        <MdArrowForwardIos />
    </div>
))}
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
                            onClick={handleSave}
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