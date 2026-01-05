
export type Language = 'en' | 'tr';

export const translations = {
  en: {
    // General
    library: "Library",
    settings: "Settings",
    saved: "Saved",
    saving: "Saving...",
    backup: "Backup Project (.json)",
    copyLink: "Copy App Link",
    cancel: "Cancel",
    apply: "Apply",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",
    analyzing: "Analyzing...",
    scan: "Scan",
    
    // API Key
    aiConfig: "AI Connection",
    apiKeyPlaceholder: "Paste Gemini API Key...",
    getKeyLink: "Get Free Key (Google AI Studio)",
    keySaved: "Key Saved!",
    
    // Bookshelf
    searchPlaceholder: "Search your library...",
    newBook: "New Book",
    allBooks: "All Books",
    favorites: "Favorites",
    recent: "Recent",
    import: "Import",
    startNewBook: "Start New Book",
    words: "Words",
    
    // Book Settings
    bookSettings: "Book Settings",
    title: "Title",
    author: "Author",
    synopsis: "Synopsis",
    coverStyle: "Cover Style",
    typography: "Typography",
    saveChanges: "Save Changes",

    // Binder
    binder: "Binder",
    newDoc: "New Doc",
    group: "Group",
    emptyBinder: "Your binder is empty. Create a document to start writing.",
    bookmarks: "Bookmarks",
    all: "All",

    // Toolbar & Menu
    file: "File",
    home: "Home",
    insert: "Insert",
    layout: "Layout",
    view: "View",
    review: "Review",
    smartSync: "Smart Sync",
    aiMagic: "AI Magic",
    export: "Export",
    print: "Print",
    editorPlaceholder: "Type '/' for commands...",
    
    // Views
    editor: "Editor",
    corkboard: "Corkboard",
    timeline: "Timeline",
    scrivenings: "Scrivenings",
    structure: "Structure",
    characters: "Characters",
    locations: "Locations",
    reports: "Reports",
    
    // AI
    magicAssistant: "Magic Assistant",
    chat: "Chat",
    create: "Create",
    askAnything: "Ask me anything...",
    aiInitialMessage: "Hello! I can help you write, edit, or generate images for your document.",
    
    // Themes
    themes: "Themes",
    stickyNotes: "Sticky Notes",
    history: "Version History",
    bookDesigner: "Book Designer",

    // Menus
    file_new: "New Document",
    file_export_html: "Export HTML",
    file_export_fdx: "Export Final Draft (.fdx)",
    file_print: "Print",
    edit_undo: "Undo",
    edit_redo: "Redo",
    edit_select_all: "Select All",
    view_zoom_in: "Zoom In",
    view_zoom_out: "Zoom Out",
    view_reset: "Reset Zoom",
    insert_image: "Image (Upload)",
    insert_date: "Current Date",
    help_shortcuts: "Shortcuts",
    
    // Slash Menu
    slash_text: "Text",
    slash_h1: "Heading 1",
    slash_h2: "Heading 2",
    slash_bullet: "Bullet List",
    slash_number: "Numbered List",
    slash_quote: "Quote",
    slash_scene: "Scene Heading",
    slash_action: "Action",
    slash_char: "Character",
    slash_dialogue: "Dialogue",
    slash_parenthetical: "Parenthetical",
    slash_transition: "Transition",
    slash_image: "Generate Image",
    slash_magic: "Magic Write",

    // Corkboard
    corkboard_empty: "This board is empty.",
    corkboard_empty_desc: "Add documents or sticky notes to organize your thoughts.",
    add_first_note: "Add First Sticky Note",
    new_note: "New Note",

    // Timeline
    timeline_header: "Timeline",
    unscheduled: "Unscheduled",
    chronological: "Chronological",
    narrative_order: "Binder Order",
    drag_to_remove: "Drag items here to remove time.",
    conflict: "Conflict",

    // Character View
    char_header: "Character Elements",
    char_desc: "Map internal and external drivers for characters.",
    pov: "Point of View (POV)",
    check_consistency: "Check Consistency",
    add_character: "Add a character to this scene...",
    role_protagonist: "Protagonist",
    role_antagonist: "Antagonist",
    role_supporting: "Supporting",
    role_minor: "Minor",
    goal: "Goal",
    motivation: "Motivation",
    conflict_field: "Conflict",
    climax: "Climax",
    emotional_arc: "Emotional Arc",
    start_state: "Start State",
    end_state: "End State",
    outcome: "Outcome",
    physical_activity: "Physical Activity",
    analyze: "Analyze",
    ideas: "Ideas",

    // Story Mechanics
    mechanics_header: "Story Mechanics",
    mechanics_desc: "Evaluate the narrative arc and structural progression.",
    ai_analyze_scene: "AI Analyze Scene",
    structure_purpose: "Structure & Purpose",
    scene_name: "Scene Name",
    story_map: "Story Map",
    scene_type: "Scene Type",
    scene_purpose: "Scene Purpose",
    hooks_transitions: "Hooks & Transitions",
    entry_hook: "Entry Hook",
    exit_hook: "Exit Hook",
    dynamics: "Dynamics",
    tension: "Tension",
    pacing: "Pacing",
    info_flow: "Information Flow",
    is_flashback: "Is Flashback?",
    backstory_level: "Backstory Level",
    revelation: "Revelation / Information",

    // Settings
    setting_header: "Setting & Atmosphere",
    setting_desc: "Define the stage and sensory experience.",
    extract_details: "Extract Details",
    logistics: "Logistics",
    location: "Location",
    time_date: "Time / Date",
    sensory_immersion: "Sensory Immersion",
    sight: "Sight",
    sound: "Sound",
    smell: "Smell",
    touch: "Touch",
    taste: "Taste",
    key_objects: "Key Objects (Props)",
    emotional_impact: "Emotional Impact",

    // Readability
    readability_header: "Readability Analyzer",
    readability_empty: "Select a specific document from the binder to analyze.",
    smoothness_score: "Smoothness Score",
    grade_level: "Grade Level",
    avg_sentence: "Avg Sentence",
    flagged_issues: "Flagged Issues",
    
    // Revision
    revisions: "Revisions",
    fix_all: "Fix All",
    rescan: "Re-scan",
    grammar_checks: "Grammar & Checks",
    creative_style: "Creative Style",
    apply_fix: "Apply Fix",
    
    // Plot Grid
    plot_grid: "Plot Grid",
    plot_desc: "Track subplots and character arcs across scenes.",
    add_thread: "Add Plot Thread",
    thread_name_placeholder: "Thread Name (e.g. Hero's Arc)",
    scene_chapter: "Scene / Chapter",

    // Dialogue
    dialogue_audit: "Dialogue Audit",
    voice_balance: "Voice Balance",
    all_characters: "All Characters",
    
    // Insight
    insight_board: "Insight Board",
    cross_reference: "Cross-reference story elements",
    sync_scan: "Sync/Scan",
    continuity_errors: "Continuity Errors",
    
    // Database
    database_header: "Manuscript Database",
    filter_db: "Filter database...",
    status: "Status",
    cast_size: "Cast Size",
  },
  tr: {
    // General
    library: "Kütüphane",
    settings: "Ayarlar",
    saved: "Kaydedildi",
    saving: "Kaydediliyor...",
    backup: "Yedekle (.json)",
    copyLink: "Linki Kopyala",
    cancel: "İptal",
    apply: "Uygula",
    save: "Kaydet",
    delete: "Sil",
    edit: "Düzenle",
    add: "Ekle",
    close: "Kapat",
    analyzing: "Analiz ediliyor...",
    scan: "Tara",
    
    // API Key
    aiConfig: "AI Bağlantısı",
    apiKeyPlaceholder: "Gemini API Anahtarını Yapıştır...",
    getKeyLink: "Ücretsiz Anahtar Al (Google AI Studio)",
    keySaved: "Anahtar Kaydedildi!",
    
    // Bookshelf
    searchPlaceholder: "Kütüphanede ara...",
    newBook: "Yeni Kitap",
    allBooks: "Tüm Kitaplar",
    favorites: "Favoriler",
    recent: "Son Kullanılan",
    import: "İçe Aktar",
    startNewBook: "Yeni Kitap Başlat",
    words: "Kelime",
    
    // Book Settings
    bookSettings: "Kitap Ayarları",
    title: "Başlık",
    author: "Yazar",
    synopsis: "Özet",
    coverStyle: "Kapak Stili",
    typography: "Tipografi",
    saveChanges: "Değişiklikleri Kaydet",

    // Binder
    binder: "Dosyalar",
    newDoc: "Yeni Belge",
    group: "Grup",
    emptyBinder: "Klasör boş. Yazmaya başlamak için bir belge oluşturun.",
    bookmarks: "Yer İmleri",
    all: "Tümü",

    // Toolbar & Menu
    file: "Dosya",
    home: "Giriş",
    insert: "Ekle",
    layout: "Düzen",
    view: "Görünüm",
    review: "Gözden Geçir",
    smartSync: "Akıllı Senkron",
    aiMagic: "AI Sihir",
    export: "Dışa Aktar",
    print: "Yazdır",
    editorPlaceholder: "Komutlar için '/' yazın...",
    
    // Views
    editor: "Editör",
    corkboard: "Mantar Pano",
    timeline: "Zaman Çizelgesi",
    scrivenings: "Bütünleşik Mod",
    structure: "Yapı",
    characters: "Karakterler",
    locations: "Mekanlar",
    reports: "Raporlar",
    
    // AI
    magicAssistant: "Sihirli Asistan",
    chat: "Sohbet",
    create: "Oluştur",
    askAnything: "Bana her şeyi sor...",
    aiInitialMessage: "Merhaba! Belgenizi yazmanıza, düzenlemenize veya görsel oluşturmanıza yardımcı olabilirim.",
    
    // Themes
    themes: "Temalar",
    stickyNotes: "Yapışkan Notlar",
    history: "Geçmiş",
    bookDesigner: "Kitap Tasarımcısı",

    // Menus
    file_new: "Yeni Belge",
    file_export_html: "HTML Olarak Aktar",
    file_export_fdx: "Final Draft (.fdx) Olarak Aktar",
    file_print: "Yazdır",
    edit_undo: "Geri Al",
    edit_redo: "Yinele",
    edit_select_all: "Tümünü Seç",
    view_zoom_in: "Yakınlaştır",
    view_zoom_out: "Uzaklaştır",
    view_reset: "Yakınlaştırmayı Sıfırla",
    insert_image: "Resim (Yükle)",
    insert_date: "Geçerli Tarih",
    help_shortcuts: "Kısayollar",
    
    // Slash Menu
    slash_text: "Metin",
    slash_h1: "Başlık 1",
    slash_h2: "Başlık 2",
    slash_bullet: "Madde İşaretli Liste",
    slash_number: "Numaralı Liste",
    slash_quote: "Alıntı",
    slash_scene: "Sahne Başlığı",
    slash_action: "Aksiyon",
    slash_char: "Karakter",
    slash_dialogue: "Diyalog",
    slash_parenthetical: "Parantez İçi",
    slash_transition: "Geçiş",
    slash_image: "Görsel Oluştur",
    slash_magic: "Sihirli Yazım",

    // Corkboard
    corkboard_empty: "Bu pano boş.",
    corkboard_empty_desc: "Düşüncelerinizi düzenlemek için belge veya yapışkan not ekleyin.",
    add_first_note: "İlk Notu Ekle",
    new_note: "Yeni Not",

    // Timeline
    timeline_header: "Zaman Çizelgesi",
    unscheduled: "Planlanmamış",
    chronological: "Kronolojik",
    narrative_order: "Klasör Sırası",
    drag_to_remove: "Zamanı kaldırmak için öğeleri buraya sürükleyin.",
    conflict: "Çakışma",

    // Character View
    char_header: "Karakter Öğeleri",
    char_desc: "Karakterler için iç ve dış etkenleri haritalayın.",
    pov: "Bakış Açısı (POV)",
    check_consistency: "Tutarlılığı Kontrol Et",
    add_character: "Bu sahneye karakter ekle...",
    role_protagonist: "Ana Karakter",
    role_antagonist: "Karşıt Karakter",
    role_supporting: "Yardımcı",
    role_minor: "Önemsiz",
    goal: "Hedef",
    motivation: "Motivasyon",
    conflict_field: "Çatışma",
    climax: "Doruk Noktası",
    emotional_arc: "Duygusal Yay",
    start_state: "Başlangıç Durumu",
    end_state: "Bitiş Durumu",
    outcome: "Sonuç",
    physical_activity: "Fiziksel Aktivite",
    analyze: "Analiz Et",
    ideas: "Fikirler",

    // Story Mechanics
    mechanics_header: "Hikaye Mekaniği",
    mechanics_desc: "Anlatı yayını ve yapısal ilerlemeyi değerlendirin.",
    ai_analyze_scene: "AI Sahne Analizi",
    structure_purpose: "Yapı ve Amaç",
    scene_name: "Sahne Adı",
    story_map: "Hikaye Haritası",
    scene_type: "Sahne Türü",
    scene_purpose: "Sahne Amacı",
    hooks_transitions: "Kancalar ve Geçişler",
    entry_hook: "Giriş Kancası",
    exit_hook: "Çıkış Kancası",
    dynamics: "Dinamikler",
    tension: "Gerilim",
    pacing: "Hız",
    info_flow: "Bilgi Akışı",
    is_flashback: "Geriye Dönüş mü?",
    backstory_level: "Arka Plan Seviyesi",
    revelation: "Vahiy / Bilgi",

    // Settings
    setting_header: "Ayar ve Atmosfer",
    setting_desc: "Sahneyi ve duyusal deneyimi tanımlayın.",
    extract_details: "Detayları Çıkar",
    logistics: "Lojistik",
    location: "Konum",
    time_date: "Zaman / Tarih",
    sensory_immersion: "Duyusal Daldırma",
    sight: "Görme",
    sound: "Ses",
    smell: "Koku",
    touch: "Dokunma",
    taste: "Tat",
    key_objects: "Ana Nesneler (Dekor)",
    emotional_impact: "Duygusal Etki",

    // Readability
    readability_header: "Okunabilirlik Analizörü",
    readability_empty: "Analiz etmek için klasörden belirli bir belge seçin.",
    smoothness_score: "Akıcılık Puanı",
    grade_level: "Seviye",
    avg_sentence: "Ort. Cümle",
    flagged_issues: "İşaretlenen Sorunlar",
    
    // Revision
    revisions: "Düzeltmeler",
    fix_all: "Tümünü Düzelt",
    rescan: "Yeniden Tara",
    grammar_checks: "Dilbilgisi ve Kontroller",
    creative_style: "Yaratıcı Stil",
    apply_fix: "Düzeltmeyi Uygula",
    
    // Plot Grid
    plot_grid: "Olay Örgüsü Ağı",
    plot_desc: "Alt olayları ve karakter yaylarını sahneler arasında takip edin.",
    add_thread: "Konu Ekle",
    thread_name_placeholder: "Konu Adı (örn. Kahramanın Yayı)",
    scene_chapter: "Sahne / Bölüm",

    // Dialogue
    dialogue_audit: "Diyalog Denetimi",
    voice_balance: "Ses Dengesi",
    all_characters: "Tüm Karakterler",
    
    // Insight
    insight_board: "İçgörü Panosu",
    cross_reference: "Hikaye öğelerini çapraz referanslayın",
    sync_scan: "Senkronize Et/Tara",
    continuity_errors: "Süreklilik Hataları",
    
    // Database
    database_header: "Taslak Veritabanı",
    filter_db: "Veritabanını filtrele...",
    status: "Durum",
    cast_size: "Kadro Boyutu",
  }
};
