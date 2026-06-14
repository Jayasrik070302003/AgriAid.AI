// landData.js
// Patta/Chitta style cascading land records for Tamil Nadu and Puducherry.
// Village → coordinates used for weather API (lat/lon only, no GPS, no IP).

// ── Village coordinates ──────────────────────────────────────────────────────
export const VILLAGE_COORDS = {
    // Tamil Nadu — Ariyalur
    'Ariyalur Town':       { lat: 11.140, lon: 79.078 },
    'Andimadam':           { lat: 11.256, lon: 79.138 },
    'Sendurai':            { lat: 11.067, lon: 79.023 },
    'Jayankondam':         { lat: 11.133, lon: 79.151 },
    // Tamil Nadu — Chengalpattu
    'Chengalpattu':        { lat: 12.692, lon: 79.981 },
    'Madurantakam':        { lat: 12.499, lon: 79.900 },
    'Tambaram':            { lat: 12.921, lon: 80.113 },
    'Vandalur':            { lat: 12.882, lon: 80.082 },
    // Tamil Nadu — Chennai
    'Chennai':             { lat: 13.082, lon: 80.270 },
    'Ambattur':            { lat: 13.098, lon: 80.155 },
    'Avadi':               { lat: 13.113, lon: 80.100 },
    // Tamil Nadu — Coimbatore
    'Coimbatore':          { lat: 11.016, lon: 76.955 },
    'Pollachi':            { lat: 10.659, lon: 77.007 },
    'Mettupalayam':        { lat: 11.297, lon: 76.947 },
    'Valparai':            { lat: 10.327, lon: 76.957 },
    // Tamil Nadu — Cuddalore
    'Cuddalore':           { lat: 11.748, lon: 79.771 },
    'Panruti':             { lat: 11.771, lon: 79.547 },
    'Chidambaram':         { lat: 11.399, lon: 79.693 },
    'Naduveerapattu':      { lat: 11.720, lon: 79.690 },
    'Vriddhachalam':       { lat: 11.519, lon: 79.337 },
    'Virudhachalam':       { lat: 11.519, lon: 79.337 },
    'Sirkazhi':            { lat: 11.232, lon: 79.742 },
    'Kattumannarkoil':     { lat: 11.476, lon: 79.562 },
    'Nellikkuppam':        { lat: 11.765, lon: 79.707 },
    'Kurinjipadi':         { lat: 11.727, lon: 79.628 },
    // Tamil Nadu — Dharmapuri
    'Dharmapuri':          { lat: 12.128, lon: 78.158 },
    'Palacode':            { lat: 12.237, lon: 77.967 },
    'Pennagaram':          { lat: 11.967, lon: 77.933 },
    // Tamil Nadu — Dindigul
    'Dindigul':            { lat: 10.363, lon: 77.973 },
    'Palani':              { lat: 10.450, lon: 77.519 },
    'Kodaikanal':          { lat: 10.237, lon: 77.490 },
    'Oddanchatram':        { lat: 10.506, lon: 77.736 },
    // Tamil Nadu — Erode
    'Erode':               { lat: 11.341, lon: 77.717 },
    'Bhavani':             { lat: 11.447, lon: 77.683 },
    'Gobichettipalayam':   { lat: 11.453, lon: 77.358 },
    'Sathyamangalam':      { lat: 11.503, lon: 77.237 },
    // Tamil Nadu — Kallakurichi
    'Kallakurichi':        { lat: 11.738, lon: 78.961 },
    'Sankarapuram':        { lat: 11.832, lon: 78.832 },
    'Ulundurpettai':       { lat: 11.680, lon: 79.101 },
    // Tamil Nadu — Kancheepuram
    'Kancheepuram':        { lat: 12.831, lon: 79.705 },
    'Sriperumbudur':       { lat: 12.967, lon: 79.943 },
    'Uthiramerur':         { lat: 12.618, lon: 79.756 },
    // Tamil Nadu — Kanyakumari
    'Nagercoil':           { lat: 8.178,  lon: 77.432 },
    'Thuckalay':           { lat: 8.267,  lon: 77.317 },
    'Colachel':            { lat: 8.175,  lon: 77.261 },
    // Tamil Nadu — Karur
    'Karur':               { lat: 10.957, lon: 78.080 },
    'Kulithalai':          { lat: 10.932, lon: 78.421 },
    'Aravakurichi':        { lat: 10.772, lon: 78.151 },
    // Tamil Nadu — Krishnagiri
    'Krishnagiri':         { lat: 12.519, lon: 78.213 },
    'Hosur':               { lat: 12.741, lon: 77.826 },
    'Denkanikottai':       { lat: 12.562, lon: 77.784 },
    // Tamil Nadu — Madurai
    'Madurai':             { lat: 9.925,  lon: 78.119 },
    'Melur':               { lat: 10.041, lon: 78.337 },
    'Usilampatti':         { lat: 9.967,  lon: 77.800 },
    'Thirumangalam':       { lat: 9.826,  lon: 77.983 },
    // Tamil Nadu — Mayiladuthurai
    'Mayiladuthurai':      { lat: 11.103, lon: 79.652 },
    'Sirkazhi':            { lat: 11.232, lon: 79.742 },
    'Kuthalam':            { lat: 11.115, lon: 79.770 },
    // Tamil Nadu — Nagapattinam
    'Nagapattinam':        { lat: 10.765, lon: 79.843 },
    'Vedaranyam':          { lat: 10.378, lon: 79.852 },
    'Kilvelur':            { lat: 10.758, lon: 79.819 },
    'Thirukkuvalai':       { lat: 10.564, lon: 79.847 },
    // Tamil Nadu — Namakkal
    'Namakkal':            { lat: 11.219, lon: 78.167 },
    'Rasipuram':           { lat: 11.458, lon: 78.179 },
    'Tiruchengode':        { lat: 11.381, lon: 77.895 },
    // Tamil Nadu — Nilgiris
    'Ooty':                { lat: 11.414, lon: 76.693 },
    'Coonoor':             { lat: 11.353, lon: 76.795 },
    'Gudalur':             { lat: 11.503, lon: 76.497 },
    // Tamil Nadu — Perambalur
    'Perambalur':          { lat: 11.233, lon: 78.880 },
    'Veppanthattai':       { lat: 11.283, lon: 79.003 },
    'Kunnam':              { lat: 11.388, lon: 79.027 },
    // Tamil Nadu — Pudukkottai
    'Pudukkottai':         { lat: 10.381, lon: 78.820 },
    'Aranthangi':          { lat: 10.168, lon: 78.988 },
    'Karaikudi':           { lat: 10.072, lon: 78.774 },
    // Tamil Nadu — Ramanathapuram
    'Ramanathapuram':      { lat: 9.371,  lon: 78.830 },
    'Rameswaram':          { lat: 9.288,  lon: 79.313 },
    'Paramakudi':          { lat: 9.547,  lon: 78.587 },
    // Tamil Nadu — Ranipet
    'Ranipet':             { lat: 12.922, lon: 79.333 },
    'Arcot':               { lat: 12.904, lon: 79.319 },
    'Walajah':             { lat: 12.922, lon: 79.368 },
    // Tamil Nadu — Salem
    'Salem':               { lat: 11.664, lon: 78.146 },
    'Omalur':              { lat: 11.739, lon: 78.042 },
    'Mettur':              { lat: 11.793, lon: 77.798 },
    'Attur':               { lat: 11.594, lon: 78.597 },
    // Tamil Nadu — Sivaganga
    'Sivaganga':           { lat: 9.847,  lon: 78.481 },
    'Devakottai':          { lat: 9.959,  lon: 78.819 },
    'Tiruppattur (Sivaganga)': { lat: 9.967, lon: 78.617 },
    // Tamil Nadu — Tenkasi
    'Tenkasi':             { lat: 8.959,  lon: 77.315 },
    'Sankarankovil':       { lat: 9.168,  lon: 77.551 },
    'Kadayanallur':        { lat: 9.065,  lon: 77.350 },
    // Tamil Nadu — Thanjavur
    'Thanjavur':           { lat: 10.786, lon: 79.137 },
    'Kumbakonam':          { lat: 10.963, lon: 79.382 },
    'Papanasam':           { lat: 10.927, lon: 79.271 },
    'Thiruvaiyaru':        { lat: 10.873, lon: 79.101 },
    'Pattukottai':         { lat: 10.428, lon: 79.319 },
    'Orathanadu':          { lat: 10.504, lon: 79.032 },
    // Tamil Nadu — Theni
    'Theni':               { lat: 10.010, lon: 77.476 },
    'Bodinayakanur':       { lat: 10.012, lon: 77.349 },
    'Periyakulam':         { lat: 10.115, lon: 77.546 },
    // Tamil Nadu — Thoothukudi
    'Thoothukudi':         { lat: 8.791,  lon: 78.133 },
    'Tiruchendur':         { lat: 8.496,  lon: 78.119 },
    'Kovilpatti':          { lat: 9.172,  lon: 77.869 },
    // Tamil Nadu — Tiruchirappalli
    'Tiruchirappalli':     { lat: 10.790, lon: 78.700 },
    'Musiri':              { lat: 10.947, lon: 78.441 },
    'Srirangam':           { lat: 10.861, lon: 78.693 },
    'Lalgudi':             { lat: 10.868, lon: 78.823 },
    // Tamil Nadu — Tirunelveli
    'Tirunelveli':         { lat: 8.711,  lon: 77.757 },
    'Palayamkottai':       { lat: 8.718,  lon: 77.737 },
    'Ambasamudram':        { lat: 8.708,  lon: 77.451 },
    'Nanguneri':           { lat: 8.489,  lon: 77.663 },
    // Tamil Nadu — Tirupathur
    'Tirupattur':          { lat: 12.493, lon: 78.573 },
    'Vaniyambadi':         { lat: 12.685, lon: 78.727 },
    'Ambur':               { lat: 12.793, lon: 78.718 },
    // Tamil Nadu — Tiruppur
    'Tiruppur':            { lat: 11.107, lon: 77.340 },
    'Dharapuram':          { lat: 10.732, lon: 77.512 },
    'Udumalpet':           { lat: 10.585, lon: 77.249 },
    // Tamil Nadu — Tiruvallur
    'Tiruvallur':          { lat: 13.143, lon: 79.907 },
    'Gummidipoondi':       { lat: 13.408, lon: 80.112 },
    'Ponneri':             { lat: 13.341, lon: 80.199 },
    // Tamil Nadu — Tiruvannamalai
    'Tiruvannamalai':      { lat: 12.226, lon: 79.074 },
    'Polur':               { lat: 12.512, lon: 79.124 },
    'Arni':                { lat: 12.670, lon: 79.287 },
    'Chengam':             { lat: 12.311, lon: 78.766 },
    // Tamil Nadu — Tiruvarur
    'Tiruvarur':           { lat: 10.773, lon: 79.637 },
    'Mannargudi':          { lat: 10.662, lon: 79.444 },
    'Nannilam':            { lat: 10.838, lon: 79.674 },
    'Papanasam (Tiruvarur)': { lat: 10.744, lon: 79.591 },
    // Tamil Nadu — Vellore
    'Vellore':             { lat: 12.916, lon: 79.132 },
    'Katpadi':             { lat: 12.970, lon: 79.148 },
    'Gudiyatham':          { lat: 12.940, lon: 78.870 },
    'Tirupathur (Vellore)': { lat: 12.493, lon: 78.573 },
    // Tamil Nadu — Viluppuram
    'Viluppuram':          { lat: 11.940, lon: 79.486 },
    'Tindivanam':          { lat: 12.231, lon: 79.652 },
    'Gingee':              { lat: 12.252, lon: 79.417 },
    'Rishivandiyam':       { lat: 11.773, lon: 79.121 },
    'Kallakurichi (Vlp)':  { lat: 11.738, lon: 78.961 },
    'Avarapakkam':         { lat: 12.223, lon: 79.645 },
    // Tamil Nadu — Virudhunagar
    'Virudhunagar':        { lat: 9.581,  lon: 77.952 },
    'Aruppukkottai':       { lat: 9.510,  lon: 78.099 },
    'Rajapalayam':         { lat: 9.452,  lon: 77.556 },
    'Sivakasi':            { lat: 9.451,  lon: 77.796 },
    // Puducherry
    'Puducherry':          { lat: 11.934, lon: 79.830 },
    'Madhagadipet':        { lat: 11.930, lon: 79.730 },
    'Ariyankuppam':        { lat: 11.878, lon: 79.817 },
    'Ozhukarai':           { lat: 11.958, lon: 79.862 },
    'Mannadipet':          { lat: 11.982, lon: 79.783 },
    'Villianur':           { lat: 11.970, lon: 79.785 },
    'Bahour':              { lat: 11.817, lon: 79.782 },
    'Nettapakkam':         { lat: 11.882, lon: 79.748 },
    'Karaikal':            { lat: 10.924, lon: 79.836 },
    'Neravy':              { lat: 10.934, lon: 79.841 },
    'Tirunallar':          { lat: 10.878, lon: 79.821 },
    'Mahe':                { lat: 11.700, lon: 75.534 },
    'Yanam':               { lat: 16.732, lon: 82.213 },
};

// ── Full Patta/Chitta hierarchy ───────────────────────────────────────────────
export const LAND_HIERARCHY = {
    'Tamil Nadu': {
        'Ariyalur': {
            'Ariyalur Taluk':  ['Ariyalur Town', 'Andimadam', 'Sendurai'],
            'Jayankondam Taluk': ['Jayankondam'],
        },
        'Chengalpattu': {
            'Chengalpattu Taluk': ['Chengalpattu', 'Madurantakam'],
            'Tambaram Taluk':     ['Tambaram', 'Vandalur'],
        },
        'Chennai': {
            'Chennai Taluk': ['Chennai', 'Ambattur', 'Avadi'],
        },
        'Coimbatore': {
            'Coimbatore North Taluk': ['Coimbatore', 'Mettupalayam'],
            'Coimbatore South Taluk': ['Pollachi'],
            'Valparai Taluk':         ['Valparai'],
        },
        'Cuddalore': {
            'Cuddalore Taluk':       ['Cuddalore', 'Nellikkuppam'],
            'Panruti Taluk':         ['Panruti', 'Naduveerapattu', 'Kurinjipadi'],
            'Chidambaram Taluk':     ['Chidambaram', 'Kattumannarkoil', 'Sirkazhi'],
            'Vriddhachalam Taluk':   ['Vriddhachalam'],
        },
        'Dharmapuri': {
            'Dharmapuri Taluk': ['Dharmapuri'],
            'Palacode Taluk':   ['Palacode'],
            'Pennagaram Taluk': ['Pennagaram'],
        },
        'Dindigul': {
            'Dindigul Taluk':    ['Dindigul', 'Oddanchatram'],
            'Palani Taluk':      ['Palani'],
            'Kodaikanal Taluk':  ['Kodaikanal'],
        },
        'Erode': {
            'Erode Taluk':            ['Erode'],
            'Bhavani Taluk':          ['Bhavani'],
            'Gobichettipalayam Taluk':['Gobichettipalayam'],
            'Sathyamangalam Taluk':   ['Sathyamangalam'],
        },
        'Kallakurichi': {
            'Kallakurichi Taluk':  ['Kallakurichi'],
            'Sankarapuram Taluk':  ['Sankarapuram'],
            'Ulundurpettai Taluk': ['Ulundurpettai'],
        },
        'Kancheepuram': {
            'Kancheepuram Taluk':   ['Kancheepuram'],
            'Sriperumbudur Taluk':  ['Sriperumbudur'],
            'Uthiramerur Taluk':    ['Uthiramerur'],
        },
        'Kanyakumari': {
            'Nagercoil Taluk':  ['Nagercoil'],
            'Thuckalay Taluk':  ['Thuckalay'],
            'Colachel Taluk':   ['Colachel'],
        },
        'Karur': {
            'Karur Taluk':       ['Karur'],
            'Kulithalai Taluk':  ['Kulithalai'],
            'Aravakurichi Taluk':['Aravakurichi'],
        },
        'Krishnagiri': {
            'Krishnagiri Taluk':   ['Krishnagiri'],
            'Hosur Taluk':         ['Hosur'],
            'Denkanikottai Taluk': ['Denkanikottai'],
        },
        'Madurai': {
            'Madurai North Taluk': ['Madurai'],
            'Melur Taluk':         ['Melur'],
            'Usilampatti Taluk':   ['Usilampatti'],
            'Thirumangalam Taluk': ['Thirumangalam'],
        },
        'Mayiladuthurai': {
            'Mayiladuthurai Taluk': ['Mayiladuthurai', 'Kuthalam'],
            'Sirkazhi Taluk':       ['Sirkazhi'],
        },
        'Nagapattinam': {
            'Nagapattinam Taluk': ['Nagapattinam', 'Kilvelur'],
            'Vedaranyam Taluk':   ['Vedaranyam', 'Thirukkuvalai'],
        },
        'Namakkal': {
            'Namakkal Taluk':      ['Namakkal'],
            'Rasipuram Taluk':     ['Rasipuram'],
            'Tiruchengode Taluk':  ['Tiruchengode'],
        },
        'Nilgiris': {
            'Ooty Taluk':    ['Ooty', 'Coonoor'],
            'Gudalur Taluk': ['Gudalur'],
        },
        'Perambalur': {
            'Perambalur Taluk':    ['Perambalur'],
            'Veppanthattai Taluk': ['Veppanthattai'],
            'Kunnam Taluk':        ['Kunnam'],
        },
        'Pudukkottai': {
            'Pudukkottai Taluk': ['Pudukkottai'],
            'Aranthangi Taluk':  ['Aranthangi'],
            'Karaikudi Taluk':   ['Karaikudi'],
        },
        'Ramanathapuram': {
            'Ramanathapuram Taluk': ['Ramanathapuram', 'Paramakudi'],
            'Rameswaram Taluk':     ['Rameswaram'],
        },
        'Ranipet': {
            'Ranipet Taluk': ['Ranipet', 'Arcot', 'Walajah'],
        },
        'Salem': {
            'Salem Taluk':  ['Salem'],
            'Omalur Taluk': ['Omalur'],
            'Mettur Taluk': ['Mettur'],
            'Attur Taluk':  ['Attur'],
        },
        'Sivaganga': {
            'Sivaganga Taluk':  ['Sivaganga'],
            'Devakottai Taluk': ['Devakottai'],
        },
        'Tenkasi': {
            'Tenkasi Taluk':        ['Tenkasi'],
            'Sankarankovil Taluk':  ['Sankarankovil'],
            'Kadayanallur Taluk':   ['Kadayanallur'],
        },
        'Thanjavur': {
            'Thanjavur Taluk':  ['Thanjavur', 'Thiruvaiyaru'],
            'Kumbakonam Taluk': ['Kumbakonam', 'Papanasam'],
            'Pattukottai Taluk':['Pattukottai', 'Orathanadu'],
        },
        'Theni': {
            'Theni Taluk':          ['Theni'],
            'Bodinayakanur Taluk':  ['Bodinayakanur'],
            'Periyakulam Taluk':    ['Periyakulam'],
        },
        'Thoothukudi': {
            'Thoothukudi Taluk':  ['Thoothukudi'],
            'Tiruchendur Taluk':  ['Tiruchendur'],
            'Kovilpatti Taluk':   ['Kovilpatti'],
        },
        'Tiruchirappalli': {
            'Tiruchirappalli Taluk': ['Tiruchirappalli', 'Srirangam', 'Lalgudi'],
            'Musiri Taluk':          ['Musiri'],
        },
        'Tirunelveli': {
            'Tirunelveli Taluk':    ['Tirunelveli', 'Palayamkottai'],
            'Ambasamudram Taluk':   ['Ambasamudram'],
            'Nanguneri Taluk':      ['Nanguneri'],
        },
        'Tirupathur': {
            'Tirupattur Taluk':   ['Tirupattur'],
            'Vaniyambadi Taluk':  ['Vaniyambadi'],
            'Ambur Taluk':        ['Ambur'],
        },
        'Tiruppur': {
            'Tiruppur Taluk':    ['Tiruppur'],
            'Dharapuram Taluk':  ['Dharapuram'],
            'Udumalpet Taluk':   ['Udumalpet'],
        },
        'Tiruvallur': {
            'Tiruvallur Taluk':        ['Tiruvallur'],
            'Gummidipoondi Taluk':     ['Gummidipoondi'],
            'Ponneri Taluk':           ['Ponneri'],
        },
        'Tiruvannamalai': {
            'Tiruvannamalai Taluk': ['Tiruvannamalai', 'Chengam'],
            'Polur Taluk':          ['Polur'],
            'Arni Taluk':           ['Arni'],
        },
        'Tiruvarur': {
            'Tiruvarur Taluk':   ['Tiruvarur', 'Nannilam'],
            'Mannargudi Taluk':  ['Mannargudi'],
        },
        'Vellore': {
            'Vellore Taluk':   ['Vellore', 'Katpadi'],
            'Gudiyatham Taluk':['Gudiyatham'],
        },
        'Viluppuram': {
            'Viluppuram Taluk':   ['Viluppuram'],
            'Tindivanam Taluk':   ['Tindivanam', 'Avarapakkam'],
            'Gingee Taluk':       ['Gingee'],
            'Rishivandiyam Taluk':['Rishivandiyam'],
        },
        'Virudhunagar': {
            'Virudhunagar Taluk':  ['Virudhunagar'],
            'Aruppukkottai Taluk': ['Aruppukkottai'],
            'Rajapalayam Taluk':   ['Rajapalayam'],
            'Sivakasi Taluk':      ['Sivakasi'],
        },
    },
    'Puducherry': {
        'Puducherry District': {
            'Puducherry Taluk': ['Puducherry', 'Ozhukarai'],
            'Villianur Taluk':  ['Villianur', 'Madhagadipet', 'Mannadipet'],
            'Ariyankuppam Taluk': ['Ariyankuppam', 'Nettapakkam'],
            'Bahour Taluk':     ['Bahour'],
        },
        'Karaikal District': {
            'Karaikal Taluk':   ['Karaikal', 'Neravy'],
            'Tirunallar Taluk': ['Tirunallar'],
        },
        'Mahe District': {
            'Mahe Taluk': ['Mahe'],
        },
        'Yanam District': {
            'Yanam Taluk': ['Yanam'],
        },
    },
};

// ── Land form options ─────────────────────────────────────────────────────────
export const LAND_TYPES       = ['Wet Land (Nanjai)', 'Dry Land (Punjai)', 'Mixed Land'];
export const SOIL_TYPES       = ['Red Soil', 'Black Soil', 'Alluvial Soil', 'Sandy Soil', 'Clay Soil', 'Loamy Soil', 'Laterite Soil'];
export const WATER_SOURCES    = ['Borewell', 'Open Well', 'Canal', 'River', 'Rain-fed', 'Pond / Lake'];
export const IRRIGATION_LEVELS= ['Good', 'Moderate', 'Poor'];
export const CURRENT_CROPS    = ['Paddy', 'Sugarcane', 'Groundnut', 'Cotton', 'Maize', 'Millet', 'Pulses', 'Vegetables', 'Fruits', 'Others'];
export const PREVIOUS_CROPS   = ['None', 'Paddy', 'Sugarcane', 'Groundnut', 'Cotton', 'Maize', 'Millet', 'Pulses', 'Fallow'];
export const SIZE_UNITS       = ['Acres', 'Hectares'];
