import { StarIcon } from "lucide-react"

export const programs = [
    {
      icon: <StarIcon color='var(--brand)' className="h-8 w-8" />,
      title: "Базовый",
      description: "Идеально для тех, кто только начинает свой путь в вокале",
      features: [
        "Количество занятий – 4 (месяц)",
        "Длительность урока - 55 минут",
        "Бесплатная заморозка абонемента на 1 неделю",
      ],
      price: "Стоимость – 11600 руб."
    },
    {
      icon: <div className="flex gap-1">{[1, 2].map((id) => (<StarIcon key={id} color='var(--brand)' className="h-8 w-8" />))}</div>,
      title: "Продвинутый",
      description: "Подходит для получения и запрепления новых знаний.",
      features: [
        "Количество занятий – 6 (месяц)",
        "Длительность урока - 55 минут",
        "Бесплатная заморозка абонемента на 1 неделю",
      ],
      price: "Стоимость – 16800 руб."
    },
    {
      icon: <div className="flex gap-1">{[1,2,3].map((id) => (<StarIcon key={id} color='var(--brand)' className="h-8 w-8" />))}</div>,
      title: "Король джаза",
      description: "Для опытных исполнителей, которые хотят отточить свою технику",
      features: [
        "Количество занятий – 8 (месяц)",
        "Длительность урока - 55 минут",
        "Бесплатная заморозка абонемента на 1 неделю",
      ],
      price: "Стоимость – 21600 руб."
    },
    {
      icon: <StarIcon color='var(--brand)' fill='var(--brand)' className="h-8 w-8" />,
      title: "Результативный",
      description: "Позволяет составить план развития и подготовить репертуар",
      features: [
        "Количество занятий – 24 (полугодовой)",
        "Длительность урока - 55 минут",
        "Бесплатная заморозка – 21 день",
      ],
      price: "Стоимость – 63600 руб."
    },
    {
      icon: <div className="flex gap-1">{[1, 2].map((id) => (<StarIcon key={id} color='var(--brand)' fill='var(--brand)' className="h-8 w-8" />))}</div>,
      title: "Эффективный",
      description: "Отточите свои навыки до совершенства!",
      features: [
        "Количество занятий – 36 (полугодовой)",
        "Длительность урока - 55 минут",
        "Бесплатная заморозка – 21 день",
      ],
      price: "Стоимость – 94700 руб."
    },
  ]
  
 export const instructors = [
    {
      name: "Валерия Ковшова",
      specialty: "Опера, Джаз, эстрадный вокал, импровизация",
      bio: "Оперная дива → вокальный тренер. 15 лет учит безупречной классической технике и мастерству управления дыханием..",
      image: "/valeria/lera.png?height=300&width=300",
    },
    {
      name: "Мария Биттер",
      specialty: "Джаз, Поп, Рок",
      bio: "Профессиональный артист звукозаписи, работавший с крупнейшими лейблами. Эксперт в современных вокальных стилях и студийных технологиях.",
      image: "/maria.jpg?height=300&width=300",
    },
    // {
    //   name: "Elena Rodriguez",
    //   specialty: "Jazz & Soul",
    //   bio: "Jazz vocalist with international performance experience. Teaches improvisation, scatting, and soul techniques.",
    //   image: "/placeholder.svg?height=300&width=300",
    // },
  ]
  
  export const testimonials = [
    {
      name: "Jessica T.",
      program: "Advanced Vocal Techniques",
      quote:
        "After just six months at Harmony, I landed my first professional singing gig. The instructors truly care about your development and push you to reach your full potential.",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Marcus L.",
      program: "Performance Coaching",
      quote:
        "The performance coaching program transformed my stage presence. I went from being terrified of performing to confidently taking center stage at competitions.",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Aisha K.",
      program: "Beginner Vocal Training",
      quote:
        "I started with zero singing experience, and now I'm performing with my church choir. The patient, supportive environment made all the difference in my journey.",
      image: "/placeholder.svg?height=100&width=100",
    },
  ]
  
  export const events = [
    {
      day: "15",
      month: "Jun",
      title: "Summer Showcase Concert",
      time: "Saturday, 7:00 PM",
      description: "Join us for an evening of performances by our talented students across all programs.",
    },
    {
      day: "22",
      month: "Jun",
      title: "Vocal Health Workshop",
      time: "Saturday, 2:00 PM",
      description:
        "Learn essential techniques to maintain vocal health and prevent strain with our guest speech pathologist.",
    },
    {
      day: "05",
      month: "Jul",
      title: "Master Class with Grammy Winner",
      time: "Tuesday, 6:00 PM",
      description: "A rare opportunity to learn from award-winning vocalist James Anderson in an intimate setting.",
    },
    {
      day: "18",
      month: "Jul",
      title: "Recording Studio Workshop",
      time: "Thursday, 5:30 PM",
      description: "Discover professional techniques for recording vocals in a studio environment.",
    },
  ];

  export const navigationList = [
    {
      id: 1,
      text: "О нас",
      sectionId: "#about",
    },
    {
      id: 2,
      text: "Преподаватели",
      sectionId: "#instructors",
    },
    {
      id: 3,
      text: "Абонементы",
      sectionId: "#subscriptions",
    },
    {
      id: 4,
      text: "Галерея",
      sectionId: "#gallery",
    },
    {
      id: 5,
      text: "Записаться",
      sectionId: "#study",
    },
    {
      id: 6,
      text: "Контакты",
      sectionId: "#contacts",
    },
  ];