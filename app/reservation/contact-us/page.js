"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoChevronBackOutline } from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { IoIosCloseCircle } from "react-icons/io";

export default function ContactUs() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const emailParam = urlParams.get("email");
            if (emailParam) {
                setEmail(decodeURIComponent(emailParam)); // ✅ Agora seguro
            }
        }
    }, []);

    const clearFields = () => {
        setMessage("");
    };

    return (
        <main>
            <div className="bg-[#8F857D] flex flex-row justify-between items-center h-12 pl-64 pr-64">
                <IoChevronBackOutline size={20} color="white" onClick={() => router.back()} />
                <p className="font-bold text-white">Contact Us</p>
                <IoMdRefresh size={20} color="white" onClick={() => window.location.reload()} />
            </div>

            <div className="flex flex-col pl-110 pr-110 mt-8 main-page">
                {/* HOTEL INFO */}
                <div className="flex justify-center">
                    <p>Hotel Name</p>
                </div>
                <div className="flex flex-row gap-2 font-bold text-xl text-[#e6ac27]">
                    <MdEmail size={25} />
                    <p>Contact us</p>
                </div>
                <p>How can we enhance your stay? Do you have any additional wishes?</p>
                <p>Dont hesitate to contact the front desk for questions or requests.</p>
                <p>Please enter your email address so that we can get back to you as soon as possible.</p>

                <div className="bg-[#8F857D] mt-4 rounded-lg">
                    <div className="flex flex-col bg-white m-2 rounded-lg">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="p-2 border rounded-md w-full"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="bg-white m-2 h-32 rounded-lg">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="p-2 border rounded-md w-full h-full"
                            placeholder="Type your message here..."
                        ></textarea>
                    </div>
                    <div className="flex flex-row gap-2 items-center m-2 cursor-pointer" onClick={clearFields}>
                        <IoIosCloseCircle size={20} color="white" />
                        <p className="text-white">Clear</p>
                    </div>
                </div>
                <button
                    className="bg-[#e6ac27] text-white mt-4 mb-4 p-3"
                >
                    SEND
                </button>
            </div>
        </main>
    );
}