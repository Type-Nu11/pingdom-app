// Static UI copy only. These strings are NOT downloadable translation models.
const en = {
  originalMode: 'Showing the Korean original',
  language: 'Translation language', choose: 'Choose language', download: 'Download over Wi-Fi',
  close: 'Close', ready: 'Available offline', needsDownload: 'Language pack required',
  downloading: 'Downloading models… (Wi-Fi required)', checking: 'Checking models…', translating: 'Translating…',
  failed: 'Failed. Please retry.', unavailable: 'Offline translation is unavailable in this app build.',
  notice: 'Machine translation · May differ from the official name.', estimate: 'Estimated size',
  wifi: 'Wi-Fi required. After download, the text translates automatically.', missing: 'Required models',
  retry: 'Check again', remove: 'Delete model', shared: 'Korean is shared by all translation languages.',
};
type Copy = Record<keyof typeof en, string>;
const ko: Copy = {
  originalMode: '한국어 원문을 표시합니다.',
  language: '번역 언어', choose: '언어 선택', download: 'Wi-Fi로 다운로드', close: '닫기',
  ready: '오프라인 번역 가능', needsDownload: '언어팩 다운로드 필요', downloading: '언어팩 다운로드 중… (Wi-Fi 필요)',
  checking: '언어팩 확인 중…', translating: '번역 중…', failed: '실패했습니다. 다시 시도해 주세요.',
  unavailable: '이 앱 빌드에서는 오프라인 번역을 사용할 수 없습니다.', notice: '기계 번역 · 공식 외국어 명칭과 다를 수 있습니다.',
  estimate: '예상 용량', wifi: 'Wi-Fi가 필요합니다. 다운로드 후 텍스트가 자동 번역됩니다.', missing: '필요한 모델',
  retry: '다시 확인', remove: '모델 삭제', shared: '한국어 모델은 모든 번역 언어에서 함께 사용합니다.',
};
const ja: Copy = {
  originalMode: '韓国語の原文を表示しています',
  language: '翻訳言語', choose: '言語を選択', download: 'Wi-Fiでダウンロード', close: '閉じる', ready: 'オフラインで利用可能',
  needsDownload: '言語パックが必要です', downloading: '言語パックをダウンロード中…（Wi-Fiが必要）', checking: '言語パックを確認中…', translating: '翻訳中…',
  failed: '失敗しました。再試行してください。', unavailable: 'このビルドではオフライン翻訳を利用できません。',
  notice: '機械翻訳 · 正式な名称と異なる場合があります。', estimate: '推定容量', wifi: 'Wi-Fiが必要です。完了後、テキストは自動で翻訳されます。',
  missing: '必要なモデル', retry: '再確認', remove: 'モデルを削除', shared: '韓国語モデルはすべての翻訳言語で共有されます。',
};
const zhCN: Copy = {
  originalMode: '显示韩语原文',
  language: '翻译语言', choose: '选择语言', download: '通过 Wi-Fi 下载', close: '关闭', ready: '可离线使用',
  needsDownload: '需要语言包', downloading: '正在下载语言包…（需要 Wi-Fi）', checking: '正在检查语言包…', translating: '正在翻译…',
  failed: '失败，请重试。', unavailable: '此版本无法使用离线翻译。', notice: '机器翻译 · 可能与官方名称不同。',
  estimate: '预计大小', wifi: '需要 Wi-Fi。下载后将自动翻译文字。', missing: '所需模型', retry: '重新检查', remove: '删除模型', shared: '韩语模型由所有翻译语言共用。',
};
const zhTW: Copy = {
  originalMode: '顯示韓語原文',
  language: '翻譯語言', choose: '選擇語言', download: '透過 Wi-Fi 下載', close: '關閉', ready: '可離線使用',
  needsDownload: '需要語言套件', downloading: '正在下載語言套件…（需要 Wi-Fi）', checking: '正在檢查語言套件…', translating: '正在翻譯…',
  failed: '失敗，請重試。', unavailable: '此版本無法使用離線翻譯。', notice: '機器翻譯 · 可能與官方名稱不同。',
  estimate: '預估大小', wifi: '需要 Wi-Fi。下載後將自動翻譯文字。', missing: '所需模型', retry: '重新檢查', remove: '刪除模型', shared: '韓語模型由所有翻譯語言共用。',
};
const vi: Copy = {
  originalMode: 'Đang hiển thị bản gốc tiếng Hàn',
  language: 'Ngôn ngữ dịch', choose: 'Chọn ngôn ngữ', download: 'Tải qua Wi-Fi', close: 'Đóng', ready: 'Có thể dùng ngoại tuyến',
  needsDownload: 'Cần gói ngôn ngữ', downloading: 'Đang tải gói ngôn ngữ… (cần Wi-Fi)', checking: 'Đang kiểm tra gói ngôn ngữ…', translating: 'Đang dịch…',
  failed: 'Thất bại. Vui lòng thử lại.', unavailable: 'Bản dựng này không hỗ trợ dịch ngoại tuyến.', notice: 'Bản dịch máy · Có thể khác tên chính thức.',
  estimate: 'Dung lượng ước tính', wifi: 'Cần Wi-Fi. Văn bản được dịch tự động sau khi tải.', missing: 'Mô hình cần thiết', retry: 'Kiểm tra lại', remove: 'Xóa mô hình', shared: 'Mô hình tiếng Hàn được dùng chung cho mọi ngôn ngữ dịch.',
};
const es: Copy = {
  originalMode: 'Mostrando el original en coreano',
  language: 'Idioma de traducción', choose: 'Elegir idioma', download: 'Descargar por Wi-Fi', close: 'Cerrar', ready: 'Disponible sin conexión',
  needsDownload: 'Se necesita un paquete de idioma', downloading: 'Descargando modelos… (requiere Wi-Fi)', checking: 'Comprobando modelos…', translating: 'Traduciendo…',
  failed: 'Error. Inténtalo de nuevo.', unavailable: 'La traducción sin conexión no está disponible en esta versión.', notice: 'Traducción automática · Puede diferir del nombre oficial.',
  estimate: 'Tamaño estimado', wifi: 'Requiere Wi-Fi. Tras descargar, el texto se traduce automáticamente.', missing: 'Modelos necesarios', retry: 'Comprobar de nuevo', remove: 'Eliminar modelo', shared: 'El modelo de coreano se comparte entre todos los idiomas.',
};
const pt: Copy = {
  originalMode: 'Exibindo o original em coreano',
  language: 'Idioma de tradução', choose: 'Escolher idioma', download: 'Baixar por Wi-Fi', close: 'Fechar', ready: 'Disponível offline',
  needsDownload: 'Pacote de idioma necessário', downloading: 'Baixando modelos… (requer Wi-Fi)', checking: 'Verificando modelos…', translating: 'Traduzindo…',
  failed: 'Falha. Tente novamente.', unavailable: 'A tradução offline não está disponível nesta versão.', notice: 'Tradução automática · Pode diferir do nome oficial.',
  estimate: 'Tamanho estimado', wifi: 'Requer Wi-Fi. Após baixar, o texto será traduzido automaticamente.', missing: 'Modelos necessários', retry: 'Verificar novamente', remove: 'Excluir modelo', shared: 'O modelo de coreano é compartilhado por todos os idiomas.',
};
const th: Copy = {
  originalMode: 'แสดงต้นฉบับภาษาเกาหลี',
  language: 'ภาษาที่แปล', choose: 'เลือกภาษา', download: 'ดาวน์โหลดผ่าน Wi-Fi', close: 'ปิด', ready: 'ใช้งานออฟไลน์ได้',
  needsDownload: 'ต้องใช้ชุดภาษา', downloading: 'กำลังดาวน์โหลดชุดภาษา… (ต้องใช้ Wi-Fi)', checking: 'กำลังตรวจสอบชุดภาษา…', translating: 'กำลังแปล…',
  failed: 'ไม่สำเร็จ โปรดลองอีกครั้ง', unavailable: 'แอปรุ่นนี้ไม่รองรับการแปลออฟไลน์', notice: 'คำแปลจากเครื่อง · อาจแตกต่างจากชื่อทางการ',
  estimate: 'ขนาดโดยประมาณ', wifi: 'ต้องใช้ Wi-Fi ข้อความจะแปลอัตโนมัติหลังดาวน์โหลด', missing: 'โมเดลที่ต้องใช้', retry: 'ตรวจสอบอีกครั้ง', remove: 'ลบโมเดล', shared: 'ทุกภาษาใช้โมเดลภาษาเกาหลีร่วมกัน',
};
const copies: Record<string, Copy> = { en, ko, ja, 'zh-CN': zhCN, 'zh-TW': zhTW, vi, es, 'pt-BR': pt, pt, th };
export const getTranslationCopy = (uiLanguage: string): Copy => copies[uiLanguage] ?? copies[uiLanguage.split('-')[0]] ?? en;

const manageHints: Record<string, string> = {
  en: 'Touch and hold the place name to view the original and manage the translation language and models.',
  ko: '장소명을 길게 눌러 원문을 확인하고 번역 언어와 언어팩을 관리합니다.',
  ja: '場所名を長押しすると原文の確認や翻訳言語と言語パックの管理ができます。',
  'zh-CN': '长按地点名称可查看原文并管理翻译语言和语言包。',
  'zh-TW': '長按地點名稱可查看原文並管理翻譯語言和語言套件。',
  vi: 'Nhấn giữ tên địa điểm để xem bản gốc và quản lý ngôn ngữ, mô hình dịch.',
  es: 'Mantén pulsado el nombre del lugar para ver el original y gestionar el idioma y los modelos.',
  'pt-BR': 'Toque e segure o nome do lugar para ver o original e gerenciar o idioma e os modelos.',
  th: 'แตะชื่อสถานที่ค้างเพื่อดูต้นฉบับและจัดการภาษาแปลกับชุดภาษา',
};
export const getTranslationManageHint = (language: string): string => manageHints[language] ?? manageHints[language.split('-')[0]] ?? manageHints.en;
