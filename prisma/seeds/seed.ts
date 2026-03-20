import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Clear existing data
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.deliveryLocation.deleteMany();
    await prisma.translation.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 12);

    // Users
    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@ggkitchen.uz',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    const courier = await prisma.user.create({
        data: {
            name: 'John Courier',
            email: 'courier@ggkitchen.uz',
            password: hashedPassword,
            role: 'COURIER',
        },
    });

    const student1 = await prisma.user.create({
        data: {
            name: 'Alice Student',
            email: 'alice@student.com',
            password: hashedPassword,
            role: 'STUDENT',
        },
    });

    const student2 = await prisma.user.create({
        data: {
            name: 'Bob Teacher',
            email: 'bob@teacher.com',
            password: hashedPassword,
            role: 'TEACHER',
        },
    });

    // Categories
    const burgers = await prisma.category.create({ data: { name: 'Burgers' } });
    const pizza = await prisma.category.create({ data: { name: 'Pizza' } });
    const drinks = await prisma.category.create({ data: { name: 'Drinks' } });

    // Products
    await prisma.product.createMany({
        data: [
            { name: 'Classic Cheeseburger', price: 5.99, categoryId: burgers.id, description: 'Juicy beef patty with cheese' },
            { name: 'Spicy Chicken Burger', price: 6.49, categoryId: burgers.id, description: 'Crispy chicken with spicy sauce' },
            { name: 'Margherita Pizza', price: 8.99, categoryId: pizza.id, description: 'Tomato sauce and mozzarella' },
            { name: 'Pepperoni Pizza', price: 10.99, categoryId: pizza.id, description: 'Double pepperoni with extra cheese' },
            { name: 'Veggie Pizza', price: 9.49, categoryId: pizza.id, description: 'Mixed vegetables and olives' },
            { name: 'Coca Cola', price: 1.50, categoryId: drinks.id, description: 'Refreshing soda' },
            { name: 'Iced Tea', price: 1.75, categoryId: drinks.id, description: 'Lemon iced tea' },
            { name: 'Orange Juice', price: 2.25, categoryId: drinks.id, description: 'Freshly squeezed' },
        ],
    });

    // Translations
    const translations = [
        // Header
        { key: 'nav.home', en: 'Home', uz: 'Bosh sahifa' },
        { key: 'nav.menu', en: 'Menu', uz: 'Menyu' },
        { key: 'nav.orders', en: 'Orders', uz: 'Buyurtmalar' },
        { key: 'nav.admin', en: 'Admin', uz: 'Admin' },
        { key: 'nav.deliveries', en: 'Deliveries', uz: 'Yetkazib berish' },
        { key: 'header.search_menu', en: 'Search menu', uz: 'Menyuni qidirish' },
        { key: 'header.search_food', en: 'Search food...', uz: 'Ovqat qidirish...' },
        { key: 'header.cart', en: 'Cart', uz: 'Savat' },
        { key: 'header.sign_in', en: 'Sign In', uz: 'Kirish' },
        { key: 'header.sign_out', en: 'Sign Out', uz: 'Chiqish' },
        { key: 'header.my_profile', en: 'My Profile', uz: 'Mening profilim' },
        { key: 'header.my_orders', en: 'My Orders', uz: 'Mening buyurtmalarim' },
        { key: 'header.welcome', en: 'Welcome!', uz: 'Xush kelibsiz!' },
        { key: 'header.sign_in_to_order', en: 'Sign in to order food', uz: 'Ovqat buyurtma qilish uchun kiring' },
        { key: 'header.quick_actions', en: 'Quick Actions', uz: 'Tezkor amallar' },
        { key: 'header.shopping_cart', en: 'Shopping Cart', uz: 'Xarid savati' },
        { key: 'header.active_orders', en: 'Active Orders', uz: 'Faol buyurtmalar' },
        { key: 'header.no_active_orders', en: 'No active orders', uz: 'Faol buyurtmalar yo\'q' },
        { key: 'header.fresh_fast', en: 'Fresh & Fast', uz: 'Toza & Tez' },

        // Home page
        { key: 'home.hero_title', en: 'Delicious GGKitchen Food,\nDelivered to Your Door 🍕', uz: 'Mazali GGKitchen Ovqati,\nEshigingizga Yetkaziladi 🍕' },
        { key: 'home.hero_subtitle', en: 'Fresh meals from our kitchen. Browse the menu, place your order, and get it delivered in minutes.', uz: 'Oshxonamizdan yangi taomlar. Menyuni ko\'ring, buyurtma bering va bir necha daqiqada yetkazib beramiz.' },
        { key: 'home.browse_menu', en: 'Browse Menu', uz: 'Menyuni ko\'rish' },
        { key: 'home.get_started', en: 'Get Started', uz: 'Boshlash' },
        { key: 'home.why_title', en: 'Why GGKitchen?', uz: 'Nima uchun GGKitchen?' },
        { key: 'home.why_subtitle', en: 'The easiest way to get food', uz: 'Ovqat olishning eng oson yo\'li' },
        { key: 'home.feature_fast', en: 'Lightning Fast', uz: 'Chaqmoq tezligida' },
        { key: 'home.feature_fast_desc', en: 'Get your food delivered in under 20 minutes to any building on campus.', uz: 'Ovqatingizni kampusdagi istalgan binoga 20 daqiqadan kamroq vaqtda yetkazib oling.' },
        { key: 'home.feature_easy', en: 'Easy Ordering', uz: 'Oson buyurtma' },
        { key: 'home.feature_easy_desc', en: 'Browse, tap, order. Our simple interface makes ordering a breeze.', uz: 'Ko\'ring, bosing, buyurtma bering. Oddiy interfeysimiz buyurtmani osonlashtiradi.' },
        { key: 'home.feature_quality', en: 'Quality Meals', uz: 'Sifatli taomlar' },
        { key: 'home.feature_quality_desc', en: 'Prepared fresh daily by professional campus chefs with the best ingredients.', uz: 'Professional kampus oshpazlari tomonidan eng yaxshi ingredientlar bilan har kuni yangi tayyorlanadi.' },

        // Menu page
        { key: 'menu.hero_title', en: 'What are you craving? 🍽️', uz: 'Nimani istamoqdasiz? 🍽️' },
        { key: 'menu.hero_subtitle', en: 'Browse our fresh menu and order your favorites.', uz: 'Yangi menyumizni ko\'ring va sevimlilaringizni buyurtma qiling.' },
        { key: 'menu.search_placeholder', en: 'Search for food...', uz: 'Ovqat qidirish...' },
        { key: 'menu.all', en: 'All', uz: 'Barchasi' },
        { key: 'menu.no_dishes', en: 'No dishes found', uz: 'Taom topilmadi' },
        { key: 'menu.no_dishes_hint', en: 'Try adjusting your search or browse a different category.', uz: 'Qidiruvni o\'zgartiring yoki boshqa turkumni ko\'ring.' },
        { key: 'menu.clear_filters', en: 'Clear Filters', uz: 'Filtrlarni tozalash' },

        // Product card
        { key: 'product.add_to_cart', en: 'Add to Cart', uz: 'Savatga qo\'shish' },
        { key: 'product.added_to_cart', en: 'added to cart', uz: 'savatga qo\'shildi' },
        { key: 'product.default_desc', en: 'Freshly prepared with the finest ingredients.', uz: 'Eng yaxshi ingredientlar bilan yangi tayyorlangan.' },

        // Cart page
        { key: 'cart.title', en: 'Shopping Cart', uz: 'Xarid savati' },
        { key: 'cart.items_count', en: 'item(s) in your cart', uz: 'ta mahsulot savatingizda' },
        { key: 'cart.empty_title', en: 'Your cart is empty', uz: 'Savatingiz bo\'sh' },
        { key: 'cart.empty_hint', en: 'Looks like you haven\'t added any items yet. Explore the menu to get started!', uz: 'Hali hech narsa qo\'shmaganga o\'xshaysiz. Boshlash uchun menyuni ko\'ring!' },
        { key: 'cart.order_summary', en: 'Order Summary', uz: 'Buyurtma xulosasi' },
        { key: 'cart.subtotal', en: 'Subtotal', uz: 'Jami' },
        { key: 'cart.delivery', en: 'Delivery', uz: 'Yetkazib berish' },
        { key: 'cart.free', en: 'FREE', uz: 'BEPUL' },
        { key: 'cart.total', en: 'Total', uz: 'Jami' },
        { key: 'cart.checkout', en: 'Checkout', uz: 'Rasmiylashtirish' },
        { key: 'cart.continue_shopping', en: '← Continue Shopping', uz: '← Xaridni davom ettirish' },
        { key: 'cart.each', en: 'each', uz: 'dona' },

        // Orders page
        { key: 'orders.title', en: 'My Orders', uz: 'Mening buyurtmalarim' },
        { key: 'orders.subtitle', en: 'Track, manage, and reorder your favorites', uz: 'Sevimlilaringizni kuzating, boshqaring va qayta buyurtma qiling' },
        { key: 'orders.total_orders', en: 'Total Orders', uz: 'Jami buyurtmalar' },
        { key: 'orders.total_spent', en: 'Total Spent', uz: 'Jami sarflangan' },
        { key: 'orders.most_ordered', en: 'Most Ordered', uz: 'Eng ko\'p buyurtma qilingan' },
        { key: 'orders.all', en: 'All', uz: 'Barchasi' },
        { key: 'orders.active', en: 'Active', uz: 'Faol' },
        { key: 'orders.completed', en: 'Completed', uz: 'Tugallangan' },
        { key: 'orders.canceled', en: 'Canceled', uz: 'Bekor qilingan' },
        { key: 'orders.newest', en: 'Newest', uz: 'Eng yangi' },
        { key: 'orders.oldest', en: 'Oldest', uz: 'Eng eski' },
        { key: 'orders.reorder', en: 'Reorder 🔄', uz: 'Qayta buyurtma 🔄' },
        { key: 'orders.no_orders', en: 'No orders yet', uz: 'Hali buyurtmalar yo\'q' },
        { key: 'orders.no_orders_hint', en: 'Your order history is empty. Start by browsing our delicious menu!', uz: 'Buyurtma tarixingiz bo\'sh. Mazali menyumizni ko\'rib boshlang!' },
        { key: 'orders.show_all', en: 'Show All Orders', uz: 'Barcha buyurtmalarni ko\'rsatish' },
        { key: 'orders.loading', en: 'Loading your orders...', uz: 'Buyurtmalaringiz yuklanmoqda...' },

        // Order statuses
        { key: 'status.pending', en: 'Pending', uz: 'Kutilmoqda' },
        { key: 'status.accepted', en: 'Accepted', uz: 'Qabul qilindi' },
        { key: 'status.cooking', en: 'Cooking', uz: 'Tayyorlanmoqda' },
        { key: 'status.on_the_way', en: 'On the Way', uz: 'Yo\'lda' },
        { key: 'status.delivered', en: 'Delivered', uz: 'Yetkazildi' },

        // Footer
        { key: 'footer.description', en: 'Fresh and delicious food delivered right to your campus room. Order in seconds, get it in minutes.', uz: 'Yangi va mazali ovqat to\'g\'ridan-to\'g\'ri kampus xonangizga yetkaziladi. Soniyalarda buyurtma bering, daqiqalarda oling.' },
        { key: 'footer.quick_links', en: 'Quick Links', uz: 'Tezkor havolalar' },
        { key: 'footer.support', en: 'Support', uz: 'Qo\'llab-quvvatlash' },
        { key: 'footer.help_center', en: 'Help Center', uz: 'Yordam markazi' },
        { key: 'footer.contact_us', en: 'Contact Us', uz: 'Biz bilan bog\'lanish' },
        { key: 'footer.privacy_policy', en: 'Privacy Policy', uz: 'Maxfiylik siyosati' },
        { key: 'footer.terms', en: 'Terms of Service', uz: 'Xizmat shartlari' },
        { key: 'footer.rights', en: 'All rights reserved.', uz: 'Barcha huquqlar himoyalangan.' },

        // Auth pages
        { key: 'auth.welcome_back', en: 'Welcome Back', uz: 'Xush kelibsiz' },
        { key: 'auth.sign_in_subtitle', en: 'Sign in to your GGKitchen account', uz: 'GGKitchen hisobingizga kiring' },
        { key: 'auth.email_placeholder', en: 'Email address', uz: 'Elektron pochta' },
        { key: 'auth.password_placeholder', en: 'Password', uz: 'Parol' },
        { key: 'auth.sign_in', en: 'Sign In', uz: 'Kirish' },
        { key: 'auth.no_account', en: "Don't have an account?", uz: 'Hisobingiz yo\'qmi?' },
        { key: 'auth.sign_up', en: 'Sign up', uz: 'Ro\'yxatdan o\'tish' },
        { key: 'auth.welcome_msg', en: 'Welcome back!', uz: 'Xush kelibsiz!' },

        // Courier page
        { key: 'courier.active', en: 'Active', uz: 'Faol' },
        { key: 'courier.in_transit', en: 'In Transit', uz: 'Yo\'lda' },
        { key: 'courier.available', en: 'Available', uz: 'Mavjud' },
        { key: 'courier.my_deliveries', en: 'My Deliveries', uz: 'Mening yetkazishlarim' },
        { key: 'courier.delivering', en: 'Orders you\'re delivering', uz: 'Siz yetkazayotgan buyurtmalar' },
        { key: 'courier.mark_delivered', en: 'Mark as Delivered', uz: 'Yetkazildi deb belgilash' },
        { key: 'courier.available_orders', en: 'Available Orders', uz: 'Mavjud buyurtmalar' },
        { key: 'courier.pick_up_desc', en: 'Pick up and deliver these orders', uz: 'Bu buyurtmalarni olib, yetkazing' },
        { key: 'courier.pick_up', en: 'Pick Up Order', uz: 'Buyurtmani olish' },
        { key: 'courier.no_orders', en: 'No available orders', uz: 'Mavjud buyurtmalar yo\'q' },
        { key: 'courier.check_back', en: 'Check back soon for new delivery assignments.', uz: 'Yangi yetkazish topshiriqlari uchun tez orada qaytib keling.' },

        // Common
        { key: 'common.currency', en: 'сўм', uz: 'сўм' },
    ];

    for (const t of translations) {
        await prisma.translation.create({ data: t });
    }

    console.log(`Seeded ${translations.length} translations`);
    console.log('Seed completed successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
