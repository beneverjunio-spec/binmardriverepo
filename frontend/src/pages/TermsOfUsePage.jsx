import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function TermsOfUsePage({ onBack }) {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: 'inherit' }}>
      {/* Hero */}
      <div className="info-hero">
        <h1>{isAr ? 'شروط الاستخدام' : 'Terms of Use'}</h1>
        <p>
          {isAr
            ? 'آخر تحديث: 20/10/2026 — مجموعة بنمار'
            : 'Last Updated: 10/20/2026 — Binmar Group'}
        </p>
      </div>

      <div className="info-section" style={{ maxWidth: 860, margin: '0 auto', lineHeight: 1.8, color: 'var(--ink)' }}>

        <p style={{ color: 'var(--ink-soft)', marginBottom: '2rem' }}>
          {isAr ? 'الموقع الإلكتروني:' : 'Website:'}{' '}
          <a href="https://binmardrive.binmargroup.com/" style={{ color: 'var(--gold-bright)' }}>
            https://binmardrive.binmargroup.com/
          </a>
        </p>

        {/* Section 1 */}
        <h2 style={sectionTitle}>{isAr ? '1. المقدمة والقبول' : '1. Introduction and Acceptance'}</h2>
        <p>
          {isAr
            ? 'مرحباً بك في بنمار درايف. بنمار درايف هو سوق إلكتروني للسيارات صُمم للتواصل بين الأفراد وأصحاب المركبات ووكلاء السيارات وشركات البيع بالتجزئة ووكالات التأجير والأشخاص المهتمين بشراء أو بيع أو استئجار المركبات.'
            : 'Welcome to BinmarDrive. BinmarDrive is an online automotive marketplace designed to connect individuals, vehicle owners, car dealers, retailers, and rental agencies with people interested in buying, selling, or renting vehicles.'}
        </p>
        <p>
          {isAr
            ? 'تحكم شروط الاستخدام هذه ("الشروط") وصولك إلى موقع بنمار درايف الإلكتروني وتطبيقاته وخدماته واستخدامك لها. بالوصول إلى بنمار درايف أو استخدامه أو التسجيل فيه، فإنك توافق على الامتثال لهذه الشروط وسياسة الخصوصية الخاصة بنا. إذا كنت لا توافق على هذه الشروط، يجب عليك عدم استخدام المنصة.'
            : 'These Terms of Use ("Terms") govern your access to and use of the BinmarDrive website, mobile applications, marketplace services, account features, vehicle listings, communication tools, and related services. By accessing, registering for, or using BinmarDrive, you agree to comply with these Terms and our Privacy Policy. If you do not agree with these Terms, you must not use the platform.'}
        </p>
        <p>
          {isAr
            ? 'تسري هذه الشروط على جميع المستخدمين بما في ذلك: المشترين الأفراد والباحثين عن مركبات، وأصحاب المركبات والبائعين الخصوصيين، ووكلاء السيارات والمعارض وشركات البيع بالتجزئة، ووكالات التأجير، والزوار.'
            : 'These Terms apply to all users, including: Individual buyers and vehicle seekers, individual vehicle owners and private sellers, car dealers and showrooms, vehicle retailers and commercial sellers, vehicle rental agencies, registered business accounts, and visitors and other platform users.'}
        </p>

        {/* Section 2 */}
        <h2 style={sectionTitle}>{isAr ? '2. عن بنمار درايف' : '2. About BinmarDrive'}</h2>
        <p>
          {isAr
            ? 'يعمل بنمار درايف كسوق إلكتروني يسهّل اكتشاف المركبات والإعلان عنها والتواصل بين المشترين والبائعين وأصحاب المركبات والوكلاء ومزودي التأجير. تتيح المنصة للمستخدمين تصفح المركبات المتاحة، وإنشاء حسابات فردية أو تجارية، ونشر إعلانات المركبات، وتحميل الصور والأوصاف، والتواصل مع البائعين ووكلاء التأجير.'
            : 'BinmarDrive operates as an online marketplace that facilitates the discovery, advertisement, and connection of vehicle buyers, sellers, owners, dealers, and rental providers. The platform allows users to: Browse available vehicles, create individual or business accounts, publish vehicle advertisements, upload vehicle photographs and descriptions, contact sellers and rental agencies, submit vehicle inquiries, and manage listings and account information.'}
        </p>
        <p>
          {isAr
            ? 'يوفر بنمار درايف منصة رقمية لتواصل المستخدمين. ما لم يُنص صراحةً على خلاف ذلك في اتفاقية مكتوبة منفصلة، فإن بنمار درايف ليس البائع أو المالك أو المشتري أو مزود التأجير أو المفتش أو ضامن أي مركبة مدرجة على المنصة. أي عملية شراء أو بيع أو تأجير أو فحص أو أي معاملة أخرى تتم في المقام الأول بين المستخدمين أو الشركات المعنية.'
            : 'BinmarDrive provides a digital platform for users to connect. Unless expressly stated otherwise in a separate written agreement, BinmarDrive is not itself the seller, owner, buyer, rental provider, vehicle inspector, financing provider, or guarantor of any vehicle listed on the platform. Any purchase, sale, rental, inspection, financing, delivery, or other transaction is primarily between the relevant users or businesses involved.'}
        </p>

        {/* Section 3 */}
        <h2 style={sectionTitle}>{isAr ? '3. الأهلية وحسابات المستخدمين' : '3. Eligibility and User Accounts'}</h2>
        <p>
          {isAr
            ? 'يجب أن تكون مؤهلاً قانونياً للدخول في اتفاقية ملزمة وفقاً للقوانين المعمول بها لاستخدام المنصة في المعاملات. يجب على المستخدمين تقديم معلومات دقيقة وكاملة وحديثة عند إنشاء الحساب، والحفاظ على سرية بيانات تسجيل الدخول، وإخطار بنمار درايف في حال الاشتباه بنشاط غير مصرح به. يجب ألا تنشئ حساباً باستخدام هوية شخص آخر أو تقديم معلومات تسجيل مضللة.'
            : 'You must be legally capable of entering into a binding agreement under the laws applicable to you to use the platform for transactions. Users must provide accurate, complete, and current information when creating an account, maintain the confidentiality of login credentials, keep account information updated, and notify BinmarDrive if they suspect unauthorized account activity. You must not create an account using another person\'s identity or provide misleading registration information.'}
        </p>
        <p>
          {isAr
            ? 'يحتفظ بنمار درايف بالحق في تقييد أو تعليق أو رفض تسجيل الحساب حيثما كانت المعلومات غير دقيقة أو مشبوهة أو غير متوافقة مع متطلبات المنصة أو القانون المعمول به. لا يجوز للمستخدمين نقل حساباتهم أو بيعها أو مشاركتها مع أشخاص غير مصرح لهم.'
            : 'BinmarDrive reserves the right to restrict, suspend, or reject account registration where information is inaccurate, incomplete, suspicious, or inconsistent with platform requirements or applicable law. Users must not transfer, sell, or share their accounts with unauthorized persons.'}
        </p>

        {/* Section 4 */}
        <h2 style={sectionTitle}>{isAr ? '4. أنواع المستخدمين ومسؤولياتهم' : '4. User Types and Responsibilities'}</h2>

        <h3 style={subsectionTitle}>{isAr ? '4.1 المشترون الأفراد' : '4.1 Individual Buyers'}</h3>
        <p>{isAr ? 'يوافق الأفراد الذين يتصفحون المركبات أو يتصلون بالبائعين على: تقديم معلومات اتصال حقيقية عند الاستفسار، والتواصل باحترام مع البائعين، والتحقق من معلومات المركبة قبل اتخاذ قرارات الشراء، وإجراء الفحوصات اللازمة، وتأكيد جميع التفاصيل المالية والقانونية قبل إتمام المعاملة.' : 'Individuals browsing or contacting vehicle sellers agree to: Provide genuine contact information when making inquiries, communicate respectfully with sellers, verify vehicle information before making purchasing decisions, conduct appropriate inspections and checks, and confirm all financial and legal details before completing a transaction.'}</p>

        <h3 style={subsectionTitle}>{isAr ? '4.2 البائعون الأفراد وأصحاب المركبات' : '4.2 Individual Sellers and Vehicle Owners'}</h3>
        <p>{isAr ? 'يوافق الأفراد الذين يعلنون عن مركباتهم على: امتلاك الحق القانوني أو التفويض المناسب للإعلان عن المركبة، وتقديم أوصاف دقيقة، والإفصاح عن المعلومات المادية المعروفة حول حالة المركبة، ونشر صور حقيقية، وتقديم معلومات دقيقة عن الأسعار والتوفر، وإزالة الإعلانات أو تحديثها عند بيع المركبة أو تأجيرها أو توقفها عن الإتاحة.' : 'Individuals advertising vehicles agree to: Have the legal right or proper authorization to advertise the vehicle, provide accurate vehicle descriptions, disclose known material information about the vehicle\'s condition, publish genuine photographs, provide accurate pricing and availability information, and remove or update advertisements when a vehicle is sold, rented, or no longer available.'}</p>

        <h3 style={subsectionTitle}>{isAr ? '4.3 الوكلاء والمعارض وشركات البيع بالتجزئة' : '4.3 Dealers, Showrooms and Retailers'}</h3>
        <p>{isAr ? 'يوافق البائعون التجاريون على: تقديم معلومات تسجيل أعمال دقيقة وبيانات اتصال حيثما طُلب ذلك، والإعلان عن المركبات المصرح لهم بتقديمها، والحفاظ على معلومات مخزون وأسعار دقيقة، وتجنب الإعلانات المضللة عن المركبات، والامتثال لقوانين التجارة وحماية المستهلك والإعلانات المعمول بها، والرد على استفسارات العملاء باحترافية، وتحديث القوائم غير المتاحة أو المباعة على الفور.' : 'Commercial sellers agree to: Provide accurate business registration and contact information where requested, advertise vehicles they are authorized to offer, maintain accurate stock and pricing information, avoid misleading vehicle advertisements, comply with applicable commercial and consumer protection laws, respond to customer inquiries professionally, and update unavailable or sold listings promptly.'}</p>

        <h3 style={subsectionTitle}>{isAr ? '4.4 وكالات التأجير ومزودو تأجير المركبات' : '4.4 Rental Agencies and Vehicle Rental Providers'}</h3>
        <p>{isAr ? 'يوافق مزودو التأجير على: امتلاك الصلاحية القانونية لتقديم المركبات المعلنة للتأجير، وتقديم أسعار وشروط تأجير دقيقة، والإفصاح بوضوح عن متطلبات التأجير والودائع وقيود المسافة وشروط التأمين والرسوم الإضافية، وضمان استيفاء المركبات للمتطلبات القانونية والسلامة المعمول بها.' : 'Rental providers agree to: Have the legal authority to offer advertised vehicles for rent, provide accurate rental prices and conditions, clearly disclose rental requirements, deposits, mileage restrictions, insurance conditions, and additional charges, and ensure vehicles offered for rent meet applicable legal and safety requirements.'}</p>

        {/* Section 5 */}
        <h2 style={sectionTitle}>{isAr ? '5. قوائم المركبات والإعلانات' : '5. Vehicle Listings and Advertisements'}</h2>
        <p>{isAr ? 'يجوز للمستخدمين نشر إعلانات المركبات وفقاً لمتطلبات القائمة في المنصة والقوانين المعمول بها. يجب أن تحتوي كل قائمة مركبة على معلومات دقيقة وذات صلة. البائعون والمعلنون مسؤولون حصراً عن دقة قوائمهم وقانونيتها واكتمالها.' : 'Users may publish vehicle advertisements subject to the platform\'s listing requirements and applicable laws. Each vehicle listing should contain accurate and relevant information including vehicle make and model, manufacturing year, condition, mileage, specifications, photographs, asking or rental price, general vehicle location, and availability. Sellers and advertisers are solely responsible for the accuracy, legality, and completeness of their listings.'}</p>
        <p>{isAr ? 'يجب على المستخدمين عدم نشر: معلومات مركبة زائفة أو مضللة، وإعلانات عن مركبات غير مصرح لهم بتقديمها، ومركبات مسروقة أو محصولة بطريقة غير مشروعة، وقوائم مكررة أو خادعة، وأسعار غير صحيحة لاستقطاب المستخدمين، وصور مضللة أو معدلة تخل تمثيل المركبة بشكل جوهري.' : 'Users must not publish: False or misleading vehicle information, advertisements for vehicles they are not authorized to offer, stolen or unlawfully obtained vehicles, duplicate or deceptive listings, incorrect prices intended to attract users, or misleading photographs that materially misrepresent a vehicle.'}</p>
        <p>{isAr ? 'قد تراجع بنمار درايف القوائم المنتهكة لهذه الشروط أو القانون المعمول به وتعدلها أو ترفضها أو تعلقها أو تزيلها. لا يضمن بنمار درايف أن كل قائمة مركبة قد تم فحصها أو التحقق منها بشكل مستقل.' : 'BinmarDrive may review, edit, reject, suspend, or remove listings that violate these Terms or applicable law. BinmarDrive does not guarantee that every vehicle listing has been independently inspected or verified.'}</p>

        {/* Section 6 */}
        <h2 style={sectionTitle}>{isAr ? '6. معلومات المركبة ومسؤولية المشتري' : '6. Vehicle Information and Buyer Responsibility'}</h2>
        <p>{isAr ? 'يتحمل المشترون والمستأجرون مسؤولية إجراء عمليات التحقق الخاصة بهم قبل الدخول في معاملة. يجب على المشترين التحقق بشكل مستقل من ملكية المركبة وتفاصيل التسجيل وتاريخ الصيانة والحوادث والمواصفات والتمويل القائم أو القيود القانونية. أي قرار بشراء أو استئجار مركبة يتخذه المستخدم وفق تقديره الخاص وبعد إجراء الفحوصات المناسبة.' : 'Buyers and renters are responsible for conducting their own checks before entering into a transaction. Buyers should independently verify vehicle ownership and seller authorization, vehicle registration details, VIN where applicable, vehicle condition and maintenance history, accident and damage history, mileage and specifications, and outstanding finance or legal restrictions. Any decision to purchase or rent a vehicle is made at the user\'s own discretion and following appropriate checks.'}</p>

        {/* Section 7 */}
        <h2 style={sectionTitle}>{isAr ? '7. التواصل والمعاملات بين المستخدمين' : '7. Communication and Transactions Between Users'}</h2>
        <p>{isAr ? 'قد يوفر بنمار درايف أدوات تسمح للمشترين والبائعين وأصحاب المركبات ووكالات التأجير بالتواصل. المستخدمون مسؤولون عن اتصالاتهم ومفاوضاتهم واتفاقياتهم ومعاملاتهم مع المستخدمين الآخرين. لا يكون بنمار درايف طرفاً في الاتفاقيات المبرمة مباشرة بين المستخدمين ما لم يُتفق على ذلك كتابياً بشكل صريح.' : 'BinmarDrive may provide tools that allow buyers, sellers, vehicle owners, and rental agencies to communicate. Users are responsible for communications, negotiations, agreements, and transactions they enter into with other users. BinmarDrive is not a party to agreements made directly between users unless expressly agreed in a separate written contract. Users must not use the platform to mislead, threaten, harass, defraud, or exploit other users.'}</p>

        {/* Section 8 */}
        <h2 style={sectionTitle}>{isAr ? '8. طلبات وحجوزات التأجير' : '8. Rental Requests and Bookings'}</h2>
        <p>{isAr ? 'لا يشكل الاستفسار عن التأجير تلقائياً حجزاً مؤكداً أو اتفاقية تأجير ملزمة. يُؤكَّد حجز التأجير فقط عندما يقبله مزود التأجير المعني من خلال العملية المعمول بها أو عندما يبرم الطرفان اتفاقية سارية. يجب على مزود التأجير توصيل مدة وسعر التأجير والودائع الأمنية وشروط التأمين وترتيبات التسليم والإعادة وشروط الإلغاء بوضوح.' : 'A rental inquiry does not automatically constitute a confirmed reservation or binding rental agreement. A rental booking is confirmed only when the relevant rental provider accepts it through the applicable process or the parties otherwise enter into a valid agreement. The rental provider is responsible for clearly communicating rental duration, rental price, security deposit, insurance conditions, driver eligibility, mileage limitations, collection and return arrangements, and cancellation conditions. Users must review the rental agreement before accepting a vehicle.'}</p>

        {/* Section 9 */}
        <h2 style={sectionTitle}>{isAr ? '9. المدفوعات والرسوم والمبالغ المستردة' : '9. Payments, Fees and Refunds'}</h2>
        <p>{isAr ? 'قد يُقدّم بنمار درايف خدمات مدفوعة وحزم قوائم واشتراكات وكلاء وميزات ترويجية. ستُبلَّغ عن أي رسوم منصة مطبقة قبل شراء الخدمة ذات الصلة. ما لم تكن ميزة الدفع مقدمة صراحةً من بنمار درايف، فإن مدفوعات شراء المركبات وإيجارها والودائع وغيرها من مدفوعات المعاملات تُرتَّب مباشرة بين المستخدمين أو الشركات المعنية.' : 'BinmarDrive may introduce paid services, listing packages, dealer subscriptions, promotional features, or other commercial features. Any applicable platform fees will be communicated before the user purchases the relevant service. Unless a payment feature is expressly offered by BinmarDrive, vehicle purchase prices, rental payments, deposits, and other transaction payments are arranged directly between the relevant users or businesses. BinmarDrive is not responsible for payment disputes between users where the platform has not expressly undertaken responsibility for processing the payment.'}</p>

        {/* Section 10 */}
        <h2 style={sectionTitle}>{isAr ? '10. الأنشطة المحظورة' : '10. Prohibited Activities'}</h2>
        <p>{isAr ? 'يجب على المستخدمين عدم استخدام بنمار درايف لـ:' : 'Users must not use BinmarDrive to:'}</p>
        <ul style={{ paddingInlineStart: '1.5rem' }}>
          {(isAr ? [
            'الإعلان عن مركبات مسروقة أو محصولة بطريقة غير مشروعة أو غير مصرح بها',
            'نشر إعلانات احتيالية أو مضللة',
            'انتحال هوية شخص آخر أو وكيل أو شركة أو مالك مركبة',
            'تحميل مستندات مزورة أو مُعدَّلة',
            'الانخراط في عمليات نصب أو احتيال مالي أو معاملات خادعة',
            'مضايقة المستخدمين الآخرين أو تهديدهم أو إساءتهم أو التمييز ضدهم',
            'نشر محتوى غير قانوني أو مسيء أو تشهيري أو منتهك',
            'جمع معلومات شخصية دون إذن',
            'الوصول إلى حساب مستخدم آخر دون إذن',
            'إدخال برامج ضارة أو فيروسات أو أكواد ضارة',
            'محاولة تجاوز أمان المنصة أو قيود الوصول',
            'التدخل في عمليات الموقع أو البنية التحتية للخادم',
            'استخراج بيانات المنصة تجارياً دون إذن',
            'استخدام بنمار درايف لأغراض غير مشروعة',
          ] : [
            'Advertise stolen, unlawfully obtained, or unauthorized vehicles',
            'Publish fraudulent or misleading advertisements',
            'Impersonate another person, dealer, business, or vehicle owner',
            'Upload false or manipulated documents',
            'Engage in scams, financial fraud, or deceptive transactions',
            'Harass, threaten, abuse, or discriminate against other users',
            'Publish unlawful, offensive, defamatory, or infringing content',
            'Collect personal information without authorization',
            'Access another user\'s account without permission',
            'Introduce malware, viruses, or harmful code',
            'Attempt to bypass platform security or access restrictions',
            'Interfere with website operations or server infrastructure',
            'Scrape, copy, or commercially extract platform data without authorization',
            'Use BinmarDrive for unlawful purposes or activities prohibited by applicable law',
          ]).map((item, i) => <li key={i}>{item}</li>)}
        </ul>

        {/* Section 11 */}
        <h2 style={sectionTitle}>{isAr ? '11. محتوى المستخدم والملكية الفكرية' : '11. User Content and Intellectual Property'}</h2>
        <p>{isAr ? 'يحتفظ المستخدمون بملكية المحتوى الذي يصنعونه بشكل مشروع ويرفعونه، مع مراعاة حقوق الأطراف الثالثة. بتقديم محتوى إلى بنمار درايف، فإنك تمنح بنمار درايف ترخيصاً غير حصري وعالمي وبدون رسوم لاستضافة المحتوى وتخزينه وعرضه وتوزيعه بما يكفي لتشغيل السوق وتحسينه. يُقر المستخدمون بأنهم يمتلكون المحتوى أو لديهم إذن بنشره وأنه لا ينتهك حقوق الآخرين.' : 'Users retain ownership of content they lawfully create and upload, subject to the rights of third parties. By submitting content to BinmarDrive, you grant BinmarDrive a non-exclusive, worldwide, royalty-free licence to host, store, reproduce, display, format, and distribute that content as reasonably necessary to operate and improve the marketplace. Users confirm that they own the content or have permission to publish it and that their content does not infringe another person\'s rights.'}</p>
        <p>{isAr ? 'اسم بنمار درايف وعلامته التجارية وتصميم موقعه وبنيته التقنية وغيرها من المواد الخاصة به محمية بموجب قوانين الملكية الفكرية المعمول بها. لا يجوز للمستخدمين نسخ أو إعادة إنتاج برامج المنصة الخاصة بها أو هندستها العكسية أو إعادة استخدام علامة بنمار درايف التجارية لأغراض تجارية غير مصرح بها.' : 'The BinmarDrive name, branding, website design, platform structure, software, logos, and other proprietary materials are protected by applicable intellectual property laws. Users must not copy, reproduce, or reverse engineer proprietary platform software, or reproduce BinmarDrive branding for unauthorized commercial purposes.'}</p>

        {/* Section 12 */}
        <h2 style={sectionTitle}>{isAr ? '12. الخدمات والروابط الخارجية' : '12. Third-Party Services and External Links'}</h2>
        <p>{isAr ? 'قد يتكامل بنمار درايف مع خدمات الطرف الثالث أو يرتبط بها، بما في ذلك مزودو الدفع وخدمات الخرائط ومنصات التواصل الاجتماعي والمواقع الخارجية. قد تعمل هذه الخدمات بموجب شروط وسياسات خصوصية منفصلة. لا يتحكم بنمار درايف في مواقع أو خدمات الطرف الثالث وليس مسؤولاً عن توفرها أو محتواها أو أمانها أو ممارساتها.' : 'BinmarDrive may integrate with or link to third-party services, including payment providers, mapping services, communication platforms, social media platforms, and external websites. Such services may operate under separate terms and privacy policies. BinmarDrive does not control third-party websites or services and is not responsible for their availability, content, security, or practices.'}</p>

        {/* Section 13 */}
        <h2 style={sectionTitle}>{isAr ? '13. توفر المنصة والتعديلات' : '13. Platform Availability and Modifications'}</h2>
        <p>{isAr ? 'يهدف بنمار درايف إلى توفير سوق موثوق وسهل الوصول. ومع ذلك، لا يمكن ضمان التوفر المتواصل. قد تتعرض المنصة أحياناً لانقطاعات الصيانة أو الأعطال التقنية أو تحديثات البرامج أو انقطاعات خدمة الطرف الثالث. قد يعدّل بنمار درايف أو يحدّث أو يعلّق أو يوقف ميزات المنصة حيثما كان ذلك ضرورياً لأسباب تشغيلية أو تقنية أو قانونية أو تجارية.' : 'BinmarDrive aims to provide a reliable and accessible marketplace. However, uninterrupted availability cannot be guaranteed. The platform may occasionally experience maintenance interruptions, technical failures, software updates, or third-party service interruptions. BinmarDrive may modify, update, suspend, or discontinue platform features where reasonably necessary for operational, technical, legal, or business reasons.'}</p>

        {/* Section 14 */}
        <h2 style={sectionTitle}>{isAr ? '14. إخلاء مسؤولية الضمانات' : '14. Disclaimer of Warranties'}</h2>
        <p>{isAr ? 'يوفر بنمار درايف السوق وخدماته على أساس "كما هو متاح" وفقاً للقانون المعمول به. إلى الحد الذي يسمح به القانون، لا يضمن بنمار درايف أن: كل قائمة مركبة دقيقة أو مكتملة، وكل بائع أو مشترٍ حقيقي أو موثَّق، وكل مركبة آمنة أو صالحة للتشغيل أو خالية من العيوب، وكل معاملة ستُكتمل بنجاح، أو أن المنصة ستكون متاحة دائماً دون انقطاع.' : 'BinmarDrive provides the marketplace and its services on an "as available" basis, subject to applicable law. To the extent permitted by law, BinmarDrive does not warrant that: Every vehicle listing is accurate or complete, every seller or buyer is genuine or verified, every vehicle is safe or roadworthy, every transaction will be completed successfully, or that the platform will always be available without interruption. Users are responsible for making independent checks and decisions before purchasing, selling, or renting a vehicle.'}</p>

        {/* Section 15 */}
        <h2 style={sectionTitle}>{isAr ? '15. تحديد المسؤولية' : '15. Limitation of Liability'}</h2>
        <p>{isAr ? 'إلى الحد الذي يسمح به القانون المعمول به، لا يتحمل بنمار درايف المسؤولية عن الخسائر غير المباشرة أو العرضية أو الخاصة أو العقابية أو التبعية الناشئة عن: المعاملات بين المستخدمين، والإعلانات الكاذبة أو المضللة، وعيوب المركبات أو أعطالها الميكانيكية، ونزاعات الملكية، والاحتيال المرتكب من قِبل مستخدمين آخرين، وفشل المدفوعات بين أطراف المعاملة، ونزاعات التأجير، والأعمال أو الإغفالات غير المصرح بها من قِبل أطراف ثالثة.' : 'To the extent permitted by applicable law, BinmarDrive shall not be responsible for indirect, incidental, special, punitive, or consequential losses arising from: Transactions between users, false or misleading vehicle advertisements, vehicle defects or mechanical failures, ownership disputes, fraud committed by other users, failed payments between transaction parties, rental disputes, or unauthorized actions by third parties. Nothing in this section limits liability where such limitation is prohibited by applicable law.'}</p>

        {/* Section 16 */}
        <h2 style={sectionTitle}>{isAr ? '16. التعويض' : '16. Indemnification'}</h2>
        <p>{isAr ? 'إلى الحد الذي يسمح به القانون، يوافق المستخدمون على التعويض والدفاع عن بنمار درايف ومشغّله القانوني والشركات التابعة له والمديرين والموظفين والممثلين المعتمدين ضد المطالبات والخسائر والمسؤوليات والأضرار ونفقات الاستشارة القانونية المعقولة الناجمة مباشرة عن: انتهاكهم لهذه الشروط، أو الأنشطة الاحتيالية أو غير المشروعة، أو الإعلانات الكاذبة أو المضللة، أو انتهاك القوانين المعمول بها.' : 'To the extent permitted by law, users agree to indemnify and hold harmless BinmarDrive, its lawful operator, affiliates, directors, employees, and authorized representatives against claims, losses, liabilities, damages, and reasonable legal expenses arising directly from: Their breach of these Terms, fraudulent or unlawful activities, false or misleading vehicle advertisements, unauthorized use of another person\'s information or intellectual property, their violation of applicable laws, or their transactions or contractual disputes with other users.'}</p>

        {/* Section 17 */}
        <h2 style={sectionTitle}>{isAr ? '17. تعليق الحساب وإنهاؤه' : '17. Account Suspension and Termination'}</h2>
        <p>{isAr ? 'قد يُقيّد بنمار درايف حساباً أو يعلقه أو ينهيه في حالات منها: انتهاك هذه الشروط، وتحديد النشاط الاحتيالي أو المشبوه، وتقديم معلومات كاذبة، وانتهاك قائمة لقواعد المنصة أو القانون المعمول به، وإنشاء مخاطر أمنية أو تشغيلية، أو اشتراط سلطة قانونية لاتخاذ الإجراء.' : 'BinmarDrive may restrict, suspend, or terminate an account where: These Terms have been violated, fraudulent or suspicious activity is identified, false information has been provided, a listing violates platform rules or applicable law, an account creates security or operational risks, or a lawful authority requires action. Users may request account closure through the available account settings or by contacting BinmarDrive. Account termination does not automatically remove information that must be retained for legal, accounting, security, or dispute-resolution purposes.'}</p>

        {/* Section 18 */}
        <h2 style={sectionTitle}>{isAr ? '18. الخصوصية والمعلومات الشخصية' : '18. Privacy and Personal Information'}</h2>
        <p>{isAr ? 'يخضع جمع المعلومات الشخصية ومعالجتها من خلال بنمار درايف لسياسة الخصوصية الخاصة ببنمار درايف. باستخدام المنصة، يقر المستخدمون بأن معلوماتهم الشخصية قد تتم معالجتها كما هو موضح في تلك السياسة وبموجب قوانين حماية البيانات المعمول بها.' : 'The collection and processing of personal information through BinmarDrive are governed by the BinmarDrive Privacy Policy. By using the platform, users acknowledge that their personal information may be processed as described in that policy and under applicable data protection laws. Users should review the Privacy Policy to understand how their personal information is collected, used, stored, and shared.'}</p>

        {/* Section 19 */}
        <h2 style={sectionTitle}>{isAr ? '19. التغييرات على هذه الشروط' : '19. Changes to These Terms'}</h2>
        <p>{isAr ? 'قد يُحدّث بنمار درايف هذه الشروط من وقت لآخر لتعكس التغييرات في الخدمات أو وظائف المنصة أو عمليات الأعمال أو القوانين المعمول بها. سيُنشر أحدث إصدار على الموقع الرسمي لبنمار درايف مع تاريخ المراجعة المحدَّث. يُشكّل الاستمرار في استخدام المنصة بعد سريان الشروط المنقحة قبولاً فقط بالقدر المسموح به وفق القانون المعمول به.' : 'BinmarDrive may update these Terms from time to time to reflect changes in services, platform functionality, business operations, or applicable laws. The latest version will be published on the official BinmarDrive website with an updated effective or revision date. Where required by law, BinmarDrive will provide notice or obtain user consent before implementing material changes. Continued use of the platform after revised Terms become effective constitutes acceptance only to the extent permitted by applicable law.'}</p>

        {/* Section 20 */}
        <h2 style={sectionTitle}>{isAr ? '20. القانون الحاكم وتسوية النزاعات' : '20. Governing Law and Dispute Resolution'}</h2>
        <p>{isAr ? 'تُحكم هذه الشروط بموجب قوانين الدولة المعمول بها. يجب معالجة أي نزاع ينشأ من هذه الشروط أولاً من خلال التواصل بحسن نية بين الأطراف المعنية. إذا تعذر حل النزاع من خلال التواصل المباشر، يجوز إحالته إلى المحكمة المختصة أو منتدى تسوية النزاعات المعمول به. لا يمنع هذا البند المستخدم من ممارسة حقوق المستهلك أو حماية البيانات الإلزامية المتاحة بموجب القانون المعمول به.' : 'These Terms shall be governed by the applicable laws of the relevant jurisdiction. Any dispute arising from these Terms shall first be addressed through good-faith communication between the relevant parties. If the dispute cannot be resolved through direct communication, it may be referred to the competent court or dispute-resolution forum. Nothing in this section prevents a user from exercising mandatory consumer or data protection rights available under applicable law.'}</p>

        {/* Section 21 */}
        <h2 style={sectionTitle}>{isAr ? '21. الأحكام العامة' : '21. General Provisions'}</h2>
        <ul style={{ paddingInlineStart: '1.5rem' }}>
          <li><strong>{isAr ? 'الاتفاقية الكاملة:' : 'Entire Agreement:'}</strong> {isAr ? 'تحكم هذه الشروط، جنباً إلى جنب مع سياسة الخصوصية وأي شروط خدمة إضافية معمول بها، استخدامك لبنمار درايف.' : 'These Terms, together with the Privacy Policy and any applicable additional service terms, govern your use of BinmarDrive.'}</li>
          <li><strong>{isAr ? 'قابلية الفصل:' : 'Severability:'}</strong> {isAr ? 'إذا تبيّن أن أي حكم غير صالح أو غير قابل للتطبيق، تستمر الأحكام المتبقية في السريان.' : 'If any provision is found invalid or unenforceable, the remaining provisions shall continue to apply.'}</li>
          <li><strong>{isAr ? 'عدم التنازل:' : 'No Waiver:'}</strong> {isAr ? 'عدم تطبيق حكم لا يُعدّ تنازلاً عن الحق في تطبيقه لاحقاً.' : 'Failure to enforce a provision does not constitute a waiver of the right to enforce it later.'}</li>
          <li><strong>{isAr ? 'عدم وجود وكالة:' : 'No Agency:'}</strong> {isAr ? 'لا تُنشئ هذه الشروط، ما لم يُتفق صراحةً على خلاف ذلك كتابياً، أي علاقة وكالة أو توظيف أو مشروع مشترك أو شراكة بين بنمار درايف والمستخدمين.' : 'Unless expressly agreed in writing, these Terms do not establish an agency, employment, joint venture, or partnership relationship between BinmarDrive and individual users, sellers, dealers, or rental agencies.'}</li>
          <li><strong>{isAr ? 'الحقوق القانونية الإلزامية:' : 'Mandatory Legal Rights:'}</strong> {isAr ? 'لا يُقصد بأي شيء في هذه الشروط تقييد الحقوق التي لا يجوز للمستخدمين التنازل عنها قانونياً بموجب القانون المعمول به.' : 'Nothing in these Terms is intended to restrict rights that users cannot legally waive under applicable law.'}</li>
        </ul>

        {/* Section 22 */}
        <h2 style={sectionTitle}>{isAr ? '22. معلومات الاتصال' : '22. Contact Information'}</h2>
        <p>{isAr ? 'للاستفسارات والشكاوى وقضايا الحساب وغيرها من المسائل المتعلقة بهذه الشروط، يرجى التواصل:' : 'For questions, complaints, account issues, or other matters relating to these Terms, please contact:'}</p>
        <div style={{ background: 'rgba(var(--gold-rgb, 212,175,55), 0.08)', borderRadius: 12, padding: '1.2rem 1.5rem', margin: '1rem 0' }}>
          <p style={{ margin: 0 }}>
            <strong>BINMARDRIVE {isAr ? 'دعم العملاء' : 'CUSTOMER SUPPORT'}</strong><br />
            {isAr ? 'البريد الإلكتروني:' : 'Email:'}{' '}
            <a href="mailto:Info@binmargroup.com" style={{ color: 'var(--gold-bright)' }}>
              Info@binmargroup.com
            </a><br />
            {isAr ? 'الموضوع:' : 'Subject:'} {isAr ? 'استفسار شروط استخدام بنمار درايف' : 'BinmarDrive Terms of Use Inquiry'}
          </p>
        </div>

        {/* Acknowledgement */}
        <div style={{ background: 'rgba(var(--gold-rgb, 212,175,55), 0.05)', borderRadius: 12, padding: '1.2rem 1.5rem', margin: '1.5rem 0', borderLeft: isAr ? 'none' : '3px solid var(--gold-bright)', borderRight: isAr ? '3px solid var(--gold-bright)' : 'none' }}>
          <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--ink-soft)' }}>
            <strong>{isAr ? 'الإقرار النهائي:' : 'Final Acknowledgement:'}</strong>{' '}
            {isAr
              ? 'بالوصول إلى بنمار درايف أو استخدامه، فإنك تؤكد أنك قد قرأت وفهمت شروط الاستخدام هذه وتوافق على الامتثال لها، وفقاً للقانون المعمول به.'
              : 'By accessing or using BinmarDrive, you confirm that you have read and understood these Terms of Use and agree to comply with them, subject to applicable law.'}
          </p>
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(128,128,128,0.2)', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
          {isAr
            ? 'بنمار درايف — سوقك لشراء وبيع واستئجار المركبات. نهاية شروط الاستخدام.'
            : 'BinmarDrive — Your Marketplace for Buying, Selling & Renting Vehicles. END OF TERMS OF USE.'}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <button className="btn-gold" onClick={onBack} style={{ minWidth: 180 }}>
            {isAr ? '← العودة' : '← Back'}
          </button>
        </div>
      </div>
    </div>
  );
}

const sectionTitle = {
  fontSize: '1.15rem',
  fontWeight: 700,
  marginTop: '2rem',
  marginBottom: '0.6rem',
  color: 'var(--gold-bright, #D4AF37)',
  borderBottom: '1px solid rgba(212,175,55,0.25)',
  paddingBottom: '0.35rem',
};

const subsectionTitle = {
  fontSize: '1rem',
  fontWeight: 600,
  marginTop: '1.2rem',
  marginBottom: '0.4rem',
  color: 'var(--ink)',
};
