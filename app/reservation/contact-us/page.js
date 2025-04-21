"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoChevronBackOutline } from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { IoIosCloseCircle } from "react-icons/io";
import axios from "axios"; // Importação do Axios

import en from "../../../public/locales/english/common.json";
import pt from "../../../public/locales/portuguesePT/common.json";

const translations = { en, pt };

import { jwtDecode } from "jwt-decode";

export default function ContactUs() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [propertyID, setPropertyID] = useState(null);
    const [propertyData, setPropertyData] = useState(null);
    const [locale, setLocale] = useState("en"); // Idioma padrão

    useEffect(() => {
        // Verifica o idioma armazenado no localStorage ao carregar a página
        const storedLang = localStorage.getItem("lang");
        if (storedLang) {
            setLocale(storedLang);
        }
    }, []);

    const t = translations[locale];

    useEffect(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const emailParam = urlParams.get("email");
            if (emailParam) {
                setEmail(decodeURIComponent(emailParam));
            }
        }
    }, []);

    useEffect(() => {
        const token = sessionStorage.getItem("reservationToken");
      
        if (!token) {
          router.push("/");
          return;
        }
      
        try {
          const decodedToken = jwtDecode(token);
          if (decodedToken?.propertyID && decodedToken?.resNo) {
            setPropertyID(decodedToken.propertyID);
          }
        } catch (error) {
          console.error("Erro ao decodificar o token:", error);
        }
      }, [router]);
      
      useEffect(() => {
        const fetchPropertyData = async () => {
          if (!propertyID) return;
      
          try {
            const response = await axios.post("/api/get_property_info", {
              propertyID,
            });
            setPropertyData(response.data);
          } catch (err) {
            console.log("Erro ao buscar os dados da propriedade:", err);
          }
        };
      
        fetchPropertyData();
      }, [propertyID]);

    const clearFields = () => {
        setMessage("");
    };

    const handleSubmit = async () => {
        if (!email || !message) {
            alert("Please fill in all fields.");
            return;
        }

        setLoading(true);

        try {
            const token = sessionStorage.getItem("reservationToken"); // Agora buscando no sessionStorage
            if (!token) {
                alert("User not authenticated.");
                return;
            }

            const response = await fetch("/api/send_info_by_email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, message, token }),
            });

            if (response.ok) {
                alert("Email sent successfully!");
                setEmail("");
                setMessage("");
            } else {
                alert("Failed to send email.");
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
        }

        setLoading(false);
    };

    return (
        <main>
            <div className="bg-[#8F857D] flex flex-row justify-between items-center h-12 pl-64 pr-64">
                <IoChevronBackOutline size={20} color="white" onClick={() => router.back()} />
                <p className="font-bold text-white">{t.ContactUs.Title}</p>
                <IoMdRefresh size={20} color="white" onClick={() => window.location.reload()} />
            </div>

            <div className="flex flex-col pl-110 pr-110 mt-8 main-page">
                <div className="flex justify-center">
                    <p>{propertyData?.hotelName}</p>
                </div>
                <div className="flex flex-row gap-2 font-bold text-xl text-[#e6ac27]">
                    <MdEmail size={25} />
                    <p>{t.ContactUs.ContactUs}</p>
                </div>
                <p>{t.ContactUs.ContactUsInfo}</p>
                <p>{t.ContactUs.ContactUsInfo2}</p>
                <p>{t.ContactUs.ContactUsInfo3}</p>

                <div className="bg-[#8F857D] mt-4 rounded-lg">
                    <div className="flex flex-col bg-white m-2 rounded-lg">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="p-2 border rounded-md w-full"
                            placeholder={t.ContactUs.Email}
                        />
                    </div>
                    <div className="bg-white m-2 h-32 rounded-lg">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="p-2 border rounded-md w-full h-full"
                            placeholder={t.ContactUs.TypeYourMessage}
                        ></textarea>
                    </div>
                    <div className="flex flex-row gap-2 items-center m-2 cursor-pointer" onClick={clearFields}>
                        <IoIosCloseCircle size={20} color="white" />
                        <p className="text-white">{t.ContactUs.Clear}</p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-[#e6ac27] text-white mt-4 mb-4 p-3"
                    disabled={loading}
                >
                    {loading ? t.ContactUs.Sending : t.ContactUs.Send}
                </button>
            </div>
        </main>
    );
}
