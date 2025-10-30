"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'mr' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.districts': 'Districts',
    'nav.compare': 'Compare',
    'nav.about': 'About',
    'nav.faq': 'FAQ',
    
    // Home page
    'home.badge': 'Maharashtra MGNREGA Dashboard',
    'home.title.our': 'Our Voice,',
    'home.title.rights': 'Our Rights',
    'home.subtitle': 'Track MGNREGA employment and expenditure across all 34 districts of Maharashtra. Transparent data for empowered citizens.',
    'home.lastUpdated': 'Last updated',
    'home.stats.expenditure': 'Total Expenditure',
    'home.stats.households': 'Households Worked',
    'home.stats.works': 'Works Completed',
    'home.stats.personDays': 'Person Days',
    'home.stats.acrossDistricts': 'Across {count} districts',
    'home.stats.statewide': 'Statewide',
    'home.search.placeholder': 'Search districts...',
    'home.districts.title': 'Explore Districts',
    'home.districts.count': '{count} of {total} districts',
    'home.noResults': 'No districts found matching your search.',
    'home.exploreDistricts': 'Explore Districts',
    'home.compareData': 'Compare Data',
    'home.maharashtraGlance': 'Maharashtra at a Glance',
    'home.maharashtraGlanceDesc': 'Real-time data across all {count} districts of Maharashtra',
    'home.totalFamilies': 'Total families benefited',
    'home.inProgress': 'in progress',
    'home.byWomen': 'by women',
    'home.whatWeOffer': 'What We Offer',
    'home.whatWeOfferDesc': 'Our platform provides comprehensive tools and insights to understand MGNREGA implementation across Maharashtra',
    'home.interactiveDashboards': 'Interactive Dashboards',
    'home.interactiveDashboardsDesc': 'Visualize employment and expenditure data with interactive charts and graphs for all 34 districts',
    'home.historicalAnalysis': 'Historical Analysis',
    'home.historicalAnalysisDesc': 'Access historical data and trends to understand program performance over time',
    'home.transparentData': 'Transparent Data',
    'home.transparentDataDesc': 'All data sourced from official MGNREGA reports, ensuring accuracy and transparency',
    'home.quickLinks': 'Quick Links',
    'home.resources': 'Resources',
    'home.officialSite': 'Official MGNREGA Site',
    
    // District detail
    'district.backToDistricts': 'Back to Districts',
    'district.compareButton': 'Compare District',
    'district.code': 'District Code',
    'district.keyMetrics': 'Key Metrics',
    'district.totalExpenditure': 'Total Expenditure',
    'district.householdsWorked': 'Households Worked',
    'district.worksCompleted': 'Works Completed',
    'district.ongoingWorks': 'Ongoing Works',
    'district.currentMonth': 'In current month',
    'district.finishedProjects': 'Finished projects',
    'district.inProgress': 'In progress',
    'district.expenditureTrend': 'Expenditure Trend',
    'district.expenditureTrendDesc': 'Monthly expenditure over the last 12 months (in Thousands)',
    'district.expenditureCr': 'Expenditure (K)',
    'district.worksProgress': 'Works Progress',
    'district.worksProgressDesc': 'Completed vs Ongoing works over last 6 months',
    'district.completed': 'Completed',
    'district.ongoing': 'Ongoing',
    'district.personDaysDist': 'Person Days Distribution',
    'district.personDaysDistDesc': 'Breakdown by category for',
    'district.demographics': 'Person Days Distribution',
    'district.demographicsDesc': 'Breakdown by category',
    'district.employmentTrend': 'Employment Trend',
    'district.employmentTrendDesc': 'Households worked over the last 12 months',
    'district.households': 'Households',
    'district.historicalData': 'Historical Data',
    'district.historicalDataDesc': 'Monthly metrics for the past year',
    
    // Compare page
    'compare.title': 'Compare Districts',
    'compare.subtitle': 'Side-by-side comparison of MGNREGA metrics',
    'compare.backToDistricts': 'Back to Districts',
    'compare.selectedDistricts': 'Selected Districts',
    'compare.code': 'Code',
    'compare.monthsOfData': 'months of data',
    'compare.addDistrict': 'Add District',
    'compare.loadingDistrict': 'Loading district data...',
    'compare.districtsAvailable': 'districts available',
    'compare.loading': 'Loading...',
    'compare.selectDistrict': 'Select a district...',
    'compare.noDistrictsAvailable': 'No districts available',
    'compare.noDistrictsWithData': 'No districts with data available',
    'compare.noDistrictsSelected': 'No districts selected for comparison',
    'compare.selectDistrictsPrompt': 'Select districts from the list above to compare their metrics',
    'compare.expenditureComparison': 'Expenditure Comparison',
    'compare.expenditureComparisonDesc': 'Monthly expenditure over the last 12 months (in Thousands)',
    'compare.householdsComparison': 'Households Employment Comparison',
    'compare.householdsComparisonDesc': 'Number of households worked over the last 12 months',
    'compare.worksComparison': 'Completed Works Comparison',
    'compare.worksComparisonDesc': 'Number of completed works over the last 12 months',
    'compare.latestMetrics': 'Latest Metrics Comparison',
    'compare.latestMetricsDesc': 'Most recent data for selected districts',
    
    // Table headers
    'table.period': 'Period',
    'table.district': 'District',
    'table.expenditure': 'Expenditure',
    'table.households': 'Households',
    'table.completed': 'Completed',
    'table.ongoing': 'Ongoing',
    'table.avgWage': 'Avg Wage/Day',
    
    // Footer
    'footer.about': 'About',
    'footer.faq': 'FAQ',
    'footer.contact': 'Contact',
    'footer.description': 'A civic tech initiative to make MGNREGA data transparent and accessible to all citizens of Maharashtra.',
    'footer.license': 'Data is sourced from official MGNREGA reports and updated monthly.',
  },
  mr: {
    // Navigation
    'nav.home': 'मुख्यपृष्ठ',
    'nav.districts': 'जिल्हे',
    'nav.compare': 'तुलना करा',
    'nav.about': 'आमच्याबद्दल',
    'nav.faq': 'सामान्य प्रश्न',
    
    // Home page
    'home.badge': 'महाराष्ट्र मनरेगा डॅशबोर्ड',
    'home.title.our': 'आमचा आवाज,',
    'home.title.rights': 'आमचे अधिकार',
    'home.subtitle': 'महाराष्ट्राच्या सर्व ३४ जिल्ह्यांमध्ये मनरेगा रोजगार आणि खर्चाचा मागोवा घ्या. सशक्त नागरिकांसाठी पारदर्शक डेटा.',
    'home.lastUpdated': 'शेवटचे अद्यतनित',
    'home.stats.expenditure': 'एकूण खर्च',
    'home.stats.households': 'कार्यरत कुटुंबे',
    'home.stats.works': 'पूर्ण झालेली कामे',
    'home.stats.personDays': 'व्यक्ती दिवस',
    'home.stats.acrossDistricts': '{count} जिल्ह्यांमध्ये',
    'home.stats.statewide': 'राज्यव्यापी',
    'home.search.placeholder': 'जिल्हे शोधा...',
    'home.districts.title': 'जिल्हे एक्सप्लोर करा',
    'home.districts.count': '{count} पैकी {total} जिल्हे',
    'home.noResults': 'तुमच्या शोधाशी जुळणारे जिल्हे आढळले नाहीत.',
    'home.exploreDistricts': 'जिल्हे एक्सप्लोर करा',
    'home.compareData': 'डेटा तुलना करा',
    'home.maharashtraGlance': 'महाराष्ट्र एका दृष्टीक्षेपात',
    'home.maharashtraGlanceDesc': 'महाराष्ट्राच्या सर्व {count} जिल्ह्यांमधील रीयल-टाइम डेटा',
    'home.totalFamilies': 'एकूण लाभार्थी कुटुंबे',
    'home.inProgress': 'प्रगतीपथावर',
    'home.byWomen': 'महिलांनी',
    'home.whatWeOffer': 'आम्ही काय ऑफर करतो',
    'home.whatWeOfferDesc': 'आमचा प्लॅटफॉर्म महाराष्ट्रातील मनरेगा अंमलबजावणी समजून घेण्यासाठी सर्वसमावेशक साधने आणि अंतर्दृष्टी प्रदान करतो',
    'home.interactiveDashboards': 'परस्परसंवादी डॅशबोर्ड',
    'home.interactiveDashboardsDesc': 'सर्व ३४ जिल्ह्यांसाठी परस्परसंवादी चार्ट आणि आलेखांसह रोजगार आणि खर्चाचा डेटा दृश्यमान करा',
    'home.historicalAnalysis': 'ऐतिहासिक विश्लेषण',
    'home.historicalAnalysisDesc': 'कार्यक्रमाची कामगिरी समजून घेण्यासाठी ऐतिहासिक डेटा आणि ट्रेंड मिळवा',
    'home.transparentData': 'पारदर्शक डेटा',
    'home.transparentDataDesc': 'सर्व डेटा अधिकृत मनरेगा अहवालांमधून घेतला आहे, अचूकता आणि पारदर्शकता सुनिश्चित करते',
    'home.quickLinks': 'द्रुत दुवे',
    'home.resources': 'संसाधने',
    'home.officialSite': 'अधिकृत मनरेगा साइट',
    
    // District detail
    'district.backToDistricts': 'जिल्ह्यांवर परत जा',
    'district.compareButton': 'जिल्ह्याची तुलना करा',
    'district.code': 'जिल्हा कोड',
    'district.keyMetrics': 'मुख्य मेट्रिक्स',
    'district.totalExpenditure': 'एकूण खर्च',
    'district.householdsWorked': 'कार्यरत कुटुंबे',
    'district.worksCompleted': 'पूर्ण झालेली कामे',
    'district.ongoingWorks': 'सुरू असलेली कामे',
    'district.currentMonth': 'सध्याच्या महिन्यात',
    'district.finishedProjects': 'पूर्ण झालेले प्रकल्प',
    'district.inProgress': 'प्रगतीपथावर',
    'district.expenditureTrend': 'खर्चाचा ट्रेंड',
    'district.expenditureTrendDesc': 'गेल्या १२ महिन्यांमधील मासिक खर्च (हजारांमध्ये)',
    'district.expenditureCr': 'खर्च (K)',
    'district.worksProgress': 'कामांची प्रगती',
    'district.worksProgressDesc': 'गेल्या ६ महिन्यांमध्ये पूर्ण झालेली विरुद्ध चालू कामे',
    'district.completed': 'पूर्ण',
    'district.ongoing': 'सुरू',
    'district.personDaysDist': 'व्यक्ती दिवस वितरण',
    'district.personDaysDistDesc': 'च्या श्रेणीनुसार विभाजन',
    'district.demographics': 'व्यक्ती दिवस वितरण',
    'district.demographicsDesc': 'श्रेणीनुसार विभाजन',
    'district.employmentTrend': 'रोजगार ट्रेंड',
    'district.employmentTrendDesc': 'गेल्या १२ महिन्यांमध्ये कार्यरत कुटुंबे',
    'district.households': 'कुटुंबे',
    'district.historicalData': 'ऐतिहासिक डेटा',
    'district.historicalDataDesc': 'गेल्या वर्षाचे मासिक मेट्रिक्स',
    
    // Compare page
    'compare.title': 'जिल्ह्यांची तुलना करा',
    'compare.subtitle': 'मनरेगा मेट्रिक्सची समांतर तुलना',
    'compare.backToDistricts': 'जिल्ह्यांवर परत जा',
    'compare.selectedDistricts': 'निवडलेले जिल्हे',
    'compare.code': 'कोड',
    'compare.monthsOfData': 'महिन्यांचा डेटा',
    'compare.addDistrict': 'जिल्हा जोडा',
    'compare.loadingDistrict': 'जिल्हा डेटा लोड होत आहे...',
    'compare.districtsAvailable': 'जिल्हे उपलब्ध',
    'compare.loading': 'लोड होत आहे...',
    'compare.selectDistrict': 'जिल्हा निवडा...',
    'compare.noDistrictsAvailable': 'कोणतेही जिल्हे उपलब्ध नाहीत',
    'compare.noDistrictsWithData': 'डेटा असलेले कोणतेही जिल्हे उपलब्ध नाहीत',
    'compare.noDistrictsSelected': 'तुलनेसाठी कोणतेही जिल्हे निवडलेले नाहीत',
    'compare.selectDistrictsPrompt': 'त्यांच्या मेट्रिक्सची तुलना करण्यासाठी वरील सूचीमधून जिल्हे निवडा',
    'compare.expenditureComparison': 'खर्च तुलना',
    'compare.expenditureComparisonDesc': 'गेल्या १२ महिन्यांमधील मासिक खर्च (हजारांमध्ये)',
    'compare.householdsComparison': 'कुटुंबांच्या रोजगाराची तुलना',
    'compare.householdsComparisonDesc': 'गेल्या १२ महिन्यांमध्ये कार्यरत कुटुंबांची संख्या',
    'compare.worksComparison': 'पूर्ण झालेल्या कामांची तुलना',
    'compare.worksComparisonDesc': 'गेल्या १२ महिन्यांमध्ये पूर्ण झालेल्या कामांची संख्या',
    'compare.latestMetrics': 'नवीनतम मेट्रिक्स तुलना',
    'compare.latestMetricsDesc': 'निवडलेल्या जिल्ह्यांसाठी सर्वात अलीकडील डेटा',
    
    // Table headers
    'table.period': 'कालावधी',
    'table.district': 'जिल्हा',
    'table.expenditure': 'खर्च',
    'table.households': 'कुटुंबे',
    'table.completed': 'पूर्ण',
    'table.ongoing': 'सुरू',
    'table.avgWage': 'सरासरी वेतन/दिवस',
    
    // Footer
    'footer.about': 'आमच्याबद्दल',
    'footer.faq': 'सामान्य प्रश्न',
    'footer.contact': 'संपर्क',
    'footer.description': 'महाराष्ट्राच्या सर्व नागरिकांसाठी मनरेगा डेटा पारदर्शक आणि सुलभ करण्यासाठी एक नागरिक तंत्रज्ञान उपक्रम.',
    'footer.license': 'डेटा अधिकृत मनरेगा अहवालांमधून घेतला आहे आणि दरमहा अद्यतनित केला जातो.',
  },
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.districts': 'जिले',
    'nav.compare': 'तुलना करें',
    'nav.about': 'हमारे बारे में',
    'nav.faq': 'सामान्य प्रश्न',
    
    // Home page
    'home.badge': 'महाराष्ट्र मनरेगा डैशबोर्ड',
    'home.title.our': 'हमारी आवाज़,',
    'home.title.rights': 'हमारे अधिकार',
    'home.subtitle': 'महाराष्ट्र के सभी 34 जिलों में मनरेगा रोजगार और व्यय को ट्रैक करें। सशक्त नागरिकों के लिए पारदर्शी डेटा।',
    'home.lastUpdated': 'अंतिम अपडेट',
    'home.stats.expenditure': 'कुल व्यय',
    'home.stats.households': 'काम करने वाले परिवार',
    'home.stats.works': 'पूर्ण किए गए कार्य',
    'home.stats.personDays': 'व्यक्ति दिवस',
    'home.stats.acrossDistricts': '{count} जिलों में',
    'home.stats.statewide': 'राज्यव्यापी',
    'home.search.placeholder': 'जिले खोजें...',
    'home.districts.title': 'जिलों का अन्वेषण करें',
    'home.districts.count': '{total} में से {count} जिले',
    'home.noResults': 'आपकी खोज से मेल खाने वाले जिले नहीं मिले।',
    'home.exploreDistricts': 'जिलों का अन्वेषण करें',
    'home.compareData': 'डेटा की तुलना करें',
    'home.maharashtraGlance': 'महाराष्ट्र एक नज़र में',
    'home.maharashtraGlanceDesc': 'महाराष्ट्र के सभी {count} जिलों में रीयल-टाइम डेटा',
    'home.totalFamilies': 'कुल लाभार्थी परिवार',
    'home.inProgress': 'प्रगति में',
    'home.byWomen': 'महिलाओं द्वारा',
    'home.whatWeOffer': 'हम क्या प्रदान करते हैं',
    'home.whatWeOfferDesc': 'हमारा प्लेटफ़ॉर्म महाराष्ट्र में मनरेगा कार्यान्वयन को समझने के लिए व्यापक उपकरण और अंतर्दृष्टि प्रदान करता है',
    'home.interactiveDashboards': 'इंटरैक्टिव डैशबोर्ड',
    'home.interactiveDashboardsDesc': 'सभी 34 जिलों के लिए इंटरैक्टिव चार्ट और ग्राफ़ के साथ रोजगार और व्यय डेटा देखें',
    'home.historicalAnalysis': 'ऐतिहासिक विश्लेषण',
    'home.historicalAnalysisDesc': 'कार्यक्रम के प्रदर्शन को समझने के लिए ऐतिहासिक डेटा और ट्रेंड तक पहुंचें',
    'home.transparentData': 'पारदर्शी डेटा',
    'home.transparentDataDesc': 'सभी डेटा आधिकारिक मनरेगा रिपोर्टों से लिया गया है, जो सटीकता और पारदर्शिता सुनिश्चित करता है',
    'home.quickLinks': 'त्वरित लिंक',
    'home.resources': 'संसाधन',
    'home.officialSite': 'आधिकारिक मनरेगा साइट',
    
    // District detail
    'district.backToDistricts': 'जिलों पर वापस जाएं',
    'district.compareButton': 'जिले की तुलना करें',
    'district.code': 'जिला कोड',
    'district.keyMetrics': 'मुख्य मेट्रिक्स',
    'district.totalExpenditure': 'कुल व्यय',
    'district.householdsWorked': 'काम करने वाले परिवार',
    'district.worksCompleted': 'पूर्ण किए गए कार्य',
    'district.ongoingWorks': 'चालू कार्य',
    'district.currentMonth': 'वर्तमान महीने में',
    'district.finishedProjects': 'पूर्ण परियोजनाएं',
    'district.inProgress': 'प्रगति में',
    'district.expenditureTrend': 'व्यय ट्रेंड',
    'district.expenditureTrendDesc': 'पिछले 12 महीनों में मासिक व्यय (हजारों में)',
    'district.expenditureCr': 'व्यय (K)',
    'district.worksProgress': 'कार्यों की प्रगति',
    'district.worksProgressDesc': 'पिछले 6 महीनों में पूर्ण बनाम चालू कार्य',
    'district.completed': 'पूर्ण',
    'district.ongoing': 'चालू',
    'district.personDaysDist': 'व्यक्ति दिवस वितरण',
    'district.personDaysDistDesc': 'के लिए श्रेणी के अनुसार विभाजन',
    'district.demographics': 'व्यक्ति दिवस वितरण',
    'district.demographicsDesc': 'श्रेणी के अनुसार विभाजन',
    'district.employmentTrend': 'रोजगार ट्रेंड',
    'district.employmentTrendDesc': 'पिछले 12 महीनों में काम करने वाले परिवार',
    'district.households': 'परिवार',
    'district.historicalData': 'ऐतिहासिक डेटा',
    'district.historicalDataDesc': 'पिछले वर्ष के मासिक मेट्रिक्स',
    
    // Compare page
    'compare.title': 'जिलों की तुलना करें',
    'compare.subtitle': 'मनरेगा मेट्रिक्स की समांतर तुलना',
    'compare.backToDistricts': 'जिलों पर वापस जाएं',
    'compare.selectedDistricts': 'चयनित जिले',
    'compare.code': 'कोड',
    'compare.monthsOfData': 'महीनों का डेटा',
    'compare.addDistrict': 'जिला जोड़ें',
    'compare.loadingDistrict': 'जिला डेटा लोड हो रहा है...',
    'compare.districtsAvailable': 'जिले उपलब्ध',
    'compare.loading': 'लोड हो रहा है...',
    'compare.selectDistrict': 'एक जिला चुनें...',
    'compare.noDistrictsAvailable': 'कोई जिले उपलब्ध नहीं',
    'compare.noDistrictsWithData': 'डेटा वाले कोई जिले उपलब्ध नहीं',
    'compare.noDistrictsSelected': 'तुलना के लिए कोई जिला नहीं चुना गया',
    'compare.selectDistrictsPrompt': 'उनके मेट्रिक्स की तुलना करने के लिए ऊपर की सूची से जिले चुनें',
    'compare.expenditureComparison': 'व्यय तुलना',
    'compare.expenditureComparisonDesc': 'पिछले 12 महीनों में मासिक व्यय (हजारों में)',
    'compare.householdsComparison': 'परिवारों के रोजगार की तुलना',
    'compare.householdsComparisonDesc': 'पिछले 12 महीनों में काम करने वाले परिवारों की संख्या',
    'compare.worksComparison': 'पूर्ण किए गए कार्यों की तुलना',
    'compare.worksComparisonDesc': 'पिछले 12 महीनों में पूर्ण किए गए कार्यों की संख्या',
    'compare.latestMetrics': 'नवीनतम मेट्रिक्स तुलना',
    'compare.latestMetricsDesc': 'चयनित जिलों के लिए सबसे हालिया डेटा',
    
    // Table headers
    'table.period': 'अवधि',
    'table.district': 'जिला',
    'table.expenditure': 'व्यय',
    'table.households': 'परिवार',
    'table.completed': 'पूर्ण',
    'table.ongoing': 'चालू',
    'table.avgWage': 'औसत वेतन/दिन',
    
    // Footer
    'footer.about': 'हमारे बारे में',
    'footer.faq': 'सामान्य प्रश्न',
    'footer.contact': 'संपर्क',
    'footer.description': 'महाराष्ट्र के सभी नागरिकों के लिए मनरेगा डेटा को पारदर्शी और सुलभ बनाने की एक नागरिक तकनीक पहल।',
    'footer.license': 'डेटा आधिकारिक मनरेगा रिपोर्टों से लिया गया है और मासिक रूप से अपडेट किया जाता है।',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('mr'); // Default to Marathi

  useEffect(() => {
    // Load language from localStorage
    const saved = localStorage.getItem('language');
    if (saved && (saved === 'en' || saved === 'mr' || saved === 'hi')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
