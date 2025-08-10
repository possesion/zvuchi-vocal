import Image from "next/image";
import Link from "next/link"
import { MusicIcon, Users2Icon, AwardIcon, CalendarIcon, MicIcon, BookOpenIcon } from "lucide-react"
// import { Button } from "@radix-ui/themes";
import MobileMenu from "@/components/mobile-menu"
import { events, instructors, programs, testimonials } from "./constants";
import "@radix-ui/themes/styles.css";
import { Programs } from "@/components/ui/programs";
import { FeatureList } from "@/components/ui/feature-list";
import { Header } from "@/components/ui/header";
import { Contacts } from "@/components/ui/contacts";
// import Logo from '../../'


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col font-manrope">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 z-0">
            <Image
              src="/bg.jpg?height=800&width=1600"
              alt="Students singing"
              fill
              className="object-cover brightness-[0.4]"
              priority
            />
          </div>
          <div className="container relative z-10 py-16 md:py-24 lg:py-32">
            <div className="max-w-2xl pl-1 space-y-4 md:space-y-6 text-white md:pl-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Твой голос заслуживает быть услышанным <span className="text-primary">— ЗВУЧИ!</span>
              </h1>
              {/* <p className="text-base md:text-lg lg:text-xl text-gray-200">
                Discover your vocal potential with expert instruction tailored to your unique voice and style. From
                beginners to professionals, we help you reach new heights.
              </p> */}
              {/* <div className="flex flex-col sm:flex-row gap-4">
                <button size="lg" className="font-medium w-full sm:w-auto">
                  Start Your Journey
                </button>
                <button
                  variant="outline"
                  size="lg"
                  className="font-medium text-white border-white hover:text-white hover:bg-white/20 w-full sm:w-auto"
                >
                  Explore Programs
                </button>
              </div> */}
            </div>
          </div>
        </section>
        <div className='px-1 md:px-4'>
          {/* Features Section */}
          <FeatureList />

          {/* Social Networks Section */}
          <section className="py-12 md:py-16">
            <div className="flex flex-col items-center text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Наши социальные сети</h2>
              <p className="text-muted-foreground max-w-2xl">
                Следите за нашими новостями, мастер-классами и вдохновляющими историями
              </p>
            </div>
            <div className="flex justify-center space-x-8 md:space-x-12">
              <Link href="#" className="group flex flex-col items-center text-center transition-transform hover:scale-110">
                {/* <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-shadow"> */}
                <Image width={40} height={40} src='instagram.svg' alt='instagram' />
                {/* </div> */}
                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Instagram</span>
              </Link>

              <Link href="#" className="group flex flex-col items-center text-center transition-transform hover:scale-110">
                <Image width={40} height={40} src='telegram.svg' alt='tg' />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Telegram</span>
              </Link>

              <Link href="#" className="group flex flex-col items-center text-center transition-transform hover:scale-110">
                <Image width={40} height={40} src='vk.svg' alt='vk' />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">VK</span>
              </Link>
            </div>
          </section>

          {/* Instructors Section */}
          <section id="instructors" className="py-12 md:py-16 bg-muted/50">
            <div className="flex flex-col items-center text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Наши педагоги</h2>
              {/* <p className="text-muted-foreground max-w-2xl">
                  EVT, сертификаты о прохождении курсов знаменитых вокальных коучей. Дипломы об образовании 
                </p> */}
            </div>
            <div className="grid grid-cols-1 grid-off sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {instructors.map((instructor) => (
                <div key={instructor.name} className="group flex flex-col items-center text-center">
                  <div className="relative h-36 w-36 sm:h-48 sm:w-48 overflow-hidden rounded-full mb-4">
                    <Image
                      src={instructor.image || "/placeholder.svg"}
                      alt={instructor.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold">{instructor.name}</h3>
                  <p className="text-primary mb-2">{instructor.specialty}</p>
                  <p className="text-sm text-muted-foreground">{instructor.bio}</p>
                </div>
              ))}
            </div>
            {/* </div> */}
          </section>

          {/* Programs Section */}
          <section id="subscriptions" className="py-12 md:py-16">
            <div className="flex flex-col items-center text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Наши абонементы</h2>
              <p className="text-muted-foreground max-w-2xl">
                От джаза до рока — учим петь в любом жанре!
                Индивидуальный подход для всех уровней: от нуля до профессионала.
              </p>
            </div>
            <Programs />
          </section>

          {/* Testimonials Section */}
          <section id="testimonials" className="py-12 md:py-16">
            <div className="container">
              <div className="flex flex-col items-center text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Истории успеха</h2>
                <p className="text-muted-foreground max-w-2xl">
                  Hear from our students about their transformative experiences at Harmony Vocal Academy.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-background p-4 md:p-6 rounded-lg shadow-sm">
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
                    <p className="italic text-muted-foreground mb-4">"{testimonial.quote}"</p>
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
            </div>
          </section>

          {/* Events Section */}
          {/* <section id="events" className="py-12 md:py-16 bg-muted/50">
            <div className="container">
              <div className="flex flex-col items-center text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Upcoming Events</h2>
                <p className="text-muted-foreground max-w-2xl">
                  Join us for performances, workshops, and masterclasses throughout the year.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {events.map((event, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row bg-background rounded-lg overflow-hidden shadow-sm"
                  >
                    <div className="bg-primary/10 p-4 flex flex-row sm:flex-col items-center justify-center sm:min-w-[100px]">
                      <span className="text-2xl font-bold text-primary mr-2 sm:mr-0">{event.day}</span>
                      <span className="text-sm text-muted-foreground">{event.month}</span>
                    </div>
                    <div className="p-4 md:p-6 flex-1">
                      <h3 className="text-lg md:text-xl font-bold mb-2">{event.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>{event.time}</span>
                      </div>
                      <p className="text-muted-foreground mb-4">{event.description}</p>
                      <button variant="outline" size="sm">
                        Register
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-6 md:mt-8">
                <button>View All Events</button>
              </div>
            </div>
          </section> */}


          {/* Contact Section */}
          {/* <section id="contact" className="py-12 md:py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Contact Us</h2>
                <p className="text-muted-foreground mb-6 md:mb-8">
                  Have questions about our programs or want to schedule a visit? Reach out to us and our team will be
                  happy to assist you.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold">Address</h3>
                      <p className="text-muted-foreground">123 Music Avenue, Harmony City, HC 12345</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold">Phone</h3>
                      <p className="text-muted-foreground">(555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold">Email</h3>
                      <p className="text-muted-foreground">info@harmonyvocalacademy.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold">Hours</h3>
                      <p className="text-muted-foreground">Monday - Friday: 9am - 8pm</p>
                      <p className="text-muted-foreground">Saturday: 10am - 4pm</p>
                      <p className="text-muted-foreground">Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <form className="space-y-4 bg-muted/50 p-4 md:p-6 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="first-name" className="text-sm font-medium">
                        First name
                      </label>
                      <input
                        id="first-name"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="last-name" className="text-sm font-medium">
                        Last name
                      </label>
                      <input
                        id="last-name"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="interest" className="text-sm font-medium">
                      I'm interested in
                    </label>
                    <select
                      id="interest"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled selected>
                        Select a program
                      </option>
                      <option value="beginner">Beginner Vocal Training</option>
                      <option value="advanced">Advanced Vocal Techniques</option>
                      <option value="performance">Performance Coaching</option>
                      <option value="recording">Studio Recording</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <textarea
                      id="message"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about your vocal goals..."
                    />
                  </div>
                  <button type="submit" className="w-full">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section> */}
          <section>
            <Contacts />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-2 md:py-4 bg-muted/30">
        {/* <div className="px-1 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 md:px-4"> */}
        <div className="w-full flex flex-col justify-center items-center">
          <div className="flex space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span className="sr-only">Instagram</span>
            </Link>

          </div>
          <div className="flex items-center gap-1">
            <Image
              src='/zvuchi-cropped.png'
              width={100}
              height={38}
              alt='logo'
            />
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()}
            </p>
          </div>


        </div>

        {/* </div> */}

      </footer>
    </div>
  );
}
