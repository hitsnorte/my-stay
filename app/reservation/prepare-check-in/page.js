"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // Importação do Axios

import { IoChevronBackOutline } from "react-icons/io5";
import { MdArrowForwardIos } from "react-icons/md";
import { FaUsers, FaRegCreditCard } from "react-icons/fa";
import { FaFileSignature } from "react-icons/fa6";

import { jwtDecode } from "jwt-decode";

import { generatePDFTemplate } from "@/components/pages/generatePDFTemplate/page";

import en from "../../../public/locales/english/common.json";
import pt from "../../../public/locales/portuguesePT/common.json";

import "./style.css";

import pako from "pako";

const translations = { en, pt };

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
    const [additionalGuests, setAdditionalGuests] = useState([]);

    const [propertyInfo, setPropertyInfo] = useState(null);

    const [locale, setLocale] = useState("en"); // Idioma padrão

    // Esse useEffect chama a API quando propertyID estiver definido
    useEffect(() => {
        const fetchPropertyInfo = async () => {
            try {
                const response = await fetch("/api/get_property_info", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ propertyID }),
                });

                if (!response.ok) {
                    throw new Error("Erro ao buscar informações da propriedade");
                }

                const data = await response.json();
                setPropertyInfo(data); // ou trate os dados conforme necessário
            } catch (error) {
                console.error("Erro ao buscar informações da propriedade:", error);
            }
        };

        if (propertyID) {
            fetchPropertyInfo();
        }
    }, [propertyID]);

    useEffect(() => {
        // Verifica o idioma armazenado no localStorage ao carregar a página
        const storedLang = localStorage.getItem("lang");
        if (storedLang) {
            setLocale(storedLang);
        }
    }, []);

    const t = translations[locale];

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
        if (!mainGuestData) {
            alert("Erro: Dados do hóspede principal não encontrados.");
            return;
        }
        if (!data || !propertyID) return;

        console.log("Dados a serem enviados:", propertyID, data.protelReservationID, data.protelMpeHotel);

        try {
            // ⚡ Aqui você chama a função que gera o PDF
            const pdfBase64 = await generatePDFTemplate({
                propertyID,
                reservationData: data,
                mainGuestData,
                propertyInfo
            });

            console.log(pdfBase64);

            // Comprime o base64 como Uint8Array
            const compressed = pako.deflate(pdfBase64);

            // Codifica como base64 para enviar no JSON
            const compressedBase64 = btoa(String.fromCharCode(...compressed));
            console.log("base 64 codificado: ", compressedBase64);

            // Envia como string comprimida (e marca no header ou payload que está comprimido)
            await axios.post("/api/sysConectorStay/precheckin", {
                protelReservationID: data.protelReservationID,
                protelMpeHotel: data.protelMpeHotel,
                propertyID: propertyID,
                pdfBase64: compressedBase64,
            });

            alert("Dados enviados com sucesso!");
        } catch (err) {
            console.error("Erro ao criar o PDF ou enviar os dados:", err);
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

    useEffect(() => {
        if (!data || !data.protelGuestID) return;

        const mainGuestID = data.protelGuestID.toString();
        const storedGuests = [];

        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);

            if (
                key !== "reservationToken" &&
                key !== "selectedGuestName" &&
                key !== mainGuestID
            ) {
                try {
                    const guestArray = JSON.parse(sessionStorage.getItem(key));
                    if (Array.isArray(guestArray) && guestArray.length > 0) {
                        storedGuests.push(guestArray[0]);
                    }
                } catch (err) {
                    console.warn("Erro ao parsear guest no sessionStorage:", err);
                }
            }
        }

        setAdditionalGuests(storedGuests);
    }, [data]);

    useEffect(() => {
        if (data?.protelGuestID) {
            const mainGuestID = data.protelGuestID.toString();
            const storedGuest = sessionStorage.getItem(mainGuestID);

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
                console.warn("Nenhum dado encontrado no sessionStorage para o mainGuestID:", mainGuestID);
            }
        }
    }, [data?.protelGuestID]);

    if (!data) return null;

    const totalGuests = parseInt(data.adult) + parseInt(data.child);
    const remainingUnknowns = totalGuests - 1 - additionalGuests.length;

    const handleGuestClick = (guestFullName) => {
        sessionStorage.setItem("selectedGuestName", guestFullName);

        const mainGuestFullName = `${data.protelGuestFirstName} ${data.protelGuestLastName}`;

        if (guestFullName === "Unknown guest") {
            sessionStorage.removeItem("selectedGuestID");
            sessionStorage.setItem("selectedGuestType", "unknown");
            router.push("./guest-profile");
            return;
        }

        if (guestFullName === mainGuestFullName) {
            sessionStorage.removeItem("selectedGuestID");
            sessionStorage.setItem("selectedGuestType", "main");
            router.push("./guest-profile");
            return;
        }

        // Caso seja um hóspede adicional
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key !== "reservationToken" && key !== "selectedGuestName" && key !== "selectedGuestType") {
                try {
                    const guestArray = JSON.parse(sessionStorage.getItem(key));
                    if (Array.isArray(guestArray)) {
                        const guest = guestArray[0];
                        const fullName = `${guest.protelGuestFirstName} ${guest.protelGuestLastName}`;
                        if (fullName === guestFullName) {
                            sessionStorage.setItem("selectedGuestID", key);
                            sessionStorage.setItem("selectedGuestType", "additional");
                            break;
                        }
                    }
                } catch (e) {
                    console.warn("Erro ao ler hóspede do sessionStorage", e);
                }
            }
        }

        router.push("./guest-profile");
    };

    // const isComplete = completedGuests >= totalGuests;

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
                            onClick={() => {
                                const token = sessionStorage.getItem("reservationToken");
                                if (token) {
                                    router.push(`./reservation?token=${token}`);
                                }
                            }}
                        />
                        <p className="font-bold text-white flex-grow text-center">{t.PrepareCheckIn.Title}</p>
                    </div>
                    <div className="flex flex-col pl-92 pr-92 mt-4 main-page">
                        <p className="font-bold text-xl text-[#e6ac27]">{t.PrepareCheckIn.YourCheckIn}</p>
                        <div className="flex flex-row items-center gap-2 mt-10 mb-2">
                            <FaUsers size={30} color="#e6ac27" />
                            <div className="flex flex-row gap-2 items-center">
                                <p className="font-bold text-xl text-[#e6ac27]">{t.PrepareCheckIn.Guests}</p>
                                {/* <p className="text-xs">({isComplete ? "Complete" : "Incomplete"})</p> */}
                            </div>
                        </div>

                        <p>{t.PrepareCheckIn.CheckInInfo}</p>

                        <div className="flex flex-col">
                            {/* Hóspede principal */}
                            <div className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 mt-4 border-b-2 border-white">
                                <p>
                                    {mainGuestData
                                        ? `${mainGuestData.protelGuestFirstName} ${mainGuestData.protelGuestLastName}`
                                        : `${data.protelGuestFirstName} ${data.protelGuestLastName}`}
                                </p>
                                <MdArrowForwardIos
                                    onClick={() =>
                                        handleGuestClick(
                                            `${mainGuestData ? mainGuestData.protelGuestFirstName : data.protelGuestFirstName} ${mainGuestData ? mainGuestData.protelGuestLastName : data.protelGuestLastName}`
                                        )
                                    }
                                />
                            </div>
                            {/* Hóspedes com dados do sessionStorage */}
                            {additionalGuests.map((guest, index) => (
                                <div
                                    key={guest.protelGuestID || index}
                                    className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 border-b-2 border-white"
                                >
                                    <p>{guest.protelGuestFirstName} {guest.protelGuestLastName}</p>
                                    <MdArrowForwardIos
                                        onClick={() =>
                                            handleGuestClick(`${guest.protelGuestFirstName} ${guest.protelGuestLastName}`)
                                        }
                                    />
                                </div>
                            ))}

                            {/* Unknown guests restantes */}
                            {remainingUnknowns > 0 &&
                                [...Array(remainingUnknowns)].map((_, index) => (
                                    <div
                                        key={`unknown-${index}`}
                                        className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 border-b-2 border-white"
                                    >
                                        <p>Unknown guest</p>
                                        <MdArrowForwardIos onClick={() => handleGuestClick("Unknown guest")} />
                                    </div>
                                ))}
                        </div>
                        <div className="flex flex-row items-center gap-2 mt-10">
                            <FaRegCreditCard size={30} color="#e6ac27" />
                            <div className="flex flex-row gap-2 items-center">
                                <p className="font-bold text-xl text-[#e6ac27]">{t.PrepareCheckIn.PaymentData}</p>
                                <p className="text-xs">{t.PrepareCheckIn.Optional}</p>
                            </div>
                        </div>
                        <div className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 mt-4 opacity-50 cursor-not-allowed pointer-events-none">
                            <p className="text-gray-600">{t.PrepareCheckIn.CreditCard}</p>
                            <MdArrowForwardIos className="text-gray-600" />
                        </div>
                        <div className="flex flex-row items-center gap-2 mt-10">
                            <FaFileSignature size={30} color="#e6ac27" />
                            <div className="flex flex-row gap-2 items-center">
                                <p className="font-bold text-xl text-[#e6ac27]">{t.PrepareCheckIn.Signature}</p>
                                <p className={`text-xs ${signatureExists ? "text-green-500" : "text-red-500"}`}>
                                    {signatureExists ? t.PrepareCheckIn.Done : t.PrepareCheckIn.Missing}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-row justify-between items-center bg-[#DECBB7] p-4 mt-4">
                            <p>{t.PrepareCheckIn.AddSignature}</p>
                            <MdArrowForwardIos onClick={() => router.push("./signature")} className="cursor-pointer" />
                        </div>
                        {/* SAVE */}
                        <button
                            onClick={handleSave}
                            disabled={!signatureExists} // Desabilita o botão quando a assinatura não estiver presente
                            className={`bg-[#e6ac27] text-white mt-4 mb-4 p-3 ${!signatureExists ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {t.PrepareCheckIn.Save}
                        </button>
                    </div>
                </>
            ) : (
                <p>Carregando...</p>
            )}
        </main>
    )
}