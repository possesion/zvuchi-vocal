"use client";

// import ImageGallery from "react-image-gallery";
import { useState } from "react";
import Image from "next/image";
import "react-image-gallery/styles/css/image-gallery.css";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Массив фотографий для галереи
const galleryImages = [
  {
    id: 1,
    src: "/bg.jpg",
    alt: "Студенты поют",
    title: "Занятия вокалом"
  },
  {
    id: 2,
    src: "/valeria.jpg",
    alt: "Валерия Ковшова",
    title: "Преподаватель Валерия"
  },
  {
    id: 3,
    src: "/Maria.jpg",
    alt: "Мария Биттер",
    title: "Преподаватель Мария"
  },
  {
    id: 4,
    src: "/zvuchi-logo.svg",
    alt: "Логотип Звучи",
    title: "Наш логотип"
  }
];

// const images = [
//     {
//       original: "/valeria.jpg",
//       thumbnail: "/valeria.jpg",
//     },
//     {
//       original: "/maria.jpg",
//       thumbnail: "/maria.jpg",
//     },
//     // {
//     //   original: "https://picsum.photos/id/1019/1000/600/",
//     //   thumbnail: "https://picsum.photos/id/1019/250/150/",
//     // },
//   ];
  
export const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (index: number) => {
    console.log('Opening modal for image:', index);
    setSelectedImage(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? galleryImages.length - 1 : selectedImage - 1);
    }
  };

  const goToNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === galleryImages.length - 1 ? 0 : selectedImage + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeModal();
    } else if (e.key === "ArrowLeft") {
      goToPrevious();
    } else if (e.key === "ArrowRight") {
      goToNext();
    }
  };

//   return (
//     null
//     // <ImageGallery items={images}  />
//   )
  return (
    <section id="gallery" className="py-12 md:py-16 bg-muted/30">
      <div className="flex flex-col items-center text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Галерея</h2>
        <p className="text-muted-foreground max-w-2xl">
          Фотографии наших занятий, мероприятий и достижений
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {galleryImages.map((image, index) => (
          <div
            key={image.id}
            className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openModal(index);
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openModal(index);
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center p-4">
                <h3 className="font-semibold text-sm md:text-base">{image.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно для просмотра фотографий */}
      {isModalOpen && selectedImage !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-4xl max-h-full">
            {/* Кнопка закрытия */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors duration-200"
            >
              <X size={32} />
            </button>

            {/* Кнопка предыдущая */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors duration-200 bg-black/50 rounded-full p-2"
            >
              <ChevronLeft size={32} />
            </button>

            {/* Кнопка следующая */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors duration-200 bg-black/50 rounded-full p-2"
            >
              <ChevronRight size={32} />
            </button>

            {/* Изображение */}
            <div className="relative aspect-video w-full max-w-4xl">
              <Image
                src={galleryImages[selectedImage].src}
                alt={galleryImages[selectedImage].alt}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Заголовок */}
            <div className="absolute bottom-4 left-4 right-4 text-white text-center">
              <h3 className="text-lg md:text-xl font-semibold bg-black/50 rounded-lg px-4 py-2 inline-block">
                {galleryImages[selectedImage].title}
              </h3>
            </div>

            {/* Индикатор текущего изображения */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === selectedImage ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
