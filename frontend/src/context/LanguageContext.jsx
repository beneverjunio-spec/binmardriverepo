import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navigation
    nav_buy: 'Buy',
    nav_rent: 'Rent',
    nav_about: 'About',
    nav_how_it_works: 'How it works',
    nav_contact: 'Contact',
    nav_seller_studio: 'Seller Studio',
    nav_marketplace: 'Marketplace',
    nav_sign_in: 'Sign in',
    nav_sign_out: 'Sign out',
    nav_post_listing: 'Post a listing — free',

    // Hero & Search
    hero_badge: 'Free to register anywhere',
    hero_title: 'Buy, sell or rent a car,',
    hero_title_free: 'free',
    hero_title_suffix: 'across the Middle East.',
    hero_desc: 'No listing fees for owners, dealers or first-time sellers. Thousands of new and used vehicles, updated daily.',
    label_make: 'Make',
    label_country: 'Country',
    label_type: 'Type',
    label_max_price: 'Max price',
    any_make: 'Any make',
    any_country: 'Any country',
    buy_or_rent: 'Buy or rent',
    for_sale: 'For sale',
    for_rent: 'For rent',
    any_price: 'Any price',
    btn_search: 'Search',

    // Categories
    cat_all: 'All Vehicles',
    cat_suv: 'SUV',
    cat_sedan: 'Sedan',
    cat_coupe: 'Coupe',
    cat_luxury: 'Luxury',
    cat_truck: 'Truck',
    cat_convertible: 'Convertible',

    // Browse
    browse_title: 'Browse listings',
    showing_verified: 'Showing {count} live verified listing(s)',
    tab_all: 'All',
    tab_sale: 'For sale',
    tab_rent: 'For rent',
    sort_newest: 'Newest first',
    sort_low: 'Price: low to high',
    sort_high: 'Price: high to low',
    no_listings_title: 'No active listings yet',
    no_listings_desc: 'Check back soon or be the first to list a car for sale or rent across the GCC.',

    // Listing Details Modal & Card
    modal_year: 'Year',
    modal_mileage: 'Mileage',
    modal_transmission: 'Transmission',
    modal_fuel: 'Fuel type',
    modal_condition: 'Condition',
    modal_category: 'Category',
    cond_brand_new: 'Brand new',
    cond_used: 'Used',
    trans_auto: 'Automatic',
    trans_manual: 'Manual',
    fuel_petrol: 'Petrol',
    fuel_diesel: 'Diesel',
    fuel_hybrid: 'Hybrid',
    fuel_electric: 'Electric',
    open_google_maps: 'Open in Google Maps ↗',
    chat_whatsapp: 'Chat on WhatsApp',
    call_seller: 'Call',
    share_vehicle: 'Share this vehicle',
    share_fb: 'Facebook',
    share_ig: 'Instagram',
    share_tiktok: 'TikTok',
    share_link: 'Share Link',
    share_link_copied: 'Listing link copied to clipboard!',
    share_ig_copied: 'Link copied! Open Instagram to paste in stories or bio.',
    share_tiktok_copied: 'Link copied! Open TikTok to share.',

    // Seller Sign In & Register
    seller_sign_in_title: 'Sign in to Seller Studio',
    seller_sign_in_sub: 'Manage your listings, inquiries, and vehicle moderation status.',
    seller_email: 'Email address',
    seller_password: 'Password',
    seller_login_btn: 'Sign in to Seller Studio',
    seller_signing_in: 'Signing in...',
    seller_no_account: "Don't have an account?",
    seller_register_free: 'Register as seller — free',
    seller_admin_portal_link: 'Staff administrator? Access Admin Portal →',
    seller_invalid_creds: 'Invalid email or password.',

    // Seller Registration
    reg_who_title: "Who's registering?",
    reg_who_desc: 'Open to individual vehicle owners, dealers, and corporate rental companies across the Middle East.',
    reg_individual: 'Individual seller / private owner',
    reg_individual_note: 'Requires Admin Approval',
    reg_company: 'Commercial seller / dealer',
    reg_company_note: 'Requires Admin Approval',
    reg_continue: 'Continue →',
    reg_back: 'Back',
    reg_already_account: 'Already have an account? Sign in',
    reg_credentials_title: 'Account credentials',
    reg_credentials_desc: 'Use your email and a secure password to sign in.',
    reg_phone: 'Mobile number (optional)',
    reg_about_you: 'Tell us about you',
    reg_dealer_details: 'Dealer & company details',
    reg_full_name: 'Full name',
    reg_company_name: 'Company / Dealership name',
    reg_license_num: 'Trade license number',
    reg_id_upload_label: 'National ID / Passport Verification Document',
    reg_id_upload_btn: 'Click to upload National ID / Passport / Driving License (PDF / JPG / PNG)',
    reg_license_upload_label: 'Commercial Trade License Document',
    reg_license_upload_btn: 'Click to upload Commercial Trade License (PDF / JPG / PNG)',
    reg_submit_btn: 'Submit for Admin Verification',
    reg_submitting_btn: 'Submitting registration...',

    // Admin Login & Portal
    admin_login_title: 'Admin Operations Portal',
    admin_login_sub: 'Authorized staff access for listing moderation and seller verification.',
    admin_email_label: 'Staff Email',
    admin_password_label: 'Password',
    admin_login_btn: 'Sign in to Operations Portal',
    admin_portal_header: 'Admin Operations Portal',
    admin_tab_dashboard: 'Dashboard',
    admin_tab_moderation: 'Moderation queue',
    admin_tab_dealers: 'Dealer verification',
    admin_tab_live_listings: 'All live listings',
    admin_tab_notifications: 'Notifications',
    admin_tab_staff: 'Staff & Admins',
    admin_exit_marketplace: 'Exit to Marketplace',
    admin_pending_review: 'pending review',
    admin_approve_btn: 'Approve & Publish',
    admin_reject_btn: 'Reject',
    admin_inspect_btn: 'Inspect All',
    admin_view_doc_btn: 'View Document',

    // Language Toggle
    lang_toggle_name: 'العربية',
    lang_current: 'English'
  },

  ar: {
    // Navigation
    nav_buy: 'شراء',
    nav_rent: 'استئجار',
    nav_about: 'عن بنمار',
    nav_how_it_works: 'كيف يعمل',
    nav_contact: 'اتصل بنا',
    nav_seller_studio: 'استوديو البائع',
    nav_marketplace: 'سوق المركبات',
    nav_sign_in: 'تسجيل الدخول',
    nav_sign_out: 'تسجيل الخروج',
    nav_post_listing: 'أضف إعلانك — مجاناً',

    // Hero & Search
    hero_badge: 'التسجيل مجاني في جميع أنحاء الخليج',
    hero_title: 'شراء وبيع واستئجار السيارات،',
    hero_title_free: 'مجاناً',
    hero_title_suffix: 'في جميع أنحاء الشرق الأوسط.',
    hero_desc: 'بدون أي رسوم عرض للملاك أو الوكلاء أو البائعين الجدد. آلاف المركبات الجديدة والمستعملة، تتجدد يومياً.',
    label_make: 'الشركة المصنعة',
    label_country: 'الدولة',
    label_type: 'نوع الإعلان',
    label_max_price: 'الحد الأقصى للسعر',
    any_make: 'جميع الشركات',
    any_country: 'جميع الدول',
    buy_or_rent: 'شراء أو استئجار',
    for_sale: 'للبيع',
    for_rent: 'للإيجار',
    any_price: 'أي سعر',
    btn_search: 'بحث',

    // Categories
    cat_all: 'جميع المركبات',
    cat_suv: 'دفع رباعي (SUV)',
    cat_sedan: 'سيدان',
    cat_coupe: 'كوبيه',
    cat_luxury: 'فاخرة',
    cat_truck: 'شاحنة / بيك آب',
    cat_convertible: 'مكشوفة',

    // Browse
    browse_title: 'تصفح الإعلانات',
    showing_verified: 'عرض {count} إعلان نشط وموثق',
    tab_all: 'الكل',
    tab_sale: 'للبيع',
    tab_rent: 'للإيجار',
    sort_newest: 'الأحدث أولاً',
    sort_low: 'السعر: من الأقل إلى الأعلى',
    sort_high: 'السعر: من الأعلى إلى الأقل',
    no_listings_title: 'لا توجد إعلانات نشطة حالياً',
    no_listings_desc: 'عد قريباً أو كن أول من يضيف مركبة للبيع أو الإيجار في دول الخليج.',

    // Listing Details Modal & Card
    modal_year: 'سنة الصنع',
    modal_mileage: 'المسافة المقطوعة',
    modal_transmission: 'ناقل الحركة',
    modal_fuel: 'نوع الوقود',
    modal_condition: 'الحالة',
    modal_category: 'الفئة',
    cond_brand_new: 'جديد تماماً',
    cond_used: 'مستعمل',
    trans_auto: 'أوتوماتيك',
    trans_manual: 'يدوي',
    fuel_petrol: 'بنزين',
    fuel_diesel: 'ديزل',
    fuel_hybrid: 'هايبرد',
    fuel_electric: 'كهربائي',
    open_google_maps: 'فتح في خرائط جوجل ↗',
    chat_whatsapp: 'محادثة عبر واتساب',
    call_seller: 'اتصال',
    share_vehicle: 'مشاركة هذه المركبة',
    share_fb: 'فيسبوك',
    share_ig: 'إنستغرام',
    share_tiktok: 'تيك توك',
    share_link: 'نسخ الرابط',
    share_link_copied: 'تم نسخ رابط المركبة بنجاح!',
    share_ig_copied: 'تم نسخ الرابط! افتح إنستغرام لمشاركته في الستوري أو البايو.',
    share_tiktok_copied: 'تم نسخ الرابط! افتح تيك توك للمشاركة.',

    // Seller Sign In & Register
    seller_sign_in_title: 'تسجيل الدخول إلى استوديو البائع',
    seller_sign_in_sub: 'إدارة إعلاناتك واستفسارات المشترين وحالة التحقق من المركبات.',
    seller_email: 'البريد الإلكتروني',
    seller_password: 'كلمة المرور',
    seller_login_btn: 'الدخول إلى استوديو البائع',
    seller_signing_in: 'جاري تسجيل الدخول...',
    seller_no_account: 'ليس لديك حساب بعد؟',
    seller_register_free: 'سجل كبائع — مجاناً',
    seller_admin_portal_link: 'أحد مسؤولي النظام؟ الدخول لبوابة الإدارة ←',
    seller_invalid_creds: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',

    // Seller Registration
    reg_who_title: 'من يقوم بالتسجيل؟',
    reg_who_desc: 'متاح لأصحاب المركبات الأفراد، والمعارض، وشركات التأجير في الشرق الأوسط.',
    reg_individual: 'بائع فردي / مالك خاص',
    reg_individual_note: 'يتطلب موافقة الإدارة',
    reg_company: 'بائع تجاري / معرض سيارات',
    reg_company_note: 'يتطلب موافقة الإدارة',
    reg_continue: 'متابعة ←',
    reg_back: 'رجوع',
    reg_already_account: 'لديك حساب بالفعل؟ تسجيل الدخول',
    reg_credentials_title: 'بيانات الحساب',
    reg_credentials_desc: 'استخدم بريدك الإلكتروني وكلمة مرور آمنة لتسجيل الدخول.',
    reg_phone: 'رقم الهاتف المتحرك (اختياري)',
    reg_about_you: 'أخبرنا عنك',
    reg_dealer_details: 'بيانات المعرض والشركة',
    reg_full_name: 'الاسم الكامل',
    reg_company_name: 'اسم الشركة / المعرض',
    reg_license_num: 'رقم الرخصة التجارية',
    reg_id_upload_label: 'وثيقة التحقق (الهوية الوطنية / جواز السفر / رخصة القيادة)',
    reg_id_upload_btn: 'انقر لتحميل الهوية الوطنية أو جواز السفر (PDF / JPG / PNG)',
    reg_license_upload_label: 'وثيقة الرخصة التجارية للمنشأة',
    reg_license_upload_btn: 'انقر لتحميل وثيقة الرخصة التجارية (PDF / JPG / PNG)',
    reg_submit_btn: 'إرسال لتدقيق وموافقة الإدارة',
    reg_submitting_btn: 'جاري إرسال طلب التسجيل...',

    // Admin Login & Portal
    admin_login_title: 'بوابة العمليات والإدارة',
    admin_login_sub: 'دخول الموظفين المصرح لهم لمراجعة الإعلانات والتحقق من الوكلاء.',
    admin_email_label: 'البريد الإلكتروني للموظف',
    admin_password_label: 'كلمة المرور',
    admin_login_btn: 'الدخول إلى بوابة العمليات',
    admin_portal_header: 'بوابة العمليات والإدارة',
    admin_tab_dashboard: 'لوحة التحكم',
    admin_tab_moderation: 'قائمة تدقيق المركبات',
    admin_tab_dealers: 'التحقق من الوكلاء',
    admin_tab_live_listings: 'جميع الإعلانات النشطة',
    admin_tab_notifications: 'الإشعارات',
    admin_tab_staff: 'الموظفون والمشرفون',
    admin_exit_marketplace: 'الخروج إلى السوق',
    admin_pending_review: 'قيد المراجعة',
    admin_approve_btn: 'موافقة ونشر',
    admin_reject_btn: 'رفض',
    admin_inspect_btn: 'معاينة الكل',
    admin_view_doc_btn: 'عرض الوثيقة',

    // Language Toggle
    lang_toggle_name: 'English',
    lang_current: 'العربية'
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('binmar_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = (newLang) => {
    const valid = newLang === 'ar' ? 'ar' : 'en';
    setLangState(valid);
    try {
      localStorage.setItem('binmar_lang', valid);
    } catch {}
    document.documentElement.dir = valid === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = valid;
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key, replacements = {}) => {
    const dict = translations[lang] || translations.en;
    let text = dict[key] || translations.en[key] || key;
    if (replacements && typeof replacements === 'object') {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }
    return text;
  };

  const isRTL = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback safe context if rendered outside provider
    return {
      lang: 'en',
      setLang: () => {},
      t: (key) => translations.en[key] || key,
      isRTL: false
    };
  }
  return ctx;
}
