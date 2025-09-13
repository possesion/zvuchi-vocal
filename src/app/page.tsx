import Image from 'next/image'
import { instructors } from './constants'
import '@radix-ui/themes/styles.css'
import { Programs } from '@/components/ui/programs'
import { FeatureList } from '@/components/ui/feature-list'
import { Header } from '@/components/ui/header'
import { Contacts } from '@/components/ui/contacts'
// import { Gallery } from '@/components/ui/gallery'
import { EnrollmentSection } from '@/components/ui/enrollment-section'
import { VocalInstructor } from '@/components/ui/vocal-instructor'

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col font-manrope">
            <Header />
            <main className="flex-1">
                <section className="relative main-bg">
                    <div className="relative z-10 py-16 md:py-24 lg:py-32">
                        <div className="pl-1 md:pl-4">
                            <h1 className="mb-4 text-white text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl lg:mb-8">
                                Твой голос заслуживает быть услышанным{' '}
                                <span className="text-primary">— ЗВУЧИ!</span>
                            </h1>
                            <EnrollmentSection main />
                        </div>
                    </div>
                </section>
                <div className="px-2 md:px-4">
                    <FeatureList />
                    {/* Instructors Section */}
                    <section
                        id="instructors"
                        className="py-12 md:py-16 bg-muted/50"
                    >
                        <div className="flex flex-col items-center text-center mb-8 md:mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                                Наши педагоги
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 grid-off sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {instructors.map((instructor) => {
                                return (
                                    <VocalInstructor
                                        key={instructor.name}
                                        instructor={instructor}
                                    />
                                )
                            })}
                        </div>
                    </section>
                    {/* Programs Section */}
                    <section id="subscriptions" className="py-12 md:py-16">
                        <div className="flex flex-col items-center text-center mb-8 md:mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                                Наши абонементы
                            </h2>
                            <p className="text-muted-foreground max-w-2xl">
                                От джаза до рока — учим петь в любом жанре!
                                Индивидуальный подход для всех уровней: от нуля
                                до профессионала.
                            </p>
                        </div>
                        <Programs />
                    </section>

                    <EnrollmentSection />
                    {/* Testimonials Section */}
                    {/* <section id="testimonials" className="py-12 md:py-16">
              <div className="flex flex-col items-center text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Истории успеха</h2>
                <p className="text-muted-foreground max-w-2xl">
                Реальные истории студентов: впечатляющие изменения после обучения у нас
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="brightness-97 bg-background p-4 md:p-6 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-full mr-4">
                        <Image
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.program}</p>
                      </div>
                    </div>
                    <p className="italic text-muted-foreground mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="h-5 w-5 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
          </section> */}

                    {/*<Gallery />*/}
                    <section>
                        <Contacts />
                    </section>
                    {/* Social Networks Section */}
                    <section className="py-12 md:py-16">
                        <div className="flex flex-col items-center text-center mb-8 md:mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                                Наши социальные сети
                            </h2>
                            <p className="text-muted-foreground max-w-2xl">
                                Следите за нашими новостями, мастер-классами и
                                вдохновляющими историями
                            </p>
                        </div>
                        <div className="flex justify-center gap-x-8 md:gap-x-12">
                            <a
                                href="https://www.instagram.com/zvuchi.vocal?igsh=NG40M3dwNnQ4Z21m&utm_source=qr"
                                target="blank"
                                className="group flex flex-col items-center text-center transition-transform hover:scale-110"
                            >
                                <Image
                                    width={40}
                                    height={40}
                                    src="socials/instagram.svg"
                                    alt="instagram"
                                />
                                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                    Instagram
                                </span>
                            </a>

                            <a
                                href="https://t.me/zvuchivocal"
                                target="blank"
                                className="group flex flex-col items-center text-center transition-transform hover:scale-110"
                            >
                                <Image
                                    width={40}
                                    height={40}
                                    src="socials/telegram.svg"
                                    alt="tg"
                                />
                                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                    Telegram
                                </span>
                            </a>

                            <a
                                href="https://vk.com/zvuchi.vocal"
                                target="blank"
                                className="group flex flex-col items-center text-center transition-transform hover:scale-110"
                            >
                                <Image
                                    width={42}
                                    height={42}
                                    src="socials/vk.svg"
                                    alt="vk"
                                />
                                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                    VK
                                </span>
                            </a>
                            <a
                                href="https://www.tiktok.com/@zvuchi.vocal?_t=ZS-8yqbaCZDVqb&_r=1"
                                target="blank"
                                className="group flex flex-col items-center text-center transition-transform hover:scale-110"
                            >
                                <Image
                                    width={42}
                                    height={42}
                                    src="socials/tiktok.svg"
                                    alt="vk"
                                />
                                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                    TikTok
                                </span>
                            </a>
                        </div>
                    </section>
                </div>
            </main>
            <footer className="border-t py-2 md:py-4 bg-foreground supports-[backdrop-filter]:bg-foreground/90">
                <div className="w-full flex flex-col justify-center items-center">
                    <div className="flex items-center gap-1">
                        <Image
                            src="/zvuchi-cropped.png"
                            width={100}
                            height={38}
                            alt="logo"
                        />
                        <p className="text-center text-sm text-white">
                            © {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
