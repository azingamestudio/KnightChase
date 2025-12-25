
// i18n.ts - Localization system
import { safeStorage } from './storage';

export type LanguageCode = 'en' | 'tr' | 'ar' | 'de' | 'es' | 'it' | 'ru';

export interface Translation {
  // Menu
  menu_ai_training: string;
  menu_duel: string;
  menu_adventure: string;
  menu_online: string;
  menu_rankings: string;
  menu_settings: string;
  menu_unlock_premium: string;
  menu_remove_ads: string;
  
  // Settings
  settings_title: string;
  settings_premium_status: string;
  settings_active: string;
  settings_free_plan: string;
  settings_restore_purchases: string;
  settings_volume: string;
  settings_music_volume: string;
  settings_sfx_volume: string;
  settings_language: string;
  settings_back: string;
  
  // Leaderboard
  leaderboard_title: string;
  leaderboard_loading: string;
  leaderboard_wins: string;
  leaderboard_tip: string;
  
  // Game
  game_turn_you: string;
  game_turn_opponent: string;
  game_turn_thinking: string;
  game_match_ended: string;
  game_waiting_opponent: string;
  game_room_id: string;
  game_leave_room: string;
  game_create_room: string;
  game_join: string;
  game_back: string;
  game_play_again: string;
  game_victory: string;
  game_defeat: string;
  game_captured: string;
  game_trapped: string;
  
  // Modifiers
  mod_coffee: string;
  mod_sabotage: string;
  mod_invisible: string;

  // Adventure
  adventure_lives: string;
  adventure_no_lives: string;
  adventure_refill_in: string;
}

const translations: Record<LanguageCode, Translation> = {
  en: {
    menu_ai_training: "AI Training",
    menu_duel: "Duel - Pass & Play",
    menu_adventure: "Adventure",
    menu_online: "Play Online",
    menu_rankings: "Rankings",
    menu_settings: "Settings",
    menu_unlock_premium: "Unlock Premium 👑",
    menu_remove_ads: "Remove Ads & Unlock All Skins",
    
    settings_title: "Settings",
    settings_premium_status: "Premium Status:",
    settings_active: "ACTIVE 👑",
    settings_free_plan: "Free Plan",
    settings_restore_purchases: "Restore Purchases",
    settings_volume: "Volume",
    settings_music_volume: "Music Volume",
    settings_sfx_volume: "SFX Volume",
    settings_language: "Language",
    settings_back: "Back",
    
    leaderboard_title: "Leaderboard",
    leaderboard_loading: "Loading scores...",
    leaderboard_wins: "Wins",
    leaderboard_tip: "Win matches vs AI Hard (+300pts) to climb faster!",
    
    game_turn_you: "YOUR TURN",
    game_turn_opponent: "OPPONENT'S TURN",
    game_turn_thinking: "Thinking...",
    game_match_ended: "Match Ended",
    game_waiting_opponent: "Waiting for opponent...",
    game_room_id: "Room ID:",
    game_leave_room: "Leave Room",
    game_create_room: "Create Room",
    game_join: "Join",
    game_back: "Back to Menu",
    game_play_again: "Play Again",
    game_victory: "VICTORY!",
    game_defeat: "TRASHED!",
    game_captured: "CAPTURED THE ENEMY!",
    game_trapped: "OPPONENT IS TRAPPED!",
    
    mod_coffee: "Coffee Spill",
    mod_sabotage: "Sabotage",
    mod_invisible: "Invisible Ink",

    adventure_lives: "Lives",
    adventure_no_lives: "No lives left! Wait for refill or upgrade to Premium.",
    adventure_refill_in: "Refills in:"
  },
  tr: {
    menu_ai_training: "Yapay Zeka Eğitimi",
    menu_duel: "Düello - Paslaş & Oyna",
    menu_adventure: "Macera",
    menu_online: "Çevrimiçi Oyna",
    menu_rankings: "Sıralamalar",
    menu_settings: "Ayarlar",
    menu_unlock_premium: "Premium'u Aç 👑",
    menu_remove_ads: "Reklamları Kaldır & Tüm Kostümleri Aç",
    
    settings_title: "Ayarlar",
    settings_premium_status: "Premium Durumu:",
    settings_active: "AKTİF 👑",
    settings_free_plan: "Ücretsiz Plan",
    settings_restore_purchases: "Satın Alımları Geri Yükle",
    settings_volume: "Ses",
    settings_music_volume: "Müzik Sesi",
    settings_sfx_volume: "Efekt Sesi",
    settings_language: "Dil",
    settings_back: "Geri",
    
    leaderboard_title: "Sıralama",
    leaderboard_loading: "Puanlar yükleniyor...",
    leaderboard_wins: "Galibiyet",
    leaderboard_tip: "Zor yapay zekaya karşı kazanarak (+300p) daha hızlı yüksel!",
    
    game_turn_you: "SENİN SIRAN",
    game_turn_opponent: "RAKİBİN SIRASI",
    game_turn_thinking: "Düşünüyor...",
    game_match_ended: "Maç Bitti",
    game_waiting_opponent: "Rakip bekleniyor...",
    game_room_id: "Oda No:",
    game_leave_room: "Odadan Ayrıl",
    game_create_room: "Oda Oluştur",
    game_join: "Katıl",
    game_back: "Menüye Dön",
    game_play_again: "Tekrar Oyna",
    game_victory: "ZAFER!",
    game_defeat: "ÇÖP OLDUN!",
    game_captured: "DÜŞMANI YAKALADIN!",
    game_trapped: "RAKİP SIKIŞTI!",
    
    mod_coffee: "Kahve Dökülmesi",
    mod_sabotage: "Sabotaj",
    mod_invisible: "Görünmez Mürekkep",

    adventure_lives: "Can",
    adventure_no_lives: "Can kalmadı! Yenilenmesini bekle veya Premium al.",
    adventure_refill_in: "Yenilenme:"
  },
  ar: {
    menu_ai_training: "تدريب الذكاء الاصطناعي",
    menu_duel: "مبارزة - تمرير ولعب",
    menu_adventure: "مغامرة",
    menu_online: "اللعب عبر الإنترنت",
    menu_rankings: "التصنيفات",
    menu_settings: "الإعدادات",
    menu_unlock_premium: "فتح العضوية المميزة 👑",
    menu_remove_ads: "إزالة الإعلانات وفتح جميع الأشكال",
    
    settings_title: "الإعدادات",
    settings_premium_status: "حالة العضوية:",
    settings_active: "نشط 👑",
    settings_free_plan: "خطة مجانية",
    settings_restore_purchases: "استعادة المشتريات",
    settings_volume: "الصوت",
    settings_music_volume: "صوت الموسيقى",
    settings_sfx_volume: "صوت المؤثرات",
    settings_language: "اللغة",
    settings_back: "عودة",
    
    leaderboard_title: "لوحة المتصدرين",
    leaderboard_loading: "جاري تحميل النتائج...",
    leaderboard_wins: "فوز",
    leaderboard_tip: "اربح مباريات ضد الذكاء الاصطناعي الصعب (+300 نقطة) للصعود أسرع!",
    
    game_turn_you: "دورك",
    game_turn_opponent: "دور الخصم",
    game_turn_thinking: "يفكر...",
    game_match_ended: "انتهت المباراة",
    game_waiting_opponent: "في انتظار الخصم...",
    game_room_id: "رقم الغرفة:",
    game_leave_room: "مغادرة الغرفة",
    game_create_room: "إنشاء غرفة",
    game_join: "انضمام",
    game_back: "العودة للقائمة",
    game_play_again: "العب مرة أخرى",
    game_victory: "نصر!",
    game_defeat: "هزيمة!",
    game_captured: "تم أسر العدو!",
    game_trapped: "الخصم محاصر!",
    
    mod_coffee: "انسكاب القهوة",
    mod_sabotage: "تخريب",
    mod_invisible: "حبر سري",

    adventure_lives: "Lives",
    adventure_no_lives: "No lives left! Wait for refill or upgrade to Premium.",
    adventure_refill_in: "Refills in:"
  },
  de: {
    menu_ai_training: "KI-Training",
    menu_duel: "Duell - Pass & Play",
    menu_adventure: "Abenteuer",
    menu_online: "Online Spielen",
    menu_rankings: "Ranglisten",
    menu_settings: "Einstellungen",
    menu_unlock_premium: "Premium Freischalten 👑",
    menu_remove_ads: "Keine Werbung & Alle Skins",
    
    settings_title: "Einstellungen",
    settings_premium_status: "Premium-Status:",
    settings_active: "AKTIV 👑",
    settings_free_plan: "Kostenlos",
    settings_restore_purchases: "Käufe Wiederherstellen",
    settings_volume: "Lautstärke",
    settings_music_volume: "Musik",
    settings_sfx_volume: "Effekte",
    settings_language: "Sprache",
    settings_back: "Zurück",
    
    leaderboard_title: "Bestenliste",
    leaderboard_loading: "Lade Ergebnisse...",
    leaderboard_wins: "Siege",
    leaderboard_tip: "Gewinne gegen schwere KI (+300 Pkt) um schneller aufzusteigen!",
    
    game_turn_you: "DEIN ZUG",
    game_turn_opponent: "GEGNER AM ZUG",
    game_turn_thinking: "Denkt nach...",
    game_match_ended: "Spiel Beendet",
    game_waiting_opponent: "Warte auf Gegner...",
    game_room_id: "Raum-ID:",
    game_leave_room: "Raum Verlassen",
    game_create_room: "Raum Erstellen",
    game_join: "Beitreten",
    game_back: "Zum Menü",
    game_play_again: "Nochmal Spielen",
    game_victory: "SIEG!",
    game_defeat: "NIEDERLAGE!",
    game_captured: "GEGNER GEFANGEN!",
    game_trapped: "GEGNER SITZT FEST!",
    
    mod_coffee: "Kaffee verschüttet",
    mod_sabotage: "Sabotage",
    mod_invisible: "Unsichtbare Tinte",

    adventure_lives: "Lives",
    adventure_no_lives: "No lives left! Wait for refill or upgrade to Premium.",
    adventure_refill_in: "Refills in:"
  },
  es: {
    menu_ai_training: "Entrenamiento IA",
    menu_duel: "Duelo - Pasar y Jugar",
    menu_adventure: "Aventura",
    menu_online: "Jugar Online",
    menu_rankings: "Clasificación",
    menu_settings: "Ajustes",
    menu_unlock_premium: "Desbloquear Premium 👑",
    menu_remove_ads: "Quitar Anuncios y Skins",
    
    settings_title: "Ajustes",
    settings_premium_status: "Estado Premium:",
    settings_active: "ACTIVO 👑",
    settings_free_plan: "Plan Gratuito",
    settings_restore_purchases: "Restaurar Compras",
    settings_volume: "Volumen",
    settings_music_volume: "Música",
    settings_sfx_volume: "Efectos",
    settings_language: "Idioma",
    settings_back: "Volver",
    
    leaderboard_title: "Clasificación",
    leaderboard_loading: "Cargando puntuaciones...",
    leaderboard_wins: "Victorias",
    leaderboard_tip: "¡Gana contra IA difícil (+300pts) para subir más rápido!",
    
    game_turn_you: "TU TURNO",
    game_turn_opponent: "TURNO DEL OPONENTE",
    game_turn_thinking: "Pensando...",
    game_match_ended: "Partida Terminada",
    game_waiting_opponent: "Esperando oponente...",
    game_room_id: "ID Sala:",
    game_leave_room: "Salir de Sala",
    game_create_room: "Crear Sala",
    game_join: "Unirse",
    game_back: "Volver al Menú",
    game_play_again: "Jugar de Nuevo",
    game_victory: "¡VICTORIA!",
    game_defeat: "¡DERROTA!",
    game_captured: "¡ENEMIGO CAPTURADO!",
    game_trapped: "¡OPONENTE ATRAPADO!",
    
    mod_coffee: "Derrame de Café",
    mod_sabotage: "Sabotaje",
    mod_invisible: "Tinta Invisible",

    adventure_lives: "Lives",
    adventure_no_lives: "No lives left! Wait for refill or upgrade to Premium.",
    adventure_refill_in: "Refills in:"
  },
  it: {
    menu_ai_training: "Allenamento IA",
    menu_duel: "Duello - Passa e Gioca",
    menu_adventure: "Avventura",
    menu_online: "Gioca Online",
    menu_rankings: "Classifiche",
    menu_settings: "Impostazioni",
    menu_unlock_premium: "Sblocca Premium 👑",
    menu_remove_ads: "Rimuovi Pubblicità & Skins",
    
    settings_title: "Impostazioni",
    settings_premium_status: "Stato Premium:",
    settings_active: "ATTIVO 👑",
    settings_free_plan: "Piano Gratuito",
    settings_restore_purchases: "Ripristina Acquisti",
    settings_volume: "Volume",
    settings_music_volume: "Musica",
    settings_sfx_volume: "Effetti",
    settings_language: "Lingua",
    settings_back: "Indietro",
    
    leaderboard_title: "Classifica",
    leaderboard_loading: "Caricamento punteggi...",
    leaderboard_wins: "Vittorie",
    leaderboard_tip: "Vinci contro IA Difficile (+300pt) per salire più in fretta!",
    
    game_turn_you: "IL TUO TURNO",
    game_turn_opponent: "TURNO AVVERSARIO",
    game_turn_thinking: "Sta pensando...",
    game_match_ended: "Partida Terminata",
    game_waiting_opponent: "In attesa avversario...",
    game_room_id: "ID Stanza:",
    game_leave_room: "Lascia Stanza",
    game_create_room: "Crea Stanza",
    game_join: "Unisciti",
    game_back: "Torna al Menù",
    game_play_again: "Gioca Ancora",
    game_victory: "VITTORIA!",
    game_defeat: "SCONFITTA!",
    game_captured: "NEMICO CATTURATO!",
    game_trapped: "AVVERSARIO INTRAPPOLATO!",
    
    mod_coffee: "Caffè Rovesciato",
    mod_sabotage: "Sabotaggio",
    mod_invisible: "Inchiostro Invisibile",

    adventure_lives: "Lives",
    adventure_no_lives: "No lives left! Wait for refill or upgrade to Premium.",
    adventure_refill_in: "Refills in:"
  },
  ru: {
    menu_ai_training: "Тренировка с ИИ",
    menu_duel: "Дуэль - На одном устройстве",
    menu_adventure: "Приключение",
    menu_online: "Играть Онлайн",
    menu_rankings: "Рейтинг",
    menu_settings: "Настройки",
    menu_unlock_premium: "Разблокировать Премиум 👑",
    menu_remove_ads: "Убрать рекламу и скины",
    
    settings_title: "Настройки",
    settings_premium_status: "Премиум статус:",
    settings_active: "АКТИВЕН 👑",
    settings_free_plan: "Бесплатный",
    settings_restore_purchases: "Восстановить покупки",
    settings_volume: "Громкость",
    settings_music_volume: "Музыка",
    settings_sfx_volume: "Эффекты",
    settings_language: "Язык",
    settings_back: "Назад",
    
    leaderboard_title: "Таблица лидеров",
    leaderboard_loading: "Загрузка очков...",
    leaderboard_wins: "Победы",
    leaderboard_tip: "Побеждай сложный ИИ (+300 очков) для быстрого роста!",
    
    game_turn_you: "ТВОЙ ХОД",
    game_turn_opponent: "ХОД ПРОТИВНИКА",
    game_turn_thinking: "Думает...",
    game_match_ended: "Матч окончен",
    game_waiting_opponent: "Ожидание противника...",
    game_room_id: "ID Комнаты:",
    game_leave_room: "Покинуть комнату",
    game_create_room: "Создать комнату",
    game_join: "Войти",
    game_back: "В меню",
    game_play_again: "Играть снова",
    game_victory: "ПОБЕДА!",
    game_defeat: "ПОРАЖЕНИЕ!",
    game_captured: "ВРАГ ЗАХВАЧЕН!",
    game_trapped: "ПРОТИВНИК В ЛОВУШКЕ!",
    
    mod_coffee: "Разлитый кофе",
    mod_sabotage: "Саботаж",
    mod_invisible: "Невидимые чернила",

    adventure_lives: "Lives",
    adventure_no_lives: "No lives left! Wait for refill or upgrade to Premium.",
    adventure_refill_in: "Refills in:"
  }
};

export const getLanguage = (): LanguageCode => {
  const storedLang = safeStorage.getItem('language');
  if (storedLang && translations[storedLang as LanguageCode]) {
    return storedLang as LanguageCode;
  }
  
  // Detect device language
  const browserLang = navigator.language.split('-')[0];
  if (translations[browserLang as LanguageCode]) {
    return browserLang as LanguageCode;
  }
  
  return 'en';
};

export const setLanguage = (lang: LanguageCode) => {
  safeStorage.setItem('language', lang);
  // Reloading usually helps update everything, but react state is better.
  // We will handle state in App.tsx
};

export const t = (key: keyof Translation, lang: LanguageCode): string => {
  return translations[lang][key] || translations['en'][key] || key;
};
