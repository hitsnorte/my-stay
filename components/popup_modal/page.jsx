import React from 'react';

const PopUpModal = ({ title, message, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                {/* Header com título à esquerda */}
                <div className="bg-[#E6AC27] rounded-t-2xl p-4">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                </div>

                {/* Conteúdo do modal */}
                <div className="p-4">
                    <p className="text-sm text-gray-600 mt-2">{message}</p>

                    {/* Botão abaixo da mensagem */}
                    <div className="mt-4 text-right">
                        <button
                            className="px-4 py-2 bg-[#F2D593] text-white rounded-xl hover:bg-[#E6AC27] transition"
                            onClick={onClose}
                        >
                            Ok
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopUpModal;
