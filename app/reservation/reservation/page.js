"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

// Importação de ícones
import { IoChevronBackOutline } from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";
import { FaCalendarAlt, FaRegCalendarCheck } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

import { jwtDecode } from "jwt-decode";

import en from "../../../public/locales/english/common.json";
import pt from "../../../public/locales/portuguesePT/common.json";

import "./style.css";

const translations = { en, pt };

function ReservationContent() {
    const router = useRouter();
    const [token, setToken] = useState(null);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [stayRecord, setStayRecord] = useState("");
    const [profileID, setProfileID] = useState(null);
    const [mainGuestData, setMainGuestData] = useState(null);
    const [guestsFetched, setGuestsFetched] = useState(false);

    // Novo estado para o idioma
    const [locale, setLocale] = useState("en");

    // Carrega o idioma do localStorage na primeira renderização
    useEffect(() => {
        const savedLocale = localStorage.getItem("lang");
        if (savedLocale && ["en", "pt"].includes(savedLocale)) {
            setLocale(savedLocale);
        }
    }, []);

    // Traduções com base no idioma
    const t = translations[locale];

    const handleChangeLanguage = (e) => {
        const selectedLang = e.target.value;
        setLocale(selectedLang); // Atualiza o estado
        localStorage.setItem("lang", selectedLang); // Salva no localStorage
    };

    useEffect(() => {
        // Recupera o token da URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get("token");

        // Se não houver token na URL, redireciona para a página inicial
        if (!urlToken) {
            router.push("/");
            return;
        }

        // Armazenar o token no sessionStorage
        sessionStorage.setItem("reservationToken", urlToken);
        setToken(urlToken);

        // Decodificar o token e extrair o profileID
        try {
            const decoded = jwtDecode(urlToken);

            if (decoded?.profileID) {
                setProfileID(decoded.profileID); // salva no estado
                sessionStorage.setItem("mainGuestID", decoded.profileID); // opcional
                console.log("ProfileID extraído:", decoded.profileID);
            } else {
                console.warn("profileID não encontrado no token.");
            }
        } catch (err) {
            console.error("Erro ao decodificar token:", err);
            router.push("/");
            return;
        }

        // Faz a requisição para buscar os dados da reserva usando o token
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/get_reservation?token=${urlToken}`);
                setStayRecord(response.data.stayID);
                setData(JSON.parse(response.data.requestBody));
            } catch (err) {
                setError("Erro ao buscar os dados da reserva");
            }
        };

        fetchData();
    }, [router]);

    useEffect(() => {
        const fetchGuestData = async () => {
            try {
                const token = sessionStorage.getItem("reservationToken");

                if (!token || !data?.protelGuestID) {
                    console.warn("Token ou protelGuestID ausente.");
                    return;
                }

                // Função auxiliar para buscar e armazenar um hóspede
                const fetchAndStoreGuest = async (guestID) => {
                    try {
                        const response = await axios.get(
                            `/api/sysConectorStay/get_guests?reservationToken=${token}&protelGuestID=${guestID}`
                        );
                        const guestData = response.data;
                        Object.keys(guestData).forEach((id) => {
                            sessionStorage.setItem(id, JSON.stringify(guestData[id]));
                        });
                        console.log(`Hóspede ${guestID} armazenado no sessionStorage:`, guestData);
                    } catch (err) {
                        console.error(`Erro ao buscar dados do hóspede ${guestID}:`, err);
                    }
                };

                // Buscar dados do hóspede principal
                await fetchAndStoreGuest(data.protelGuestID);

                // Se houver companions, buscar dados deles também
                if (Array.isArray(data.companions) && data.companions.length > 0) {
                    for (const companion of data.companions) {
                        if (companion.protelGuestID) {
                            await fetchAndStoreGuest(companion.protelGuestID);
                        }
                    }
                }

                setGuestsFetched(true);

            } catch (error) {
                console.error("Erro ao buscar dados dos hóspedes:", error);
            }
        };

        fetchGuestData();
    }, [data?.protelGuestID, data?.companions]);


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

    useEffect(() => {
        if (profileID && guestsFetched) {
            const storedGuest = sessionStorage.getItem(profileID);
            if (storedGuest) {
                try {
                    const guestArray = JSON.parse(storedGuest);
                    if (Array.isArray(guestArray) && guestArray.length > 0) {
                        setMainGuestData(guestArray[0]);
                    }
                } catch (err) {
                    console.error("Erro ao processar dados do hóspede principal:", err);
                }
            } else {
                console.warn("Nenhum hóspede encontrado no sessionStorage para o profileID:", profileID);
            }
        }
    }, [profileID, guestsFetched]);

    return (
        <main className="bg-[#F7F0F5] min-h-screen w-full">
            {error ? (
                <p className="text-red-500">{error}</p>
            ) : data ? (
                <>
                    <div className="bg-[#8F857D] flex flex-row justify-between items-center h-12 pl-64 pr-64 header">
                        <IoChevronBackOutline size={20} color="white" onClick={() => router.push("/")} />
                        <p className="font-bold text-white">{t.Reservation.Reservation} {data.protelBookingID}</p>
                        <IoMdRefresh size={20} color="white" onClick={() => window.location.reload()} />
                    </div>
                    <div className="h-12 pl-64 pr-64 -mb-5 text-right">
                        <select
                            className="w-12 h-8 text-right bg-transparent outline-none cursor-pointer"
                            value={locale}
                            onChange={handleChangeLanguage}
                        >
                            <option value="en">en</option>
                            <option value="pt">pt</option>
                        </select>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <h1 className="text-2xl font-bold flex justify-center mt-4">
                            {mainGuestData
                                ? `${mainGuestData.protelGuestFirstName} ${mainGuestData.protelGuestLastName}`
                                : `${data.protelGuestFirstName} ${data.protelGuestLastName}`}
                        </h1>
                        <div className="flex flex-row gap-4 items-center mt-4">
                            <div className="flex flex-row items-center font-bold">
                                <p className="text-5xl">{checkIn.day}</p>
                                <div className="text-left">
                                    <p>{checkIn.weekDay}</p>
                                    <p>{checkIn.month}</p>
                                </div>
                            </div>
                            <p>{numNights} {t.Reservation.Nights}</p>
                            <div className="flex flex-row items-center font-bold">
                                <div className="text-right">
                                    <p>{checkOut.weekDay}</p>
                                    <p>{checkOut.month}</p>
                                </div>
                                <p className="text-5xl">{checkOut.day}</p>
                            </div>
                        </div>
                        <div className="flex flex-row gap-2 items-center text-[#8F857D] mt-4">
                            <MdEmail />
                            <a href={`./contact-us?email=${encodeURIComponent(data?.email)}`} className="font-bold">{t.Reservation.ContactUs}</a>
                            <MdEmail />
                        </div>
                        <div className="flex justify-center mt-4">
                            <div className="flex flex-row gap-6 cards-display">
                                <div
                                    className="flex flex-col items-center justify-center gap-4 border border-gray-800 p-6 rounded-lg bg-[#DECBB7] w-48 h-48 text-center text-sm cursor-pointer cards"
                                    onClick={() => router.push("./details")}
                                >
                                    <FaCalendarAlt size={35} />
                                    <p className="uppercase">{t.Reservation.Reservation}</p>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-4 border border-gray-800 p-6 rounded-lg bg-[#DECBB7] w-48 h-48 text-center text-sm cursor-pointer cards"
                                    onClick={() => router.push("./prepare-check-in")}
                                >
                                    <FaRegCalendarCheck size={35} />
                                    <p className="uppercase">{t.Reservation.CheckIn}</p>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-4 border border-gray-800 p-6 rounded-lg bg-[#8F857D] w-48 h-48 text-center font-bold text-sm text-white cards">
                                    <p className="uppercase">{t.Reservation.CheckInInfo}</p>
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
