"use client";

import { InvalidEvent, useState} from "react";
import { X } from "lucide-react";
import { Snackbar } from "./snackbar";


interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnrollmentModal({ isOpen, onClose }: EnrollmentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/send-mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Показываем успешное уведомление
        setSnackbar({
          isVisible: true,
          message: result.message || "Спасибо! Мы свяжемся с вами в ближайшее время.",
          type: "success"
        });
        
        // Сброс формы
        setFormData({
          name: "",
          phone: "",
        });
        
        // Закрываем модальное окно через 2 секунды
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        // Показываем ошибку
        setSnackbar({
          isVisible: true,
          message: result.error || "Произошла ошибка при отправке заявки. Попробуйте позже.",
          type: "error"
        });
      }
    } catch (error) {
      console.error('Ошибка при отправке:', error);
      setSnackbar({
        isVisible: true,
        message: "Произошла ошибка при отправке заявки. Попробуйте позже.",
        type: "error"
      });
    }
  };

  const handleValidate = (text: string) => (e: InvalidEvent<HTMLInputElement>) => {
      e.target.setCustomValidity(text)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-[480px] w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Записаться на пробное&nbsp;занятие</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Имя *
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              id="name"
              name="name"
              onInvalid={handleValidate('Введите имя')}
              onInput={handleValidate('')}
              onChange={handleChange}
              placeholder="Ваше имя"
              required
              type="text"
              value={formData.name}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Телефон *
            </label>
            <input
              id="phone"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              name="phone"
              onInvalid={handleValidate('Введите номер телефона')}
              onInput={handleValidate('')}
              onChange={handleChange}
              placeholder="+7 (999) 000-00-00"
              required
              type="tel"
              value={formData.phone}
            />
          </div>
          <button
            type="submit"
            className="cursor-pointer w-full bg-gradient-to-r from-brand to-brand-secondary text-white font-bold py-3 px-6 rounded-lg hover:from-primary/90 hover:to-primary/70 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Записаться
          </button>
        </form>
      </div>
      
      {/* Snackbar для уведомлений */}
      <Snackbar
        isVisible={snackbar.isVisible}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar(prev => ({ ...prev, isVisible: false }))}
        duration={4000}
      />
    </div>
  );
}
