import type { MenuCategory, MenuItem } from "../../../types/menu";

export const categories: MenuCategory[] = [
  {
    id: "breakfast",
    name: "Breakfast",
    itemCount: 6,
  },
  {
    id: "nepali",
    name: "Nepali",
    itemCount: 8,
  },
  {
    id: "momo",
    name: "Momo",
    itemCount: 7,
  },
  {
    id: "chowmein",
    name: "Noodles & Chowmein",
    itemCount: 6,
  },
  {
    id: "rice",
    name: "Rice & Biryani",
    itemCount: 6,
  },
  {
    id: "snacks",
    name: "Snacks",
    itemCount: 6,
  },
  {
    id: "drinks",
    name: "Drinks",
    itemCount: 8,
  },
  {
    id: "desserts",
    name: "Desserts",
    itemCount: 5,
  },
];

export const menuItems: MenuItem[] = [
  // =========================================================
  // BREAKFAST
  // =========================================================

  {
    id: "breakfast-01",
    categoryId: "breakfast",
    name: "Classic Breakfast",
    description: "Eggs, toast, sausage, grilled tomato and house potatoes.",
    price: 450,
    image:
      "https://i.iheart.com/v3/re/new_assets/688a8222e56f6861229e7490?ops=contain%281480%2C0%29",
    available: true,
    popular: true,
  },
  {
    id: "breakfast-02",
    categoryId: "breakfast",
    name: "Masala Omelette",
    description: "Three-egg omelette with onion, tomato, chilli and herbs.",
    price: 280,
    image:
      "https://image.cdn.shpy.in/330116/masala-omelette-picture-1733185465679.jpeg?format=webp",
    available: true,
    vegetarian: true,
    spicy: true,
  },
  {
    id: "breakfast-03",
    categoryId: "breakfast",
    name: "French Toast",
    description: "Golden brioche toast with honey, berries and cream.",
    price: 320,
    image:
      "https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/medium/french_toast_with_berries.jpg",
    available: true,
    vegetarian: true,
  },
  {
    id: "breakfast-04",
    categoryId: "breakfast",
    name: "Pancake Stack",
    description: "Fluffy pancakes served with banana, honey and butter.",
    price: 350,
    image:
      "https://www.tastingtable.com/img/gallery/why-you-should-reconsider-cooking-pancakes-in-butter/l-intro-1677269242.jpg",
    available: true,
    vegetarian: true,
    popular: true,
  },
  {
    id: "breakfast-05",
    categoryId: "breakfast",
    name: "Aloo Paratha",
    description: "Crispy potato-stuffed paratha served with curd and pickle.",
    price: 220,
    image:
      "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },
  {
    id: "breakfast-06",
    categoryId: "breakfast",
    name: "Breakfast Sandwich",
    description: "Toasted bread with egg, cheese, lettuce and tomato.",
    price: 300,
    image:
      "https://i.pinimg.com/originals/02/78/b1/0278b16726c73d6580f6b2600a9f8280.jpg",
    available: true,
  },

  // =========================================================
  // NEPALI
  // =========================================================

  {
    id: "nepali-01",
    categoryId: "nepali",
    name: "Dal Bhat Tarkari",
    description: "Steamed rice, lentil soup, seasonal vegetables and achar.",
    price: 420,
    image:
      "https://cdn.getyourguide.com/image/format%3Dauto%2Cfit%3Dcrop%2Cgravity%3Dcenter%2Cquality%3D60%2Cwidth%3D450%2Cheight%3D450%2Cdpr%3D2/tour_img/f86ecb1faf35ff13df0eb93faaa5ffe76dbf3a923505af9b8fb6c775b9117801.png",
    available: true,
    popular: true,
    vegetarian: true,
  },
  {
    id: "nepali-02",
    categoryId: "nepali",
    name: "Chicken Thali",
    description: "Rice, dal, chicken curry, vegetables, salad and achar.",
    price: 520,
    image:
      "https://assets.st-note.com/img/1768150046-0pEPr87a6c4TwnHXlqWgoSyt.jpg?fit=bounds&height=2000&quality=85&width=2000",
    available: true,
    popular: true,
  },
  {
    id: "nepali-03",
    categoryId: "nepali",
    name: "Thakali Khana Set",
    description:
      "Traditional Thakali-style meal with dal, rice, curry and pickles.",
    price: 650,
    image:
      "https://i.pinimg.com/originals/48/84/14/48841451e190c78648ec723eb5cc4a1b.jpg",
    available: true,
    popular: true,
  },
  {
    id: "nepali-04",
    categoryId: "nepali",
    name: "Aloo Tama",
    description:
      "Traditional potato and bamboo shoot curry with Nepali spices.",
    price: 300,
    image:
      "https://i.pinimg.com/originals/6e/33/e6/6e33e6a121f5adba10d167e2953c0419.jpg",
    available: true,
    vegetarian: true,
    spicy: true,
  },
  {
    id: "nepali-05",
    categoryId: "nepali",
    name: "Chicken Sekuwa",
    description: "Char-grilled Nepali spiced chicken skewers.",
    price: 480,
    image:
      "https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/medium/chicken_sekuwa.jpg",
    available: true,
    spicy: true,
  },
  {
    id: "nepali-06",
    categoryId: "nepali",
    name: "Choila",
    description: "Smoky grilled buffalo tossed with traditional Nepali spices.",
    price: 450,
    image:
      "https://talejurestaurant.com/media/54/CHICKEN-CHOILA-RECIPE.webp",
    available: true,
    spicy: true,
  },
  {
    id: "nepali-07",
    categoryId: "nepali",
    name: "Vegetable Tarkari",
    description: "Seasonal mixed vegetables cooked with Nepali spices.",
    price: 280,
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },
  {
    id: "nepali-08",
    categoryId: "nepali",
    name: "Gundruk Soup",
    description: "Traditional fermented leafy green soup with local spices.",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
    spicy: true,
  },

  // =========================================================
  // MOMO
  // =========================================================

  {
    id: "momo-01",
    categoryId: "momo",
    name: "Chicken Momo",
    description: "Steamed chicken dumplings served with spicy tomato achar.",
    price: 280,
    image:
      "https://136814726.cdn6.editmysite.com/uploads/1/3/6/8/136814726/6WBH74LIPEQEB2TIFISLCLVZ.jpeg",
    available: true,
    popular: true,
  },
  {
    id: "momo-02",
    categoryId: "momo",
    name: "Buff Momo",
    description: "Classic steamed buffalo dumplings with house achar.",
    price: 260,
    image:
      "https://cdn.4travel.jp/img/thumbnails/imk/travelogue_pict/84/82/74/650x_84827453.jpg?updated_at=1738073223",
    available: true,
    popular: true,
  },
  {
    id: "momo-03",
    categoryId: "momo",
    name: "Veg Momo",
    description: "Steamed vegetable dumplings packed with fresh vegetables.",
    price: 240,
    image:
      "https://tasteofnepalstpaul.com/pluto-images/funnel/images/1b3cf7c0-7b72-414b-a8ee-577cbdf18ebf?fit=cover",
    available: true,
    vegetarian: true,
  },
  {
    id: "momo-04",
    categoryId: "momo",
    name: "Jhol Momo",
    description: "Steamed momos served in a rich sesame-tomato jhol.",
    price: 320,
    image:
      "https://i.pinimg.com/736x/fd/a3/5a/fda35a8c4a2efaddbe2162eeee957bf0.jpg",
    available: true,
    popular: true,
    spicy: true,
  },
  {
    id: "momo-05",
    categoryId: "momo",
    name: "C-Momo",
    description: "Crispy fried momos tossed in a spicy tomato sauce.",
    price: 340,
    image:
      "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=900&q=80",
    available: true,
    popular: true,
    spicy: true,
  },
  {
    id: "momo-06",
    categoryId: "momo",
    name: "Kothey Momo",
    description: "Pan-fried dumplings with a crispy base and juicy filling.",
    price: 300,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/ff/Kothey_momo.JPG",
    available: true,
  },
  {
    id: "momo-07",
    categoryId: "momo",
    name: "Cheese Momo",
    description:
      "Steamed dumplings filled with vegetables and melted cheese.",
    price: 350,
    image:
      "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto%2Cw_300%2Ch_300%2Ce_grayscale%2Cc_fit/FOOD_CATALOG/IMAGES/CMS/2024/10/21/928ede29-5d39-466b-b100-bd23c4531793_fa70cbf2-5de3-4e45-890c-216af86597c8.jpg",
    available: true,
    vegetarian: true,
  },

  // =========================================================
  // NOODLES & CHOWMEIN
  // =========================================================

  {
    id: "chowmein-01",
    categoryId: "chowmein",
    name: "Chicken Chowmein",
    description: "Wok-tossed noodles with chicken and fresh vegetables.",
    price: 350,
    image:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=900&q=80",
    available: true,
    popular: true,
  },
  {
    id: "chowmein-02",
    categoryId: "chowmein",
    name: "Buff Chowmein",
    description: "Nepali-style wok-fried noodles with tender buffalo.",
    price: 330,
    image:
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=900&q=80",
    available: true,
  },
  {
    id: "chowmein-03",
    categoryId: "chowmein",
    name: "Veg Chowmein",
    description:
      "Stir-fried noodles with cabbage, carrot, capsicum and onion.",
    price: 280,
    image:
      "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },
  {
    id: "chowmein-04",
    categoryId: "chowmein",
    name: "Schezwan Noodles",
    description: "Spicy wok noodles with vegetables and Schezwan sauce.",
    price: 320,
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
    spicy: true,
  },
  {
    id: "chowmein-05",
    categoryId: "chowmein",
    name: "Mixed Chowmein",
    description: "Wok-tossed noodles with chicken, egg and fresh vegetables.",
    price: 400,
    image:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80",
    available: true,
  },
  {
    id: "chowmein-06",
    categoryId: "chowmein",
    name: "Garlic Noodles",
    description: "Fragrant noodles with roasted garlic, herbs and vegetables.",
    price: 300,
    image:
      "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },

  // =========================================================
  // RICE & BIRYANI
  // =========================================================

  {
    id: "rice-01",
    categoryId: "rice",
    name: "Chicken Biryani",
    description: "Aromatic basmati rice layered with spiced chicken.",
    price: 480,
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d51a?auto=format&fit=crop&w=900&q=80",
    available: true,
    popular: true,
  },
  {
    id: "rice-02",
    categoryId: "rice",
    name: "Mutton Biryani",
    description: "Fragrant basmati rice with tender spiced mutton.",
    price: 620,
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=80",
    available: true,
  },
  {
    id: "rice-03",
    categoryId: "rice",
    name: "Chicken Fried Rice",
    description: "Wok-fried rice with chicken, egg and vegetables.",
    price: 380,
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",
    available: true,
  },
  {
    id: "rice-04",
    categoryId: "rice",
    name: "Veg Fried Rice",
    description:
      "Wok-fried rice with seasonal vegetables and spring onion.",
    price: 300,
    image:
      "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },
  {
    id: "rice-05",
    categoryId: "rice",
    name: "Egg Fried Rice",
    description: "Classic fried rice with scrambled egg and vegetables.",
    price: 320,
    image:
      "https://images.deliveryhero.io/image/fd-kh/Products/3600015.jpg?width=%25s",
    available: true,
  },
  {
    id: "rice-06",
    categoryId: "rice",
    name: "Jeera Rice",
    description:
      "Fragrant basmati rice tempered with cumin and herbs.",
    price: 220,
    image:
      "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },

  // =========================================================
  // SNACKS
  // =========================================================

  {
    id: "snacks-01",
    categoryId: "snacks",
    name: "Chicken Wings",
    description: "Crispy chicken wings tossed in our signature sauce.",
    price: 420,
    image:
      "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=900&q=80",
    available: true,
    popular: true,
  },
  {
    id: "snacks-02",
    categoryId: "snacks",
    name: "French Fries",
    description: "Crispy golden fries served with house dip.",
    price: 220,
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },
  {
    id: "snacks-03",
    categoryId: "snacks",
    name: "Loaded Fries",
    description:
      "Crispy fries topped with cheese, herbs and house sauce.",
    price: 350,
    image:
      "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
    popular: true,
  },
  {
    id: "snacks-04",
    categoryId: "snacks",
    name: "Chicken Chilli",
    description:
      "Crispy chicken tossed with peppers, onion and chilli sauce.",
    price: 450,
    image:
      "https://cdn3.didevelop.com/public/product_images/2599/533_91491feded6a780aff25a34de6f97bc0.jpg",
    available: true,
    spicy: true,
  },
  {
    id: "snacks-05",
    categoryId: "snacks",
    name: "Veg Spring Rolls",
    description: "Crispy rolls filled with seasoned vegetables.",
    price: 280,
    image:
      "https://images.unsplash.com/photo-1548507200-9a3c7e3d8e8f?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },
  {
    id: "snacks-06",
    categoryId: "snacks",
    name: "Paneer Chilli",
    description:
      "Crispy paneer with peppers, onion and spicy sauce.",
    price: 380,
    image:
      "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
    spicy: true,
  },

  // =========================================================
  // DRINKS
  // =========================================================

  {
    id: "drinks-01",
    categoryId: "drinks",
    name: "Masala Tea",
    description:
      "Classic Nepali milk tea brewed with aromatic spices.",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
    popular: true,
  },
  {
    id: "drinks-02",
    categoryId: "drinks",
    name: "Cappuccino",
    description:
      "Espresso with steamed milk and a smooth foam layer.",
    price: 220,
    image:
      "https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
    popular: true,
  },
  {
    id: "drinks-03",
    categoryId: "drinks",
    name: "Iced Latte",
    description:
      "Chilled espresso with creamy milk served over ice.",
    price: 260,
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },
  {
    id: "drinks-04",
    categoryId: "drinks",
    name: "Fresh Lemonade",
    description:
      "Freshly squeezed lemon with mint and a touch of sweetness.",
    price: 180,
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },
  {
    id: "drinks-05",
    categoryId: "drinks",
    name: "Mango Smoothie",
    description:
      "Creamy smoothie made with ripe mango and chilled milk.",
    price: 280,
    image:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },
  {
    id: "drinks-06",
    categoryId: "drinks",
    name: "Fresh Lime Soda",
    description:
      "Refreshing lime, soda and mint served over ice.",
    price: 160,
    image:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },
  {
    id: "drinks-07",
    categoryId: "drinks",
    name: "Cold Coffee",
    description:
      "Chilled blended coffee with milk and a creamy finish.",
    price: 260,
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },
  {
    id: "drinks-08",
    categoryId: "drinks",
    name: "Bottled Water",
    description: "Chilled bottled drinking water.",
    price: 50,
    image:
      "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=80",
    available: true,
  },

  // =========================================================
  // DESSERTS
  // =========================================================

  {
    id: "dessert-01",
    categoryId: "desserts",
    name: "Gulab Jamun",
    description:
      "Warm milk-solid dumplings served in fragrant sugar syrup.",
    price: 180,
    image:
      "https://images.unsplash.com/photo-1666190094767-7f4d2e7f4a1f?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },
  {
    id: "dessert-02",
    categoryId: "desserts",
    name: "Chocolate Brownie",
    description:
      "Rich chocolate brownie served warm with chocolate sauce.",
    price: 280,
    image:
      "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
    popular: true,
  },
  {
    id: "dessert-03",
    categoryId: "desserts",
    name: "Cheesecake",
    description:
      "Creamy classic cheesecake with seasonal fruit topping.",
    price: 320,
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },
  {
    id: "dessert-04",
    categoryId: "desserts",
    name: "Chocolate Mousse",
    description:
      "Smooth and rich chocolate mousse with cocoa dust.",
    price: 280,
    image:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },
  {
    id: "dessert-05",
    categoryId: "desserts",
    name: "Ice Cream",
    description:
      "Two scoops of your choice of classic ice cream flavours.",
    price: 220,
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80",
    available: true,
    vegetarian: true,
  },
];