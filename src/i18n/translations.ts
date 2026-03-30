// ─────────────────────────────────────────────────────────────────────────────
// translations.ts
// Single source of truth for all UI strings across 7 languages.
// Usage: t = translations[lang]
// ─────────────────────────────────────────────────────────────────────────────

export type Lang = "en" | "es" | "pt" | "ko" | "zh" | "ja" | "ar" | "hi";

export interface LangMeta {
  code: Lang;
  label: string;    // native name
  flag: string;     // emoji flag
  flagCode: string; // ISO 3166-1 alpha-2 for flagcdn
  dir: "ltr" | "rtl";
}

export const LANGUAGES: LangMeta[] = [
  { code: "en", label: "English",    flag: "🇺🇸", flagCode: "us", dir: "ltr" },
  { code: "es", label: "Español",    flag: "🇪🇸", flagCode: "es", dir: "ltr" },
  { code: "pt", label: "Português",  flag: "🇧🇷", flagCode: "br", dir: "ltr" },
  { code: "ko", label: "한국어",     flag: "🇰🇷", flagCode: "kr", dir: "ltr" },
  { code: "zh", label: "中文",        flag: "🇨🇳", flagCode: "cn", dir: "ltr" },
  { code: "ja", label: "日本語",      flag: "🇯🇵", flagCode: "jp", dir: "ltr" },
  { code: "ar", label: "العربية",    flag: "🇸🇦", flagCode: "sa", dir: "rtl" },
  { code: "hi", label: "हिन्दी",      flag: "🇮🇳", flagCode: "in", dir: "ltr" },
];

export interface Translations {
  // Navbar
  nav: {
    generate: string;
    generating: string;
    noFiles: string;
    converter: string;
    createGradient: string;
  };
  // Hero
  hero: {
    badge: string;
    title1: string;
    title2: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  // Dropzone
  dropzone: {
    idleTitle: string;
    idleSub: string;
    idleCaption: string;
    draggingTitle: string;
    draggingSub: string;
    hasFilesTitle: string;
    hasFilesSub: string;
    errorTitle: string;
    errorDismiss: string;
  };
  // File list
  list: {
    filesLoaded: (n: number) => string;
    converted: (n: number) => string;
    downloadAll: string;
    convertAll: string;
    convert: string;
    gradients: (n: number) => string;
    gradientsFound: (n: number) => string;
    remove: string;
    error: string;
    download: string;
    preview: string;
  };
  // Live preview modal
  modal: {
    title: string;
    close: string;
    download: string;
    gradientLabel: string;
    stopsLabel: string;
  };
  // Footer
  footer: {
    made: string;
  };
  // Gradient Editor
  editor?: {
    title: string;
    subtitle: string;
    stopsLabel: string;
    position: string;
    opacity: string;
    addStop: string;
    removeStop: string;
    namePlaceholder: string;
    download: string;
    editorSection: string;
  };
  // Create gradient page
  create?: {
    pageTitle: string;
    heroSubtitle: string;
    editorTitle: string;
    dragHint: string;
    selectedStop: string;
    clickBar: string;
    previewTitle: string;
    imageBy: string;
    from: string;
    navLink: string;
    dragDelete?: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: pluralise safely for non-English languages
// ─────────────────────────────────────────────────────────────────────────────

export const translations: Record<Lang, Translations> = {
  // ── KOREAN ──────────────────────────────────────────────────────────────
  ko: {
    nav: {
      generate:      ".GGR 생성",
      generating:    "생성 중…",
      noFiles:       "변환된 파일 없음",
      converter:     "변환기",
      createGradient:"그라데이션 생성",
    },
    hero: {
      badge:      "",
      title1:     "Photoshop 변환",
      title2:     "GIMP 및 Krita용 그라데이션",
      subtitle:   ".GRD 파일을 드롭하여 즉시 사용할 수 있는 .GGR 파일을 얻거나 아래 편집기를 사용하여 처음부터 만드세요.",
      step1Title: "드롭",
      step1Desc:  "하나 이상의 .GRD 파일 업로드",
      step2Title: "변환",
      step2Desc:  "네트워크 요청 없이 로컬에서 파싱됨",
      step3Title: "다운로드",
      step3Desc:  "즉시 .GGR 파일 다운로드",
    },
    dropzone: {
      idleTitle:    "여기에 .GRD 파일을 드롭하세요",
      idleSub:      "또는 클릭하여 찾아보기",
      idleCaption:  "Photoshop 그라데이션 파일 · 다중 파일 지원",
      draggingTitle:"놓아서 파일 추가",
      draggingSub:  ".GRD 그라데이션 파일을 드롭하여 대기열에 추가하세요",
      hasFilesTitle:"파일 로드됨",
      hasFilesSub:  "더 드롭하거나 클릭하여 찾아보기",
      errorTitle:   "지원되지 않는 파일 형식",
      errorDismiss: "무시",
    },
    list: {
      filesLoaded:    (n) => `${n}개 파일 로드됨`,
      converted:      (n) => `${n}개 변환됨`,
      downloadAll:    "모두 다운로드",
      convertAll:     "변환 및 다운로드",
      convert:        "변환",
      gradients:      (n) => `${n}개 그라데이션`,
      gradientsFound: (n) => `${n}개 그라데이션 발견됨`,
      remove:         "제거",
      error:          "오류",
      download:       "다운로드",
      preview:        "미리보기",
    },
    modal: {
      title:         "라이브 미리보기",
      close:         "닫기",
      download:      ".GGR 다운로드",
      gradientLabel: "그라데이션 맵",
      stopsLabel:    "색상 정지점",
    },
    footer: {
      made: "디자인: ❤️ 작성자:",
    },
    editor: {
      title:         "편집기",
      subtitle:      "새 그라데이션 디자인",
      stopsLabel:    "정지점",
      position:      "위치 (%)",
      opacity:       "불투명도 (%)",
      addStop:       "정지점 추가",
      removeStop:    "제거",
      namePlaceholder:"내 그라데이션",
      download:      "그라데이션 다운로드",
      editorSection: "편집",
    },
    create: {
      pageTitle:     "그라데이션 생성기",
      heroSubtitle:  "시각적으로 그라데이션을 디자인하고 GIMP 및 Krita용 .GGR 파일로 내보냅니다.",
      editorTitle:   "그라데이션 편집기",
      dragHint:      "핸들을 드래그하여 재배치 · 막대를 클릭하여 정지점 추가",
      selectedStop:  "선택된 정지점",
      clickBar:      "위",
      previewTitle:  "라이브 미리보기",
      imageBy:       "이미지 제공:",
      from:          "출처:",
      navLink:       "업로드 변환기로 돌아가기",
      dragDelete:    "아래로 드래그하여 삭제",
    },
  },

  // ── ENGLISH ──────────────────────────────────────────────────────────────
  en: {
    nav: {
      generate:      "Generate .GGR",
      generating:    "Generating…",
      noFiles:       "No converted files yet",
      converter:     "Converter",
      createGradient:"Create Gradient",
    },

    hero: {
      badge:      "",
      title1:     "Convert Photoshop",
      title2:     "gradients to GIMP & Krita",
      subtitle:   "Drop any .GRD file and instantly get a ready-to-use .GGR — or build one from scratch with the editor below.",
      step1Title: "Drop",
      step1Desc:  "Upload one or more .GRD files",
      step2Title: "Convert",
      step2Desc:  "Parsed locally, zero network requests",
      step3Title: "Download",
      step3Desc:  "Get your .GGR file instantly",
    },
    dropzone: {
      idleTitle:    "Drop your .GRD files here",
      idleSub:      "or click to browse",
      idleCaption:  "Photoshop gradient files · Multiple files supported",
      draggingTitle:"Release to add files",
      draggingSub:  "Drop to queue your .GRD gradient files",
      hasFilesTitle:"Files loaded",
      hasFilesSub:  "Drop more or click to browse",
      errorTitle:   "Unsupported file type",
      errorDismiss: "Dismiss",
    },
    list: {
      filesLoaded:    (n) => `${n} file${n !== 1 ? "s" : ""} loaded`,
      converted:      (n) => `${n} converted`,
      downloadAll:    "Download all",
      convertAll:     "Convert & Download",
      convert:        "Convert",
      gradients:      (n) => `${n} gradient${n !== 1 ? "s" : ""}`,
      gradientsFound: (n) => `${n} gradient${n !== 1 ? "s" : ""} found`,
      remove:         "Remove",
      error:          "Error",
      download:       "Download .ggr",
      preview:        "Preview",
    },
    modal: {
      title:         "Live Preview",
      close:         "Close",
      download:      "Download .GGR",
      gradientLabel: "Gradient",
      stopsLabel:    "colour stops",
    },
    footer: {
      made: "Made with ❤️ by",
    },
    editor: {
      title:          "Gradient Creator",
      subtitle:       "Build and export a custom .GGR gradient",
      stopsLabel:     "Colour Stops",
      position:       "Position",
      opacity:        "Opacity",
      addStop:        "Add colour stop",
      removeStop:     "Remove stop",
      namePlaceholder:"Gradient name",
      download:       "Download .GGR",
      editorSection:  "Creator",
    },
    create: {
      pageTitle:     "Gradient Creator",
      heroSubtitle:  "Design a gradient visually and export it as a .GGR file for GIMP & Krita.",
      editorTitle:   "Gradient Editor",
      dragHint:      "Drag handles · Click bar to add stops",
      selectedStop:  "Selected Stop",
      clickBar:      "Click the bar to add a new stop",
      previewTitle:  "Live Preview",
      imageBy:       "Image by",
      from:          "from",
      navLink:       "Create Gradient",
      dragDelete:    "Drag down to delete",
    },
  },

  // ── SPANISH ──────────────────────────────────────────────────────────────
  es: {
    nav: {
      generate:      "Generar .GGR",
      generating:    "Generando…",
      noFiles:       "Sin archivos convertidos aún",
      converter:     "Conversor",
      createGradient:"Crear Degradado",
    },

    hero: {
      badge:      "",
      title1:     "Convierte degradados",
      title2:     "de Photoshop a GIMP & Krita",
      subtitle:   "Arrastra cualquier .GRD y obtén un .GGR al instante — o créalo desde cero con el editor.",
      step1Title: "Arrastra",
      step1Desc:  "Sube uno o varios archivos .GRD",
      step2Title: "Convierte",
      step2Desc:  "Procesado localmente, sin red",
      step3Title: "Descarga",
      step3Desc:  "Obtén tu .GGR al instante",
    },
    dropzone: {
      idleTitle:    "Suelta tus archivos .GRD aquí",
      idleSub:      "o haz clic para explorar",
      idleCaption:  "Archivos de degradado Photoshop · Múltiples archivos",
      draggingTitle:"Suelta para agregar",
      draggingSub:  "Suelta tus archivos .GRD",
      hasFilesTitle:"Archivos cargados",
      hasFilesSub:  "Suelta más o haz clic para explorar",
      errorTitle:   "Tipo de archivo no soportado",
      errorDismiss: "Descartar",
    },
    list: {
      filesLoaded:    (n) => `${n} archivo${n !== 1 ? "s" : ""} cargado${n !== 1 ? "s" : ""}`,
      converted:      (n) => `${n} convertido${n !== 1 ? "s" : ""}`,
      downloadAll:    "Descargar todo",
      convertAll:     "Convertir y Descargar",
      convert:        "Convertir",
      gradients:      (n) => `${n} degradado${n !== 1 ? "s" : ""}`,
      gradientsFound: (n) => `${n} degradado${n !== 1 ? "s" : ""} encontrado${n !== 1 ? "s" : ""}`,
      remove:         "Eliminar",
      error:          "Error",
      download:       "Descargar .ggr",
      preview:        "Vista previa",
    },
    modal: {
      title:         "Vista Previa en Vivo",
      close:         "Cerrar",
      download:      "Descargar .GGR",
      gradientLabel: "Degradado",
      stopsLabel:    "puntos de color",
    },
    footer: {
      made: "Diseñado con ❤️ por",
    },
    editor: {
      title:          "Creador de Degradados",
      subtitle:       "Construye y exporta un degradado .GGR personalizado",
      stopsLabel:     "Puntos de Color",
      position:       "Posición",
      opacity:        "Opacidad",
      addStop:        "Agregar punto de color",
      removeStop:     "Eliminar punto",
      namePlaceholder:"Nombre del degradado",
      download:       "Descargar .GGR",
      editorSection:  "Creador",
    },
    create: {
      pageTitle:     "Creador de Degradados",
      heroSubtitle:  "Diseña un degradado visualmente y expórtalo como archivo .GGR para GIMP & Krita.",
      editorTitle:   "Editor de Degradados",
      dragHint:      "Arrastra puntos · Haz clic en la barra para agregar",
      selectedStop:  "Punto Seleccionado",
      clickBar:      "Haz clic en la barra para agregar un nuevo punto",
      previewTitle:  "Vista Previa en Vivo",
      imageBy:       "Imagen de",
      from:          "en",
      navLink:       "Crear Degradado",
      dragDelete:    "Arrastra hacia abajo para eliminar",
    },
  },

  // ── PORTUGUESE ───────────────────────────────────────────────────────────
  pt: {
    nav: {
      generate:      "Gerar .GGR",
      generating:    "Gerando…",
      noFiles:       "Nenhum arquivo convertido ainda",
      converter:     "Conversor",
      createGradient:"Criar Gradiente",
    },

    hero: {
      badge:      "",
      title1:     "Converta degradês",
      title2:     "do Photoshop para GIMP & Krita",
      subtitle:   "Arraste qualquer .GRD e obtenha um .GGR instantaneamente — ou crie um do zero no editor.",
      step1Title: "Arraste",
      step1Desc:  "Envie um ou mais arquivos .GRD",
      step2Title: "Converta",
      step2Desc:  "Processado localmente, sem rede",
      step3Title: "Baixe",
      step3Desc:  "Obtenha seu .GGR instantaneamente",
    },
    dropzone: {
      idleTitle:    "Solte seus arquivos .GRD aqui",
      idleSub:      "ou clique para navegar",
      idleCaption:  "Arquivos de gradiente Photoshop · Múltiplos arquivos",
      draggingTitle:"Solte para adicionar",
      draggingSub:  "Solte seus arquivos .GRD",
      hasFilesTitle:"Arquivos carregados",
      hasFilesSub:  "Solte mais ou clique para navegar",
      errorTitle:   "Tipo de arquivo não suportado",
      errorDismiss: "Descartar",
    },
    list: {
      filesLoaded:    (n) => `${n} arquivo${n !== 1 ? "s" : ""} carregado${n !== 1 ? "s" : ""}`,
      converted:      (n) => `${n} convertido${n !== 1 ? "s" : ""}`,
      downloadAll:    "Baixar tudo",
      convertAll:     "Converter e Baixar",
      convert:        "Converter",
      gradients:      (n) => `${n} gradiente${n !== 1 ? "s" : ""}`,
      gradientsFound: (n) => `${n} gradiente${n !== 1 ? "s" : ""} encontrado${n !== 1 ? "s" : ""}`,
      remove:         "Remover",
      error:          "Erro",
      download:       "Baixar .ggr",
      preview:        "Pré-visualizar",
    },
    modal: {
      title:         "Pré-visualização ao Vivo",
      close:         "Fechar",
      download:      "Baixar .GGR",
      gradientLabel: "Gradiente",
      stopsLabel:    "paradas de cor",
    },
    footer: {
      made: "Feito com ❤️ por",
    },
    editor: {
      title:          "Criador de Gradientes",
      subtitle:       "Construa e exporte um gradiente .GGR personalizado",
      stopsLabel:     "Paradas de Cor",
      position:       "Posição",
      opacity:        "Opacidade",
      addStop:        "Adicionar parada de cor",
      removeStop:     "Remover parada",
      namePlaceholder:"Nome do gradiente",
      download:       "Baixar .GGR",
      editorSection:  "Criador",
    },
    create: {
      pageTitle:     "Criador de Gradientes",
      heroSubtitle:  "Projete um gradiente visualmente e exporte como .GGR para GIMP & Krita.",
      editorTitle:   "Editor de Gradientes",
      dragHint:      "Arraste pontos · Clique na barra para adicionar",
      selectedStop:  "Ponto Selecionado",
      clickBar:      "Clique na barra para adicionar um novo ponto",
      previewTitle:  "Pré-visualização ao Vivo",
      imageBy:       "Imagem de",
      from:          "de",
      navLink:       "Criar Gradiente",
      dragDelete:    "Arraste para baixo para excluir",
    },
  },

  // ── CHINESE ──────────────────────────────────────────────────────────────
  zh: {
    nav: {
      generate:      "生成 .GGR",
      generating:    "生成中…",
      noFiles:       "尚无已转换文件",
      converter:     "转换器",
      createGradient:"创建渐变",
    },

    hero: {
      badge:      "",
      title1:     "转换 Photoshop 渐变",
      title2:     "至 GIMP & Krita 格式",
      subtitle:   "拖入任意 .GRD 文件立即获得 .GGR，或使用下方编辑器从头创建。",
      step1Title: "拖入",
      step1Desc:  "上传一个或多个 .GRD 文件",
      step2Title: "转换",
      step2Desc:  "本地解析，无网络请求",
      step3Title: "下载",
      step3Desc:  "立即获得您的 .GGR 文件",
    },
    dropzone: {
      idleTitle:    "将 .GRD 文件拖放至此",
      idleSub:      "或点击浏览",
      idleCaption:  "Photoshop 渐变文件 · 支持多文件",
      draggingTitle:"松开以添加文件",
      draggingSub:  "放下您的 .GRD 渐变文件",
      hasFilesTitle:"文件已加载",
      hasFilesSub:  "继续拖入或点击浏览",
      errorTitle:   "不支持的文件类型",
      errorDismiss: "关闭",
    },
    list: {
      filesLoaded:    (n) => `已加载 ${n} 个文件`,
      converted:      (n) => `已转换 ${n} 个`,
      downloadAll:    "全部下载",
      convertAll:     "转换并下载",
      convert:        "转换",
      gradients:      (n) => `${n} 个渐变`,
      gradientsFound: (n) => `找到 ${n} 个渐变`,
      remove:         "删除",
      error:          "错误",
      download:       "下载 .ggr",
      preview:        "预览",
    },
    modal: {
      title:         "实时预览",
      close:         "关闭",
      download:      "下载 .GGR",
      gradientLabel: "渐变",
      stopsLabel:    "颜色节点",
    },
    footer: {
      made: "使用 ❤️ 制作，由",
    },
    editor: {
      title:          "渐变创建器",
      subtitle:       "创建并导出自定义 .GGR 渐变",
      stopsLabel:     "颜色节点",
      position:       "位置",
      opacity:        "不透明度",
      addStop:        "添加颜色节点",
      removeStop:     "删除节点",
      namePlaceholder:"渐变名称",
      download:       "下载 .GGR",
      editorSection:  "创建器",
    },
    create: {
      pageTitle:     "渐变创建器",
      heroSubtitle:  "可视化设计渐变并导出为 GIMP & Krita 的 .GGR 文件。",
      editorTitle:   "渐变编辑器",
      dragHint:      "拖动节点 · 点击条以添加",
      selectedStop:  "已选节点",
      clickBar:      "点击条添加新节点",
      previewTitle:  "实时预览",
      imageBy:       "图片来自",
      from:          "来自",
      navLink:       "创建渐变",
      dragDelete:    "向下拖动以删除",
    },
  },

  // ── JAPANESE ─────────────────────────────────────────────────────────────
  ja: {
    nav: {
      generate:      ".GGR を生成",
      generating:    "生成中…",
      noFiles:       "変換済みファイルなし",
      converter:     "コンバーター",
      createGradient:"グラデーション作成",
    },

    hero: {
      badge:      "",
      title1:     "Photoshop グラデーションを",
      title2:     "GIMP & Krita 用に変換",
      subtitle:   ".GRD をドロップして即座に .GGR を取得、またはエディタで一から作成できます。",
      step1Title: "ドロップ",
      step1Desc:  ".GRD ファイルをアップロード",
      step2Title: "変換",
      step2Desc:  "ローカル処理、通信なし",
      step3Title: "ダウンロード",
      step3Desc:  ".GGR を即座に取得",
    },
    dropzone: {
      idleTitle:    ".GRD ファイルをここにドロップ",
      idleSub:      "またはクリックして選択",
      idleCaption:  "Photoshopグラデーションファイル · 複数ファイル対応",
      draggingTitle:"放してファイルを追加",
      draggingSub:  ".GRD グラデーションファイルをドロップ",
      hasFilesTitle:"ファイルを読み込みました",
      hasFilesSub:  "さらにドロップまたはクリックして選択",
      errorTitle:   "非対応のファイル形式",
      errorDismiss: "閉じる",
    },
    list: {
      filesLoaded:    (n) => `${n} ファイル読み込み済み`,
      converted:      (n) => `${n} 件変換済み`,
      downloadAll:    "すべてダウンロード",
      convertAll:     "変換してダウンロード",
      convert:        "変換",
      gradients:      (n) => `グラデーション ${n} 件`,
      gradientsFound: (n) => `${n} 件のグラデーションを検出`,
      remove:         "削除",
      error:          "エラー",
      download:       ".ggr をダウンロード",
      preview:        "プレビュー",
    },
    modal: {
      title:         "ライブプレビュー",
      close:         "閉じる",
      download:      ".GGR をダウンロード",
      gradientLabel: "グラデーション",
      stopsLabel:    "カラーストップ",
    },
    footer: {
      made: "❤️ を込めて制作 by",
    },
    editor: {
      title:          "グラデーション作成ツール",
      subtitle:       "カスタム .GGR グラデーションを作成してエクスポート",
      stopsLabel:     "カラーストップ",
      position:       "位置",
      opacity:        "不透明度",
      addStop:        "カラーストップを追加",
      removeStop:     "ストップを削除",
      namePlaceholder:"グラデーション名",
      download:       ".GGR をダウンロード",
      editorSection:  "作成ツール",
    },
    create: {
      pageTitle:     "グラデーション作成",
      heroSubtitle:  "グラデーションを視覚的にデザインし、GIMP & Krita 用 .GGR ファイルとしてエクスポート。",
      editorTitle:   "グラデーションエディタ",
      dragHint:      "ハンドルをドラッグ · バーをクリックして追加",
      selectedStop:  "選択中のストップ",
      clickBar:      "バーをクリックして新しいストップを追加",
      previewTitle:  "ライブプレビュー",
      imageBy:       "画像提供：",
      from:          "バイ",
      navLink:       "グラデーション作成",
      dragDelete:    "下にドラッグして削除",
    },
  },

  // ── ARABIC (RTL) ─────────────────────────────────────────────────────────
  ar: {
    nav: {
      generate:      "توليد .GGR",
      generating:    "جارٍ التوليد…",
      noFiles:       "لا توجد ملفات محوّلة بعد",
      converter:     "المحوّل",
      createGradient:"إنشاء تدرج",
    },
    hero: {
      badge:      "",
      title1:     "حوّل تدرجات Photoshop",
      title2:     "إلى تنسيق GIMP & Krita",
      subtitle:   "اسحب أي ملف .GRD للحصول على .GGR فوراً — أو أنشئ تدرجاً من الصفر باستخدام المحرر.",
      step1Title: "أسقط",
      step1Desc:  "ارفع ملفاً أو أكثر بصيغة .GRD",
      step2Title: "حوّل",
      step2Desc:  "معالجة محلية، بدون إنترنت",
      step3Title: "حمّل",
      step3Desc:  "احصل على ملف .GGR فوراً",
    },
    dropzone: {
      idleTitle:    "أسقط ملفات .GRD هنا",
      idleSub:      "أو انقر للتصفح",
      idleCaption:  "ملفات تدرج Photoshop · دعم ملفات متعددة",
      draggingTitle:"أفلت الملفات لإضافتها",
      draggingSub:  "أسقط ملفات .GRD الخاصة بك",
      hasFilesTitle:"تم تحميل الملفات",
      hasFilesSub:  "أسقط المزيد أو انقر للتصفح",
      errorTitle:   "نوع ملف غير مدعوم",
      errorDismiss: "رفض",
    },
    list: {
      filesLoaded:    (n) => `${n} ملف${n !== 1 ? "" : ""} محمّل`,
      converted:      (n) => `${n} محوّل`,
      downloadAll:    "تحميل الكل",
      convertAll:     "تحويل وتحميل",
      convert:        "تحويل",
      gradients:      (n) => `${n} تدرج`,
      gradientsFound: (n) => `تم العثور على ${n} تدرج`,
      remove:         "إزالة",
      error:          "خطأ",
      download:       "تحميل .ggr",
      preview:        "معاينة",
    },
    modal: {
      title:         "معاينة حية",
      close:         "إغلاق",
      download:      "تحميل .GGR",
      gradientLabel: "التدرج",
      stopsLabel:    "نقاط اللون",
    },
    footer: {
      made: "صُنع بـ ❤️ بواسطة",
    },
    editor: {
      title:          "منشئ التدرجات",
      subtitle:       "أنشئ وصدّر تدرجاً مخصصاً بصيغة .GGR",
      stopsLabel:     "نقاط اللون",
      position:       "الموضع",
      opacity:        "الشفافية",
      addStop:        "إضافة نقطة لون",
      removeStop:     "حذف النقطة",
      namePlaceholder:"اسم التدرج",
      download:       "تحميل .GGR",
      editorSection:  "المنشئ",
    },
    create: {
      pageTitle:     "منشئ التدرجات",
      heroSubtitle:  "صمّم تدرجاً بشكل مرئي وصدّره كملف .GGR للاستخدام في GIMP & Krita.",
      editorTitle:   "محرر التدرج",
      dragHint:      "اسحب النقاط · انقر على الشريط لإضافة",
      selectedStop:  "النقطة المحددة",
      clickBar:      "انقر على الشريط لإضافة نقطة جديدة",
      previewTitle:  "معاينة حية",
      imageBy:       "صورة لـ",
      from:          "من",
      navLink:       "إنشاء تدرج",
      dragDelete:    "اسحب لأسفل للحذف",
    },
  },

  // ── HINDI ────────────────────────────────────────────────────────────────
  hi: {
    nav: {
      generate:      ".GGR बनाएं",
      generating:    "बना रहे हैं…",
      noFiles:       "अभी कोई परिवर्तित फ़ाइल नहीं",
      converter:     "कन्वर्टर",
      createGradient:"ग्रेडिएंट बनाएं",
    },
    hero: {
      badge:      "",
      title1:     "Photoshop ग्रेडिएंट को",
      title2:     "GIMP & Krita में बदलें",
      subtitle:   "कोई भी .GRD फ़ाइल छोड़ें और तुरंत .GGR पाएं — या नीचे दिए एडिटर से खुद बनाएं।",
      step1Title: "डालें",
      step1Desc:  "एक या अधिक .GRD फ़ाइलें अपलोड करें",
      step2Title: "बदलें",
      step2Desc:  "स्थानीय प्रोसेसिंग, कोई नेटवर्क नहीं",
      step3Title: "डाउनलोड करें",
      step3Desc:  "तुरंत अपनी .GGR फ़ाइल पाएं",
    },
    dropzone: {
      idleTitle:    "अपनी .GRD फ़ाइलें यहाँ छोड़ें",
      idleSub:      "या ब्राउज़ करने के लिए क्लिक करें",
      idleCaption:  "Photoshop ग्रेडिएंट फ़ाइलें · कई फ़ाइलें समर्थित",
      draggingTitle:"फ़ाइलें जोड़ने के लिए छोड़ें",
      draggingSub:  "अपनी .GRD फ़ाइलें छोड़ें",
      hasFilesTitle:"फ़ाइलें लोड हो गईं",
      hasFilesSub:  "और छोड़ें या ब्राउज़ के लिए क्लिक करें",
      errorTitle:   "असमर्थित फ़ाइल प्रकार",
      errorDismiss: "खारिज करें",
    },
    list: {
      filesLoaded:    (n) => `${n} फ़ाइल${n !== 1 ? "ें" : ""} लोड हुई`,
      converted:      (n) => `${n} परिवर्तित`,
      downloadAll:    "सब डाउनलोड करें",
      convertAll:     "बदलें और डाउनलोड करें",
      convert:        "बदलें",
      gradients:      (n) => `${n} ग्रेडिएंट`,
      gradientsFound: (n) => `${n} ग्रेडिएंट मिले`,
      remove:         "हटाएं",
      error:          "त्रुटि",
      download:       ".ggr डाउनलोड करें",
      preview:        "पूर्वावलोकन",
    },
    modal: {
      title:         "लाइव पूर्वावलोकन",
      close:         "बंद करें",
      download:      ".GGR डाउनलोड करें",
      gradientLabel: "ग्रेडिएंट",
      stopsLabel:    "रंग बिंदु",
    },
    footer: {
      made: "❤️ के साथ बनाया द्वारा",
    },
    editor: {
      title:          "ग्रेडिएंट निर्माता",
      subtitle:       "कस्टम .GGR ग्रेडिएंट बनाएं और एक्सपोर्ट करें",
      stopsLabel:     "रंग बिंदु",
      position:       "स्थिति",
      opacity:        "अपारदर्शिता",
      addStop:        "रंग बिंदु जोड़ें",
      removeStop:     "बिंदु हटाएं",
      namePlaceholder:"ग्रेडिएंट का नाम",
      download:       ".GGR डाउनलोड करें",
      editorSection:  "निर्माता",
    },
    create: {
      pageTitle:     "ग्रेडिएंट निर्माता",
      heroSubtitle:  "ग्रेडिएंट विजुअली रूप से डिज़ाइन करें और GIMP & Krita के लिए .GGR फ़ाइल के रूप में विनिर्यात करें।",
      editorTitle:   "ग्रेडिएंट एडिटर",
      dragHint:      "बिंदुओं को खींचें · नया जोड़ने के लिए बार पर क्लिक करें",
      selectedStop:  "चयनित बिंदु",
      clickBar:      "नया बिंदु जोड़ने के लिए बार पर क्लिक करें",
      previewTitle:  "लाइव पूर्वावलोकन",
      imageBy:       "चित्र",
      from:          "द्वारा",
      navLink:       "ग्रेडिएंट बनाएं",
      dragDelete:    "हटाने के लिए नीचे खींचें",
    },
  },
};
