'use client';

import { useState } from "react";
import { EnrollmentModal } from "./enrollment-modal"

export const PromoModalWrapper = () => {
    const [openValentineModal, setOpenValentineModal] = useState(false);
    return (
        <div>
            <EnrollmentModal hasPicture isOpen={openValentineModal} onClose={() => setOpenValentineModal(false)}>
                <div className='w-full'>
                    <h2 id="modal-title" className="text-xl font-bold text-gray-900 md:text-2xl">
                        4 урока по&nbsp;вокалу <br />для двоих +&nbsp;Запись песни
                    </h2>
                    <div className="text-right text-2xl font-bold text-gray-900 md:text-3xl">
                        18999 ₽
                    </div>
                </div>
            </EnrollmentModal>
             <div onClick={() => setOpenValentineModal(true)} className="hover:text-red-400">
                Акции
            </div>
        </div>
    )
}