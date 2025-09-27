export const CATEGORIES = [
  "ПВП Набор",
  "Броня",
  "Ресурсы",
  "Компоненты",
  "Карточки",
]

export const PRODUCTS = {
  "ПВП Набор": [
    {
      id: 1,
      name: "Сет 1",
      img: "/images/set-1.png",
      desc: "Базовый комплект: Фул костянка, Инжектор-3шт, СМГ, Калиматор, 250-патры.",
      priceRub: 70,
      pricePoints: 90,
      
    },
    {
      id: 2,
      name: "Сет 2",
      img: "/images/set-2.png",
      desc: "Базовый комплект: Фул костянка, Инжектор-3шт, СМГ, УЗИ, Калиматор, 250-патры.",
      priceRub: 90,
      pricePoints: 110,
      
    },
    {
      id: 3,
      name: "Сет 3",
      img: "/images/set-3.png",
      desc: "Базовый комплект: Фул костянка, Инжектор-3шт, Фамас, УЗИ, Калиматор, 250-патры.",
      priceRub: 110,
      pricePoints: 130,
      
    },
    {
      id: 4,
      name: "Сет 4",
      img: "/images/set-4.png",
      desc: "Базовый комплект: Фул железко, Инжектор-3шт, Фамас, УЗИ, Калиматор, 250-патры.",
      priceRub: 130,
      pricePoints: 150,
      
    },
    {
      id: 5,
      name: "Сет 5",
      img: "/images/set-5.png",
      desc: "Базовый комплект: Фул железко, Инжектор-3шт, Скар, Калиматор, 250-патры на 7,62.",
      priceRub: 150,
      pricePoints: 170,
      unlockHours: 3,  // доступно через 3 часа
      
    },
    {
      id: 6,
      name: "Сет 6",
      img: "/images/set-energo.png",
      desc: "Базовый комплект: Фул Энего броня, Инжектор-3шт, топ оружия на выбор, Калиматор, 300-патры.",
      priceRub: 250,
      pricePoints: 270,
      unlockHours: 72,  // доступно через 72 часов
       options: [
    { id: "akm", label: "АКМ" },
    { id: "famas", label: "М4" },
    { id: "scar", label: "QBZ" },
  ],
      
    },
    {
  id: 7,
  name: "Сет 7",
  img: "/images/set-mvk.png",
  desc: "Фул мвк броня, Инжектор-3шт, топ оружия на выбор, Калиматор, 300-патры.",
  priceRub: 150,
  pricePoints: 170,
  unlockHours: 24,
  options: [
    { id: "akm", label: "АКМ" },
    { id: "famas", label: "М4" },
    { id: "scar", label: "QBZ" },
  ],
},
    {
      id: 8,
      name: "Сет 8",
      img: "/images/set-titan.png",
      desc: "Базовый комплект: Фул Титан броня, Инжектор-3шт, топ оружия на выбор, Калиматор, 300-патры.",
      priceRub: 200,
      pricePoints: 220,
      unlockHours: 24,  // доступно через 24 часов
       options: [
    { id: "akm", label: "АКМ" },
    { id: "famas", label: "М4" },
    { id: "scar", label: "QBZ" },
  ],
      
    },
  ],
  
  
   "Броня": [
    {
      id: 9,
      name: "Костяная",
      img: "/images/kost-bro.png",
      desc: "Фул костяня броня.",
      priceRub: 20,
      pricePoints: 40,
    },
    {
      id: 10,
      name: "Метал",
      img: "/images/metall-bro.png",
      desc: "Фул метал броня.",
      priceRub: 40,
      pricePoints: 60,
      unlockHours: 3,   // доступно через 3 часа
    },
    {
      id: 11,
      name: "МВК",
      img: "/images/mvk-bro.png",
      desc: "Фул МВК броня.",
      priceRub: 60,
      pricePoints: 80,
      unlockHours: 24,   // доступно через 24 часа
    },
    {
      id: 12,
      name: "Титан",
      img: "/images/titan-bro.png",
      desc: "Фул Титан броня.",
      priceRub: 90,
      pricePoints: 110,
      unlockHours: 30,   // доступно через 30 часа
    },
    {
      id: 13,
      name: "Энерго",
      img: "/images/energo-bro.png",
      desc: "Фул Энерго броня.",
      priceRub: 200,
      pricePoints: 220,
      unlockHours: 74,   // доступно через 74 часа
    },
  ],

  "Ресурсы": [
    {
      id: 14,
      name: "Древесина (20к)",
      img: "/images/file_0.png",
      desc: "Материал для строительства.",
      priceRub: 20,
      pricePoints: 30,
    },
    {
      id: 15,
      name: "Камень (20к)",
      img: "/images/file_1.png",
      desc: "Материал для строительства.",
      priceRub: 30,
      pricePoints: 40,
    },
    {
      id: 16,
      name: "Ткань (1к)",
      img: "/images/file_8.png",
      desc: "Материал для создания различных предметов а так же бинтов.",
      priceRub: 300,
      pricePoints: 320,
    },
    {
      id: 17,
      name: "Шкура (1к)",
      img: "/images/file_29.png",
      desc: "Материал для строительства, предметов и брони.",
      priceRub: 100,
      pricePoints: 120,
    },
    {
      id: 18,
      name: "Железная Руда (10к)",
      img: "/images/file_5.png",
      desc: "Материал для строительства.",
      priceRub: 30,
      pricePoints: 40,
    },
    {
      id: 19,
      name: "МВК Руда (500 шт)",
      img: "/images/file_62.png",
      desc: "Материал для строительства.",
      priceRub: 110,
      pricePoints: 125,
      unlockHours: 3,   // доступно через 3 час
    },
    {
      id: 20,
      name: "Титан Руда (500 шт)",
      img: "/images/file_9.png",
      desc: "Материал для строительства.",
      priceRub: 200,
      pricePoints: 220,
      unlockHours: 10,   // доступно через 10 час
    },
    {
      id: 21,
      name: "Метал плавленный (10к)",
      img: "/images/metalalloy.png",
      desc: "Материал для строительства.",
      priceRub: 45,
      pricePoints: 55,
    },
    {
      id: 22,
      name: "МВК Плавленный (500 шт)",
      img: "/images/mvkalloy.png",
      desc: "Материал для строительства.",
      priceRub: 120,
      pricePoints: 140,
      unlockHours: 3,   // доступно через 3 час
    },
    {
      id: 23,
      name: "Бензин (1к)",
      img: "/images/petrol.png",
      desc: "Материал для строительства.",
      priceRub: 90,
      pricePoints: 110,
    },
    {
      id: 24,
      name: "Нефть (500 шт)",
      img: "/images/oil.png",
      desc: "Материал для получения бензина.",
      priceRub: 120,
      pricePoints: 140,
    },
    {
      id: 25,
      name: "Деталь-Скрап (1к)",
      img: "/images/file_10.png",
      desc: "для изученя верстака.",
      priceRub: 50,
      pricePoints: 70,
      unlockHours: 6,   // доступно через 6 часа
    },
  ],

  "Компоненты": [
    {
      id: 26,
      name: "Корпус",
      img: "/images/corpus-Photoroom.png",
      desc: "Обязательные материалы для изготовления транспорта.",
      priceRub: 45,
      pricePoints: 55,
      
    },
    {
      id: 27,
      name: "Железные листы",
      img: "/images/file_12.png",
      desc: "Материалы, необходимы для изготовления некоторых обьектов.",
      priceRub: 35,
      pricePoints: 45,
      
    },
    {
      id: 28,
      name: "Механическая шестерня",
      img: "/images/file_11.png",
      desc: "Материалы для изготовления транспорта, обьектов.",
      priceRub: 35,
      pricePoints: 45,
     
    },
    {
      id: 29,
      name: "Бечевка",
      img: "/images/bech-Photoroom.png",
      desc: "Материалы, необходимы для изготовления некоторых обьектов.",
      priceRub: 20,
      pricePoints: 30,
      
    },
    {
      id: 30,
      name: "Электронная деталь",
      img: "/images/file_13.png",
      desc: "Базовые материалы для обьектов цепи.",
      priceRub: 45,
      pricePoints: 55,
      
    },
    {
      id: 31,
      name: "Металлический патрон",
      img: "/images/file_25.png",
      desc: "Материалы для изготовления стрелкового оружия.",
      priceRub: 199,
      pricePoints: 200,
      unlockHours: 12,  // доступно через 12 часов
    },
    {
      id: 32,
      name: "Пружина крученная",
      img: "/images/file_24.png",
      desc: "Материалы для изготовления стрелкового оружия.",
      priceRub: 35,
      pricePoints: 45,
      
    },
    {
      id: 33,
      name: "корпус автомата",
      img: "/images/corpakm-Photoroom.png",
      desc: "Материалы для изготовления стрелкового оружия.",
      priceRub: 45,
      pricePoints: 55,
      
    },
    {
      id: 34,
      name: "Пусковая Установка",
      img: "/images/pusc-Photoroom.png",
      desc: "Материалы для изготовления РПГ, Теслы.",
      priceRub: 45,
      pricePoints: 55,
      
    },
    {
      id: 35,
      name: "Лезвие",
      img: "/images/lezv-Photoroom.png",
      desc: "Необходимые материалы для оружия ближнего боя.",
      priceRub: 20,
      pricePoints: 30,
     
    },
    {
      id: 36,
      name: "Иголка с ниткой",
      img: "/images/nit-Photoroom.png",
      desc: "Материалы, необходимые для изготовления некоторой брони.",
      priceRub: 20,
      pricePoints: 30,
      
    },
    
  ],
  "Карточки": [
    {
      id: 37,
      name: "Зеленая карта",
      img: "/images/file_18.png",
      desc: "средне топовые предметы есть шанс выбить смг, узи, скар а так же поднять синих карточек.",
      priceRub: 10,
      pricePoints: 20,
      
    },
    {
      id: 38,
      name: "Синяя карта",
      img: "/images/file_19.png",
      desc: "больще шансов найти предметов особенно при старте сервера а так же найти фиолетовых карточек.",
      priceRub: 25,
      pricePoints: 35,
      
    },
    {
      id: 39,
      name: "Фиолетовая карта",
      img: "/images/file_20.png",
      desc: "больше шансов найти топовых предметов, оружия и т д.",
      priceRub: 45,
      pricePoints: 55,
     
    },
    {
      id: 40,
      name: "Резистор (100 шт)",
      img: "/images/rezis.png",
      desc: "используется место топливы для световых мечей а так же для генераторов при открывание комнат.",
      priceRub: 35,
      pricePoints: 45,
      
    },
  ],
}
