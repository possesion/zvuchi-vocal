'use client';

import { QuizButton } from '../common/quiz-button';
import { QuizModalContent } from '../modals/quiz-modal-content';
import { QuizProvider } from '../modals/quiz-context';

export function EnrollmentSection() {
 
    return (
        <QuizProvider>
            <section id="study" className="bg-muted/50">
                <div className='sm:hidden'>
                    <QuizButton>
                        <button
                            className='group relative bg-radial-[at_40%] from-violet-800 to-violet-950 to-80% shadow-[0_0_45px_5px] shadow-purple-900 mb-4 cursor-pointer overflow-hidden rounded-sm px-9 py-3 text-2xl font-bold text-white transition-all duration-300 hover:scale-105'>
                            <span className="relative z-10 flex items-center justify-center gap-2">Пройди опрос и получи скидку</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-700 group-hover:translate-x-full" />
                        </button>
                    </QuizButton>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col-reverse gap-x-2 ">
                        <div className="hidden sm:block sm:bg-white md:w-[630px] sm:h-[630px] shadow-md rounded-sm">
                            <QuizModalContent className="h-full pt-8 pb-6 px-4 md:p-6 flex flex-col justify-between" />
                        </div>
                    </div>
                </div>
            </section>
        </QuizProvider>
    )
}
