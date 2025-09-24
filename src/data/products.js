// src/data/products.js
export const CATEGORIES = [
  "ПВП Набор",
  "Броня",
  "Оружия",
  "Транспорт",
  "Ресурсы",
  "Компоненты",
  "Карточки",
]

export const PRODUCTS = {
  "ПВП Набор": [
    {
      id: 1,
      name: "Набор выживания",
      img: "/images/pvp-kit-1.png",
      desc: "Базовый комплект для боя в PVP: броня, оружие и аптечки.",
      priceRub: 499,
      pricePoints: 500,
    },
    {
      id: 2,
      name: "Про-Набор",
      img: "/images/pvp-kit-2.png",
      desc: "Улучшенный комплект: шлем, кираса, меч с зачарованиями.",
      priceRub: 1299,
      pricePoints: 1300,
    },
  ],
  "Броня": [
    {
      id: 3,
      name: "Кожаный доспех",
      img: "/images/armor-leather.png",
      desc: "Лёгкая броня из шкур зверей.",
      priceRub: 299,
      pricePoints: 300,
    },
    {
      id: 4,
      name: "Железный доспех",
      img: "/images/armor-iron.png",
      desc: "Прочная броня из закалённого железа.",
      priceRub: 799,
      pricePoints: 800,
    },
  ],
  "Оружия": [
    {
      id: 5,
      name: "Меч",
      img: "/images/weapon-sword.png",
      desc: "Стальной меч средней прочности.",
      priceRub: 199,
      pricePoints: 200,
    },
    {
      id: 6,
      name: "Лук",
      img: "/images/weapon-bow.png",
      desc: "Деревянный лук с упругой тетивой.",
      priceRub: 249,
      pricePoints: 250,
    },
  ],
  "Транспорт": [
    {
      id: 7,
      name: "Лодка",
      img: "/images/vehicle-boat.png",
      desc: "Небольшая гребная лодка.",
      priceRub: 1599,
      pricePoints: 1600,
    },
    {
      id: 8,
      name: "Мотоцикл",
      img: "/images/vehicle-bike.png",
      desc: "Внедорожный мотоцикл.",
      priceRub: 4999,
      pricePoints: 5000,
    },
  ],
  "Ресурсы": [
    {
      id: 9,
      name: "Древесина (100 шт)",
      img: "/images/resource-wood.png",
      desc: "Материал для строительства.",
      priceRub: 99,
      pricePoints: 100,
    },
    {
      id: 10,
      name: "Камень (100 шт)",
      img: "/images/resource-stone.png",
      desc: "Кирпичи для укреплений.",
      priceRub: 89,
      pricePoints: 90,
    },
  ],
  "Компоненты": [
    {
      id: 11,
      name: "Смола",
      img: "/images/component-resin.png",
      desc: "Для смазки механизмов.",
      priceRub: 149,
      pricePoints: 150,
    },
    {
      id: 12,
      name: "Шестерёнки",
      img: "/images/component-gears.png",
      desc: "Металлические зубчатые колёса.",
      priceRub: 199,
      pricePoints: 200,
    },
  ],
  "Карточки": [
    {
      id: 13,
      name: "Карта сокровищ",
      img: "/images/card-map.png",
      desc: "Указывает место с сундуком.",
      priceRub: 399,
      pricePoints: 400,
    },
    {
      id: 14,
      name: "Карта портал",
      img: "/images/card-portal.png",
      desc: "Создаёт временный портал.",
      priceRub: 599,
      pricePoints: 600,
    },
  ],
}
