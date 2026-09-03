// Major villages, towns and localities per Punjab district
// Source: Census data and common knowledge of Punjab geography
// This gives a direct dropdown without any API call needed

const PUNJAB_VILLAGES = {
  "Bathinda": [
    "Bhucho Mandi","Bhucho Khurd","Rampura Phul","Talwandi Sabo","Maur","Nathana","Phul","Goniana","Sangat","Mehraj","Kotha Guru","Gehri Buttar","Bhagta Bhai Ka","Nihal Singhwala","Joganand"
  ],
  "Moga": [
    "Duneke","Sharamkot","Baghapurana","Nihal Singh Wala","Fatehgarh Panjtoor","Jalalabad","Dharamkot","Mehna","Bagha Purana","Ajitwal","Ghall Khurd","Kotkapura","Mundeke","Daulatpura","Mehna"
  ],
  "Ludhiana": [
    "Khanna","Samrala","Raikot","Jagraon","Machhiwara","Doraha","Mullanpur","Sudhar","Barnala Road","Hambran","Sahnewal","Pakhowal","Malerkotla"
  ],
  "Amritsar": [
    "Ajnala","Baba Bakala","Rayya","Tarsikka","Majitha","Gharinda","Jandiala Guru","Lopoke","Attari","Chheharta","Fatehgarh Churian","Verka"
  ],
  "Jalandhar": [
    "Nakodar","Shahkot","Phillaur","Kartarpur","Rurka Kalan","Lohian Khas","Mehatpur","Bhogpur","Adampur","Nurmahal","Goraya"
  ],
  "Patiala": [
    "Rajpura","Nabha","Samana","Fatehgarh Sahib","Sirhind","Bassi Pathana","Pehowa","Ghanaur","Patran","Shutrana"
  ],
  "Sangrur": [
    "Moonak","Sunam","Dhuri","Lehra","Malerkotla","Bhawanigarh","Dirba","Barnala","Mehal Kalan","Longowal"
  ],
  "Firozpur": [
    "Zira","Fazilka","Abohar","Jalalabad","Guru Har Sahai","Mamdot","Makhu","Ferozepur Cantonment"
  ],
  "Hoshiarpur": [
    "Garhshankar","Mukerian","Dasuya","Tanda","Hajipur","Balachaur","Urmar Tanda"
  ],
  "Gurdaspur": [
    "Batala","Pathankot","Dhariwal","Kalanaur","Dera Baba Nanak","Qadian","Dinanagar","Sri Hargobindpur"
  ],
  "Kapurthala": [
    "Phagwara","Sultanpur Lodhi","Bhulath","Nadala","Dhilwan","Kapurthala City"
  ],
  "Faridkot": [
    "Faridkot City","Kotkapura","Jaitu","Sadiq","Bhagsar"
  ],
  "Muktsar (Sri Muktsar Sahib)": [
    "Malout","Gidderbaha","Lambi","Mudki","Bariwala","Kot Bhai"
  ],
  "Fazilka": [
    "Abohar","Jalalabad","Fazilka City","Arniwala Sheikh Subhan"
  ],
  "Mansa": [
    "Mansa City","Budhlada","Sardulgarh","Bhikhi","Boha"
  ],
  "Barnala": [
    "Barnala City","Mehal Kalan","Bhadaur","Sehna"
  ],
  "Tarn Taran": [
    "Tarn Taran City","Patti","Khem Karan","Sarai Amanat Khan","Bhikhiwind"
  ],
  "Nawanshahr (Shaheed Bhagat Singh Nagar)": [
    "Nawanshahr City","Balachaur","Rahon","Aur","Banga"
  ],
  "Rupnagar (Ropar)": [
    "Rupnagar City","Anandpur Sahib","Morinda","Chamkaur Sahib","Kiratpur Sahib"
  ],
  "Fatehgarh Sahib": [
    "Fatehgarh Sahib City","Sirhind","Amloh","Bassi Pathana","Mandi Gobindgarh"
  ],
  "Mohali (SAS Nagar)": [
    "Mohali City","Kharar","Derabassi","Zirakpur","Dera Bassi","Banur","Lalru"
  ],
  "Pathankot": [
    "Pathankot City","Dhar Kalan","Dunera","Banikhet","Nagrota Bagwan"
  ],
  "Malerkotla": [
    "Malerkotla City","Ahmedgarh","Raikot","Amargarh"
  ],
};

// For other states — fetch from Nominatim (handled by VillageDropdown component)
export function getVillages(stateName, districtName) {
  if (stateName === 'Punjab' && PUNJAB_VILLAGES[districtName]) {
    return PUNJAB_VILLAGES[districtName].sort();
  }
  return null; // null means use Nominatim live search
}

export default PUNJAB_VILLAGES;
