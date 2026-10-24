import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function PrivacyPolicyPage({ onBack }) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: 'inherit' }}>
      {/* Hero */}
      <div className="info-hero">
        <h1>{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</h1>
        <p>
          {isAr
            ? 'آخر تحديث: 20/10/2026 — بنمار درايف، جزء من مجموعة بنمار'
            : 'Last Updated: 10/20/2026 — BinmarDrive, Part of Binmar Group'}
        </p>
      </div>

      <div className="info-section" style={{ maxWidth: 860, margin: '0 auto', lineHeight: 1.8, color: 'var(--ink)' }}>

        {/* Website header */}
        <p style={{ color: 'var(--ink-soft)', marginBottom: '2rem' }}>
          {isAr ? 'الموقع الإلكتروني:' : 'Website:'}{' '}
          <a href="https://binmardrive.binmargroup.com/" style={{ color: 'var(--gold-bright)' }}>
            https://binmardrive.binmargroup.com/
          </a>
        </p>

        {/* Section 1 */}
        <h2 style={sectionTitle}>{isAr ? '1. المقدمة' : '1. Introduction'}</h2>
        <p>
          {isAr
            ? 'مرحباً بك في بنمار درايف. بنمار درايف هو سوق إلكتروني للسيارات صُمم للتواصل بين الأفراد وأصحاب المركبات ووكلاء السيارات وشركات البيع بالتجزئة ووكالات التأجير والأشخاص المهتمين بشراء أو بيع أو استئجار المركبات. نحن نحترم خصوصيتك ونلتزم بحماية المعلومات الشخصية التي تقدمها عند الوصول إلى موقعنا الإلكتروني وتطبيقاتنا وخدماتنا.'
            : 'Welcome to BinmarDrive. BinmarDrive is an online automotive marketplace designed to connect individuals, vehicle owners, car dealers, retailers, and rental agencies with people interested in buying, selling, or renting vehicles. We respect your privacy and are committed to protecting the personal information you provide when accessing or using our website, mobile applications, marketplace services, and related features.'}
        </p>
        <p>
          {isAr
            ? 'توضح سياسة الخصوصية هذه المعلومات التي نجمعها، وكيفية استخدامها، ومتى نشاركها، وكيف نحميها، وما هي الخيارات والحقوق المتاحة لك بشأن معلوماتك الشخصية. بالوصول إلى بنمار درايف أو استخدامه، فإنك تقر بأنك قد قرأت سياسة الخصوصية هذه.'
            : 'This Privacy Policy explains what information we collect, how we use it, when we share it, how we protect it, and what choices and rights you may have regarding your personal information. By accessing or using BinmarDrive, you acknowledge that you have read this Privacy Policy.'}
        </p>

        {/* Section 2 */}
        <h2 style={sectionTitle}>{isAr ? '2. المعلومات التي نجمعها' : '2. Information We Collect'}</h2>
        <p>{isAr ? 'قد نجمع فئات مختلفة من المعلومات بحسب طريقة استخدامك لبنمار درايف.' : 'We may collect different categories of information depending on how you use BinmarDrive.'}</p>

        <h3 style={subsectionTitle}>{isAr ? '2.1 المعلومات الشخصية وبيانات الحساب' : '2.1 Personal and Account Information'}</h3>
        <p>{isAr ? 'عند التسجيل أو إنشاء حساب، قد نجمع: الاسم الكامل، عنوان البريد الإلكتروني، رقم الهاتف، بيانات الحساب، البلد والموقع العام، نوع الحساب (فرد، وكيل، أو وكالة تأجير)، وتفضيلات الملف الشخصي.' : 'When you register or create an account, we may collect: Full name, email address, mobile or telephone number, username and account credentials, country and general location, account type (individual, dealer, or rental agency), and profile information and preferences.'}</p>

        <h3 style={subsectionTitle}>{isAr ? '2.2 معلومات قائمة المركبات' : '2.2 Vehicle Listing Information'}</h3>
        <p>{isAr ? 'عند نشر إعلان مركبة، قد نجمع: ماركة الموديل وسنة الصنع والفئة والحالة والمسافة المقطوعة والرقم التعريفي ومواصفات المركبة والسعر والصور والوصف ومعلومات اتصال البائع. قد تكون بعض معلومات القائمة مرئية للعامة.' : 'When you publish a vehicle advertisement, we may collect: Vehicle make and model, manufacturing year, category, condition, mileage, VIN (where provided), registration details, specifications, asking or rental price, photographs, description, and seller contact information. Some vehicle listing information may be publicly visible.'}</p>

        <h3 style={subsectionTitle}>{isAr ? '2.3 معلومات الوكيل والشركة' : '2.3 Dealer and Business Information'}</h3>
        <p>{isAr ? 'للوكلاء والمعارض وشركات التأجير، قد نجمع: اسم الشركة، عنوان التواصل، البريد الإلكتروني، الموقع الإلكتروني وروابط التواصل الاجتماعي، معلومات الممثل المفوض، وبيانات ترخيص الأعمال.' : 'For dealers, showrooms, and rental agencies, we may collect: Business or company name, business address and contact details, business email and telephone number, website and social media links, authorized representative information, and business registration or licensing information where required.'}</p>

        <h3 style={subsectionTitle}>{isAr ? '2.4 معلومات التواصل والمعاملات' : '2.4 Communication and Transaction Information'}</h3>
        <p>{isAr ? 'عند التواصل مع مستخدم آخر أو استخدام ميزات السوق، قد نجمع: الرسائل والاستفسارات المرسلة عبر المنصة، وطلبات الحجز والمشاهدة، وطلبات دعم العملاء، والتقارير والشكاوى وسجلات التفاعل مع القوائم. يرجى تجنب مشاركة المعلومات الشخصية الحساسة غير الضرورية.' : 'When you contact another user or use marketplace features, we may collect: Messages and inquiries sent through the platform, vehicle viewing or rental requests, booking and inquiry details, customer support requests, reports, complaints, feedback, and records of interactions with listings. Please avoid sharing unnecessary sensitive personal information.'}</p>

        <h3 style={subsectionTitle}>{isAr ? '2.5 المعلومات التقنية ومعلومات الاستخدام' : '2.5 Technical and Usage Information'}</h3>
        <p>{isAr ? 'عند زيارة بنمار درايف، قد يتم جمع معلومات تقنية تلقائياً تشمل: عنوان IP، نوع المتصفح، نوع الجهاز ونظام التشغيل، الصفحات المزارة، تواريخ وأوقات الوصول، والمصادر المُحيلة. تستخدم المنصة ملفات تعريف الارتباط وتقنيات تتبع مماثلة.' : 'When you visit or use BinmarDrive, certain technical information may be collected automatically, including: IP address, browser type and version, device type and operating system, website pages visited, access dates and times, referral sources, and cookies and similar tracking technologies.'}</p>

        <h3 style={subsectionTitle}>{isAr ? '2.6 معلومات الموقع الجغرافي' : '2.6 Location Information'}</h3>
        <p>{isAr ? 'قد نجمع معلومات الموقع العامة كالبلد والمدينة أو موقع بحث المركبات المفضل. إذا تطلبت ميزة موقعاً دقيقاً، سنطلب الإذن حيثما اقتضى الأمر.' : 'We may collect general location information, such as your country, city, or preferred vehicle search location. If a feature requires precise device location, we will request permission where required.'}</p>

        <h3 style={subsectionTitle}>{isAr ? '2.7 المعلومات من أطراف ثالثة' : '2.7 Information from Third Parties'}</h3>
        <p>{isAr ? 'حيثما يسمح القانون المعمول به، قد نتلقى معلومات من: مزودي خدمات الدفع، ومزودي التحقق من الهوية والأعمال، وخدمات الإعلانات والتحليلات، ومزودي تسجيل الدخول الاجتماعي إذا كانت مفعّلة.' : 'Where permitted by applicable law, we may receive information from: Payment service providers, identity or business verification providers, advertising and analytics services, and social login providers if enabled.'}</p>

        {/* Section 3 */}
        <h2 style={sectionTitle}>{isAr ? '3. كيف نستخدم معلوماتك' : '3. How We Use Your Information'}</h2>
        <p>{isAr ? 'تستخدم بنمار درايف المعلومات المجمعة للأغراض التالية: إدارة الحسابات والتحقق منها، ونشر وإدارة قوائم المركبات وربط المشترين بالبائعين، والإجابة على استفسارات العملاء وتقديم الدعم الفني، واكتشاف الأنشطة المشبوهة وتأمين المنصة، وتحسين الوظائف والميزات، وإرسال إعلانات المنصة والعروض التسويقية حيثما يسمح القانون.' : 'BinmarDrive uses collected information for the following purposes: Creating and managing user accounts; publishing and managing vehicle listings and connecting buyers with sellers and renters; responding to customer support requests and technical assistance; detecting suspicious activities and protecting the platform; monitoring performance and improving features; and where permitted by law, sending platform announcements and marketing communications. You may opt out of promotional communications at any time.'}</p>

        {/* Section 4 */}
        <h2 style={sectionTitle}>{isAr ? '4. قوائم المركبات العامة ومحتوى المستخدم' : '4. Public Vehicle Listings and User Content'}</h2>
        <p>{isAr ? 'بنمار درايف هو سوق إلكتروني حيث يمكن للمستخدمين نشر إعلانات المركبات والملفات التجارية. المعلومات المدرجة في قائمة المركبة العامة قد تكون مرئية لزوار الموقع والمستخدمين المسجلين والمشترين المحتملين. يجب على المستخدمين مراجعة المعلومات التي ينشرونها بعناية وتجنب تضمين بيانات شخصية حساسة. لا ترفع وثائق الهوية أو المعلومات المالية أو العناوين الخاصة في الصور أو وصف القوائم العامة.' : 'BinmarDrive is a marketplace where users can publish vehicle advertisements and business profiles. Information included in a public vehicle listing may be visible to website visitors, registered users, and potential buyers or renters. Users should carefully review the information they publish and avoid including private information that they do not want publicly displayed. Do not upload identity documents, financial information, private addresses, or other sensitive personal information into public listing descriptions or photographs.'}</p>

        {/* Section 5 */}
        <h2 style={sectionTitle}>{isAr ? '5. متى نشارك معلوماتك' : '5. When We Share Your Information'}</h2>
        <p>{isAr ? 'لا تبيع بنمار درايف المعلومات الشخصية لأطراف ثالثة كنموذج أعمال. ومع ذلك، قد نشارك معلومات معينة في الحالات التالية: عند تسهيل استفسارات المشترين والبائعين ووكالات التأجير؛ مع مزودي الخدمة الموثوقين الداعمين لعملياتنا كالاستضافة والمدفوعات والتحليلات والأمان؛ للامتثال للمتطلبات القانونية والتنظيمية؛ في حالة أي عمليات اندماج أو اكتساب تجارية؛ أو بموافقتك الصريحة.' : 'BinmarDrive does not sell personal information to third parties as a business model. However, we may share certain information in the following circumstances: To facilitate buyer/seller/rental agency inquiries; with trusted service providers supporting our operations (hosting, payments, analytics, security); to comply with legal and regulatory requirements; in connection with any business merger or acquisition; or with your specific consent.'}</p>

        {/* Section 6 */}
        <h2 style={sectionTitle}>{isAr ? '6. ملفات تعريف الارتباط وتقنيات التتبع' : '6. Cookies and Tracking Technologies'}</h2>
        <p>{isAr ? 'قد تستخدم بنمار درايف ملفات تعريف الارتباط والبيكسل والتخزين المحلي وتقنيات مماثلة لدعم وظائف الموقع وتحسين تجربة المستخدم. يمكنك إدارة ملفات تعريف الارتباط أو تعطيلها من خلال إعدادات المتصفح. قد يؤثر تعطيل بعضها على بعض ميزات الموقع.' : 'BinmarDrive may use cookies, pixels, local storage, and similar technologies to support website functionality and improve the user experience. You can manage or disable cookies through your browser settings. Some essential cookies may be necessary for the website to operate correctly. Disabling certain cookies may affect some website features. Where required by applicable law, we will obtain consent before using non-essential cookies.'}</p>

        {/* Section 7 */}
        <h2 style={sectionTitle}>{isAr ? '7. أمان البيانات' : '7. Data Security'}</h2>
        <p>{isAr ? 'تتخذ بنمار درايف تدابير تقنية وتنظيمية معقولة لحماية المعلومات الشخصية من الوصول غير المصرح به والفقدان العرضي وسوء الاستخدام والتغيير والإتلاف. ومع ذلك، لا يمكن ضمان أمان أي موقع أو خدمة عبر الإنترنت بشكل كامل. المستخدمون مسؤولون عن الحفاظ على سرية كلمات مرور حساباتهم.' : 'BinmarDrive takes reasonable technical and organizational measures to protect personal information against unauthorized access, accidental loss, misuse or alteration, and unauthorized disclosure. However, no website, online service, or electronic transmission can be guaranteed to be completely secure. Users are responsible for maintaining the confidentiality of their account passwords.'}</p>

        {/* Section 8 */}
        <h2 style={sectionTitle}>{isAr ? '8. الاحتفاظ بالبيانات' : '8. Data Retention'}</h2>
        <p>{isAr ? 'نحتفظ بالمعلومات الشخصية فقط طالما كان ذلك ضرورياً بشكل معقول لتحقيق الأغراض الموضحة في سياسة الخصوصية هذه، وفقاً للمتطلبات القانونية المعمول بها. عندما لا تكون المعلومات الشخصية مطلوبة بعد الآن، سنتخذ خطوات معقولة لحذفها أو إخفاء هويتها أو التخلص منها بشكل آمن.' : 'We retain personal information only for as long as reasonably necessary to fulfill the purposes described in this Privacy Policy, subject to applicable legal requirements. When personal information is no longer required, we will take reasonable steps to delete, anonymize, or securely dispose of it, subject to applicable law.'}</p>

        {/* Section 9 */}
        <h2 style={sectionTitle}>{isAr ? '9. حقوقك في الخصوصية' : '9. Your Privacy Rights'}</h2>
        <p>{isAr ? 'اعتماداً على قوانين حماية البيانات المعمول بها، قد يكون لديك الحق في: طلب معلومات حول كيفية معالجة بياناتك الشخصية، والوصول إليها وطلب نسخة منها، وتصحيح المعلومات غير الدقيقة، وطلب حذفها أو تقييد معالجتها، وسحب الموافقة حيثما تستند المعالجة إليها، والاعتراض على أنشطة معالجة معينة، وتقديم شكوى إلى سلطة حماية البيانات المختصة.' : 'Depending on the applicable data protection laws, you may have the right to: Request information about how your personal data is processed; request access to and a copy of your personal information; request correction of inaccurate or incomplete information; request deletion or restriction of processing; withdraw consent where processing is based on consent; object to certain processing activities; and submit a complaint to the relevant data protection authority.'}</p>

        {/* Section 10 */}
        <h2 style={sectionTitle}>{isAr ? '10. النقل الدولي للبيانات' : '10. International Data Transfers'}</h2>
        <p>{isAr ? 'قد تستخدم بنمار درايف مزودي الاستضافة والخدمات السحابية الموجودين في دول مختلفة. نتيجةً لذلك، قد تتم معالجة المعلومات الشخصية أو تخزينها خارج البلد الذي جُمعت فيه. حيثما تحدث عمليات نقل دولية، ستتخذ بنمار درايف الخطوات المناسبة للامتثال لقوانين حماية البيانات المعمول بها.' : 'BinmarDrive may use hosting providers, cloud services, and other service providers located in different countries. As a result, personal information may be processed or stored outside the country in which it was collected. Where international transfers occur, BinmarDrive will take appropriate steps to ensure compliance with applicable data protection laws.'}</p>

        {/* Section 11 */}
        <h2 style={sectionTitle}>{isAr ? '11. المواقع والخدمات الخارجية' : '11. Third-Party Websites and Services'}</h2>
        <p>{isAr ? 'قد يحتوي بنمار درايف على روابط لمواقع خارجية وخدمات دفع ومنصات تواصل اجتماعي. تعمل هذه الخدمات بشكل مستقل وقد تمتلك سياسات خصوصية وشروط استخدام خاصة بها. لا تتحمل بنمار درايف المسؤولية عن ممارسات الخصوصية أو الأمان أو محتوى المواقع الخارجية التي لا تديرها.' : 'BinmarDrive may contain links to external websites, payment services, social media platforms, and other third-party applications. These external services operate independently and may have their own privacy policies and terms of use. BinmarDrive is not responsible for the privacy practices, security, or content of third-party websites that are not operated by us.'}</p>

        {/* Section 12 */}
        <h2 style={sectionTitle}>{isAr ? '12. خصوصية الأطفال' : '12. Children\'s Privacy'}</h2>
        <p>{isAr ? 'بنمار درايف مخصص للبالغين المسموح لهم قانونياً بالمشاركة في أنشطة شراء وبيع واستئجار المركبات. لا نجمع عمداً معلومات شخصية من الأطفال في انتهاك للقانون المعمول به.' : 'BinmarDrive is intended for adults who are legally permitted to participate in vehicle buying, selling, and rental activities. We do not knowingly collect personal information from children in violation of applicable law. Parents or legal guardians may contact us if they believe a child has provided personal information through the platform.'}</p>

        {/* Section 13 */}
        <h2 style={sectionTitle}>{isAr ? '13. مسؤوليات المستخدم' : '13. User Responsibilities'}</h2>
        <p>{isAr ? 'عند استخدام بنمار درايف، فإنك توافق على: تقديم معلومات حساب دقيقة ومحدثة، واستخدام المنصة لأغراض مشروعة، ونشر قوائم مركبات حقيقية ودقيقة، وتجنب تحميل معلومات شخص آخر دون إذن مناسب، وحماية بيانات تسجيل الدخول الخاصة بك، وتجنب مشاركة المعلومات الشخصية أو المالية الحساسة علنياً.' : 'When using BinmarDrive, you agree to: Provide accurate and up-to-date account information; use the platform for lawful purposes; publish genuine and accurate vehicle listings; avoid uploading another person\'s information without proper authorization; protect your login credentials; and avoid sharing sensitive personal or financial information publicly.'}</p>

        {/* Section 14 */}
        <h2 style={sectionTitle}>{isAr ? '14. التغييرات على سياسة الخصوصية' : '14. Changes to This Privacy Policy'}</h2>
        <p>{isAr ? 'قد نحدّث سياسة الخصوصية هذه من وقت لآخر. سيتم نشر أحدث إصدار على موقع بنمار درايف مع تاريخ النفاذ المحدّث. نشجع المستخدمين على مراجعة سياسة الخصوصية هذه بشكل دوري.' : 'We may update this Privacy Policy from time to time. The latest version will be published on the BinmarDrive website with its updated effective date. Where required by law, we will provide additional notice or obtain consent before implementing material changes. We encourage users to review this Privacy Policy periodically.'}</p>

        {/* Section 15 */}
        <h2 style={sectionTitle}>{isAr ? '15. القانون الحاكم والأنظمة المعمول بها' : '15. Governing Law and Applicable Regulations'}</h2>
        <p>{isAr ? 'تُفسَّر سياسة الخصوصية هذه وفقاً لقوانين حماية البيانات والخصوصية المعمول بها التي تحكم الكيان القانوني المشغّل لبنمار درايف. قد تشمل المرسوم الاتحادي رقم 45 لسنة 2021 بشأن حماية البيانات الشخصية في الإمارات العربية المتحدة، ونظام حماية البيانات الشخصية السعودي، وغيرها من قوانين الخصوصية وحماية المستهلك المعمول بها.' : 'This Privacy Policy shall be interpreted in accordance with the applicable data protection and privacy laws governing the legal entity operating BinmarDrive. These may include: The UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data, the Saudi Personal Data Protection Law (PDPL), and other applicable privacy, consumer protection, electronic commerce, and data protection laws.'}</p>

        {/* Section 16 */}
        <h2 style={sectionTitle}>{isAr ? '16. اتصل بنا — استفسارات الخصوصية' : '16. Contact Us – Privacy Questions and Requests'}</h2>
        <p>
          {isAr
            ? 'إذا كانت لديك أسئلة أو مخاوف أو شكاوى أو طلبات تتعلق بسياسة الخصوصية هذه أو بمعلوماتك الشخصية، يرجى التواصل معنا:'
            : 'If you have questions, concerns, complaints, or requests relating to this Privacy Policy or your personal information, please contact us:'}
        </p>
        <div style={{ background: 'rgba(var(--gold-rgb, 212,175,55), 0.08)', borderRadius: 12, padding: '1.2rem 1.5rem', margin: '1rem 0' }}>
          <p style={{ margin: 0 }}>
            <strong>BinmarDrive – {isAr ? 'دعم الخصوصية' : 'Privacy Support'}</strong><br />
            {isAr ? 'الموقع الإلكتروني:' : 'Website:'}{' '}
            <a href="https://binmardrive.binmargroup.com/" style={{ color: 'var(--gold-bright)' }}>
              https://binmardrive.binmargroup.com/
            </a><br />
            {isAr ? 'البريد الإلكتروني:' : 'Email:'}{' '}
            <a href="mailto:Info@binmargroup.com" style={{ color: 'var(--gold-bright)' }}>
              Info@binmargroup.com
            </a>
          </p>
        </div>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
          {isAr
            ? 'يرجى تضمين الموضوع "طلب خصوصية بنمار درايف" عند التواصل بشأن المعلومات الشخصية.'
            : 'Please include the subject "BinmarDrive Privacy Request" when contacting us about personal information.'}
        </p>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(128,128,128,0.2)', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
          {isAr
            ? 'بنمار درايف — سوقك لشراء وبيع واستئجار المركبات. نهاية سياسة الخصوصية.'
            : 'BinmarDrive — Your Marketplace for Buying, Selling & Renting Vehicles. Privacy Policy – End of Document.'}
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
